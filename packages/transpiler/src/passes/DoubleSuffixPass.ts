import type EmitterContextBase from '../EmitterContextBase';
import * as cs from '../ir/Ir';
import type { IrPass } from './IrPass';

/**
 * Lifts Kotlin's "should this numeric literal need a `.0` Double
 * suffix?" decision out of `KotlinAstPrinter.shouldWriteDoubleSuffix`
 * (49 lines of print-time AST analysis on `expr.parent`) into a
 * pass-time IR mutation.
 *
 * The pass walks every IR node once. For each `NumericLiteral` it
 * evaluates the same predicate the printer used — looking at the
 * operator on the parent binary expression, the operand on a unary
 * `~`, transparent paren and conditional wrapping, etc. — and records
 * the result on `literal.forceDoubleSuffix`. The Kotlin printer's
 * numeric-literal writer becomes a one-line read of the flag.
 *
 * Per-target only: wired into the Kotlin pipeline. The C# printer has
 * no equivalent suffix; the flag goes unread there.
 *
 * Enum members are emitted with an implicit `Int` context (the Kotlin
 * printer sets `_forceInteger=true` while inside `writeEnumDeclaration`).
 * The pass mirrors this by tracking a `forceInteger` flag while walking
 * the IR and never marking a literal beneath an `EnumDeclaration`.
 *
 * IR README invariant 5: printers do no type inference of their own.
 * The previous implementation walked the parent chain at print time,
 * which violated the invariant in spirit. This pass closes that gap.
 */
export class DoubleSuffixPass implements IrPass {
    public readonly name = 'double-suffix';

    public run(files: readonly cs.SourceFile[], _context: EmitterContextBase): void {
        for (const file of files) {
            this._walk(file);
        }
    }

    private _walk(root: cs.Node): void {
        // Iterative DFS to avoid blowing the JS stack on deeply nested
        // expression trees. Each frame carries its inherited
        // `forceInteger` flag (true everywhere beneath an
        // `EnumDeclaration` — enum members emit as `Int`).
        type Frame = { node: cs.Node; forceInteger: boolean };
        const stack: Frame[] = [{ node: root, forceInteger: false }];
        const seen = new Set<cs.Node>();

        while (stack.length > 0) {
            const { node, forceInteger } = stack.pop()!;
            if (seen.has(node)) {
                continue;
            }
            seen.add(node);

            if (cs.isNumericLiteral(node) && !forceInteger) {
                node.forceDoubleSuffix = this._shouldWriteDoubleSuffix(node);
            }

            const innerForceInteger = forceInteger || node.nodeType === cs.SyntaxKind.EnumDeclaration;

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
                            stack.push({ node: item as cs.Node, forceInteger: innerForceInteger });
                        }
                    }
                } else if (typeof value === 'object' && 'nodeType' in (value as object)) {
                    stack.push({ node: value as cs.Node, forceInteger: innerForceInteger });
                }
            }
        }
    }

    /**
     * Mirror of the old `KotlinAstPrinter.shouldWriteDoubleSuffix`
     * recursion. Operates on the parent chain via the IR's `parent`
     * back-pointers; transparent through parens, opaque through binary
     * comparisons and bitwise operators.
     */
    private _shouldWriteDoubleSuffix(expr: cs.Expression): boolean {
        let shouldWriteSuffix = false;
        if (expr.parent) {
            shouldWriteSuffix = cs.isNumericLiteral(expr) ? expr.value.indexOf('.') === -1 : false;

            switch (expr.parent.nodeType) {
                case cs.SyntaxKind.ParenthesizedExpression:
                    shouldWriteSuffix = this._shouldWriteDoubleSuffix(expr.parent!.parent! as cs.Expression);
                    break;
                case cs.SyntaxKind.PropertyDeclaration:
                case cs.SyntaxKind.FieldDeclaration:
                case cs.SyntaxKind.VariableDeclaration:
                case cs.SyntaxKind.ConditionalExpression:
                    break;
                case cs.SyntaxKind.PrefixUnaryExpression:
                    switch ((expr.parent as cs.PrefixUnaryExpression).operator) {
                        case '~':
                            shouldWriteSuffix = false;
                            break;
                    }
                    break;
                case cs.SyntaxKind.BinaryExpression:
                    const bin = expr.parent as cs.BinaryExpression;
                    switch (bin.operator) {
                        case '<<':
                        case '>>':
                        case '<':
                        case '>':
                        case '<=':
                        case '>=':
                        case '|':
                        case '^':
                        case '&':
                        case '|=':
                        case '^=':
                        case '&=':
                            shouldWriteSuffix = false;
                            break;
                        case '==':
                        case '!=':
                            const otherExpr = bin.left === expr ? bin.right : bin.left;
                            shouldWriteSuffix = !this._isIntResultExpression(otherExpr);
                            break;
                    }
                    break;
            }
        }
        return shouldWriteSuffix;
    }

    private _isIntResultExpression(expr: cs.Expression): boolean {
        if (cs.isInvocationExpression(expr)) {
            return this._isIntResultExpression(expr.expression);
        }

        if (cs.isBinaryExpression(expr)) {
            switch (expr.operator) {
                case '<<':
                case '>>':
                case '&':
                case '|':
                case '^':
                    return true;
            }
            return false;
        }
        if (cs.isParenthesizedExpression(expr)) {
            return this._isIntResultExpression(expr.expression);
        }
        return false;
    }
}
