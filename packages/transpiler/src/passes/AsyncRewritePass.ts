import ts from 'typescript';
import type EmitterContextBase from '../EmitterContextBase';
import * as cs from '../ir/Ir';
import { hasTag, JsDocTag } from '../jsDocTags';
import { AlphaTabCore, TsBuiltin } from '../typeRegistry';
import type { IrPass } from './IrPass';

/**
 * Bidirectional Promise/Deferred bridging for the Kotlin target.
 *
 * Kotlin emits TypeScript `async` functions as `suspend` functions and
 * lowers `await x` to a regular method call. That mismatches the
 * `Promise<T>` / `Deferred<T>` runtime distinction in two directions:
 *
 *  1. **Caller side** — when an async function's result is *not*
 *     awaited (e.g. `asyncFn().then().catch()`), the call site must
 *     adapt the suspend invocation into a `Deferred<T>` by wrapping
 *     it in `alphaTab.core.TypeHelper.suspendToDeferred { ... }`.
 *
 *  2. **Callee side** — when an `await` consumes a non-suspend method
 *     whose return type is `Promise<T>` (typically a foreign interface
 *     that already returns a `Deferred<T>`), the invocation must call
 *     `.await()` so the suspend block sees the unwrapped value.
 *
 * The old call-site logic lived at the bottom of
 * `KotlinAstTransformer.visitCallExpression`. It was already purely
 * local — the decision is per-invocation and uses only TS symbol /
 * type info attached to the call expression — but it ran mid-transform,
 * which mixed structural translation with target-specific lowering.
 *
 * This pass walks every IR node once after transform, finds every
 * `InvocationExpression` whose `tsNode` is a `ts.CallExpression`,
 * replays the same predicate against `context.typeChecker`, and
 * mutates the invocation in place:
 *
 *  - **Wrap**: rewrite the invocation's `expression` / `arguments` to
 *    point at `suspendToDeferred { <inner-invocation> }`. The original
 *    callee + arguments are moved into a freshly allocated inner
 *    `InvocationExpression` (preserving parent-chain identity for the
 *    consumer slot).
 *  - **Await**: rewrite the invocation's `expression` to
 *    `<inner-invocation>.await` and clear `arguments`.
 *
 * Wired into the Kotlin pipeline only. C# has no Promise/Deferred
 * distinction.
 */
export class AsyncRewritePass implements IrPass {
    public readonly name = 'async-rewrite';

    public run(files: readonly cs.SourceFile[], context: EmitterContextBase): void {
        // Iterative DFS. The `seen` set is shared across files because
        // Kotlin partial-class re-registration causes a single
        // `InvocationExpression` JS object to be reachable from
        // multiple `SourceFile`s; without the shared dedupe we would
        // wrap the same node once per containing file.
        const candidates: cs.InvocationExpression[] = [];
        const awaitedNonInvocations: cs.AwaitExpression[] = [];
        const seen = new Set<cs.Node>();
        for (const file of files) {
            const stack: cs.Node[] = [file];
            while (stack.length > 0) {
                const node = stack.pop()!;
                if (seen.has(node)) {
                    continue;
                }
                seen.add(node);

                if (
                    cs.isInvocationExpression(node) &&
                    node.tsNode &&
                    (ts.isCallExpression(node.tsNode) || ts.isNewExpression(node.tsNode))
                ) {
                    candidates.push(node);
                } else if (cs.isAwaitExpression(node) && !cs.isInvocationExpression(node.expression)) {
                    // `await x.promise`, `await variable`, etc. — operand is a
                    // non-invocation expression that still carries a `Promise<T>`
                    // type at the TS level. Handled separately because the
                    // in-place mutation strategy used for invocations doesn't
                    // apply (nodeType cannot change).
                    awaitedNonInvocations.push(node);
                }

                for (const key of Object.getOwnPropertyNames(node)) {
                    if (
                        key === 'parent' ||
                        key === 'tsNode' ||
                        key === 'tsType' ||
                        key === 'tsSymbol' ||
                        key === 'resolved' ||
                        key === 'resolve'
                    ) {
                        continue;
                    }
                    const value = (node as unknown as Record<string, unknown>)[key];
                    if (!value) {
                        continue;
                    }
                    if (Array.isArray(value)) {
                        for (const item of value) {
                            if (item && typeof item === 'object' && 'nodeType' in item) {
                                stack.push(item as cs.Node);
                            }
                        }
                    } else if (typeof value === 'object' && 'nodeType' in (value as object)) {
                        stack.push(value as cs.Node);
                    }
                }
            }
        }

        for (const invocation of candidates) {
            this._rewrite(invocation, context);
        }
        for (const awaitExpr of awaitedNonInvocations) {
            this._rewriteAwaitedOperand(awaitExpr, context);
        }
    }

    private _rewrite(invocation: cs.InvocationExpression, context: EmitterContextBase): void {
        const expression = invocation.tsNode as ts.CallExpression | ts.NewExpression;
        const returnType = context.typeChecker.getTypeAtLocation(expression);
        if (returnType?.symbol?.name !== TsBuiltin.Promise) {
            return;
        }

        const method = context.typeChecker.getSymbolAtLocation(expression.expression);
        if ((method as any)?.parent?.name === TsBuiltin.Promise) {
            // Calling `.then()` / `.catch()` on a Promise — leave alone.
            return;
        }

        const isSuspend =
            method?.valueDeclaration &&
            ((method.valueDeclaration as ts.MethodDeclaration).modifiers?.some(
                m => m.kind === ts.SyntaxKind.AsyncKeyword
            ) ||
                hasTag(method.valueDeclaration, JsDocTag.async));

        if (!ts.isAwaitExpression(expression.parent) && isSuspend) {
            this._wrapInSuspendToDeferred(invocation, context);
        } else if (ts.isAwaitExpression(expression.parent) && !isSuspend) {
            this._wrapInAwait(invocation);
        }
    }

    /**
     * Mutates `invocation` in place so that it now represents
     * `suspendToDeferred { <original-invocation> }`. The original
     * callee + arguments move into a new inner `InvocationExpression`
     * that becomes the body of the lambda. The consumer slot that
     * pointed at `invocation` still points at the same object (now the
     * wrapper).
     */
    private _wrapInSuspendToDeferred(invocation: cs.InvocationExpression, context: EmitterContextBase): void {
        const inner: cs.InvocationExpression = {
            parent: null as unknown as cs.Node,
            tsNode: invocation.tsNode,
            tsSymbol: invocation.tsSymbol,
            nodeType: cs.SyntaxKind.InvocationExpression,
            expression: invocation.expression,
            arguments: invocation.arguments,
            typeArguments: invocation.typeArguments,
            nullSafe: invocation.nullSafe
        } as cs.InvocationExpression;
        // Reparent the moved children onto the new inner invocation.
        inner.expression.parent = inner;
        for (const arg of inner.arguments) {
            arg.parent = inner;
        }

        const memberAccess: cs.MemberAccessExpression = {
            expression: {
                nodeType: cs.SyntaxKind.Identifier,
                text: context.makeTypeName(AlphaTabCore.typeHelper),
                parent: null as unknown as cs.Node
            } as cs.Identifier,
            member: context.toMethodNameCase('suspendToDeferred'),
            parent: invocation,
            nodeType: cs.SyntaxKind.MemberAccessExpression
        } as cs.MemberAccessExpression;
        (memberAccess.expression as cs.Identifier).parent = memberAccess;

        const lambda: cs.LambdaExpression = {
            nodeType: cs.SyntaxKind.LambdaExpression,
            parameters: [] as cs.ParameterDeclaration[],
            body: inner,
            parent: invocation,
            returnType: {
                nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                type: cs.PrimitiveType.Void
            } as cs.PrimitiveTypeNode
        } as cs.LambdaExpression;
        inner.parent = lambda;

        // Mutate the outer node into the wrapper. Drop the
        // TS-back-references so smart-cast / etc. helpers do not
        // re-pick this node as the original call site.
        invocation.expression = memberAccess;
        invocation.arguments = [lambda];
        invocation.typeArguments = undefined;
        invocation.nullSafe = undefined;
    }

    /**
     * Mutates `invocation` in place so that it now represents
     * `<original-invocation>.await()`. The original callee + arguments
     * move into a new inner `InvocationExpression`; the outer becomes
     * `<inner>.await()`.
     */
    private _wrapInAwait(invocation: cs.InvocationExpression): void {
        const inner: cs.InvocationExpression = {
            parent: null as unknown as cs.Node,
            tsNode: invocation.tsNode,
            tsSymbol: invocation.tsSymbol,
            nodeType: cs.SyntaxKind.InvocationExpression,
            expression: invocation.expression,
            arguments: invocation.arguments,
            typeArguments: invocation.typeArguments,
            nullSafe: invocation.nullSafe
        } as cs.InvocationExpression;
        inner.expression.parent = inner;
        for (const arg of inner.arguments) {
            arg.parent = inner;
        }

        const memberAccess: cs.MemberAccessExpression = {
            expression: inner,
            member: 'await',
            parent: invocation,
            nodeType: cs.SyntaxKind.MemberAccessExpression
        } as cs.MemberAccessExpression;
        inner.parent = memberAccess;

        invocation.expression = memberAccess;
        invocation.arguments = [];
        invocation.typeArguments = undefined;
        invocation.nullSafe = undefined;
    }

    /**
     * For an `await <non-invocation-expression>` whose operand has a
     * `Promise<T>` type at the TS level (e.g. `await x.promise`,
     * `await someVariable`), replace the `AwaitExpression.expression`
     * slot with a synthetic `<original-operand>.await()` invocation.
     */
    private _rewriteAwaitedOperand(awaitExpr: cs.AwaitExpression, context: EmitterContextBase): void {
        const operand = awaitExpr.expression;
        if (!operand.tsNode) {
            return;
        }
        const operandTsNode = operand.tsNode as ts.Expression;
        const operandType = context.typeChecker.getTypeAtLocation(operandTsNode);
        if (operandType?.symbol?.name !== TsBuiltin.Promise) {
            return;
        }

        const memberAccess: cs.MemberAccessExpression = {
            expression: operand,
            member: 'await',
            parent: null as unknown as cs.Node,
            nodeType: cs.SyntaxKind.MemberAccessExpression
        } as cs.MemberAccessExpression;

        const invocation: cs.InvocationExpression = {
            parent: awaitExpr,
            tsNode: operand.tsNode,
            nodeType: cs.SyntaxKind.InvocationExpression,
            expression: memberAccess,
            arguments: []
        } as cs.InvocationExpression;

        memberAccess.parent = invocation;
        operand.parent = memberAccess;
        awaitExpr.expression = invocation;
    }
}
