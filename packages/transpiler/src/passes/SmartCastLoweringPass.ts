import ts from 'typescript';
import type EmitterContextBase from '../EmitterContextBase';
import * as cs from '../ir/Ir';
import * as csf from '../ir/IrFactory';
import { AlphaTabCore } from '../typeRegistry';
import type { IrPass } from './IrPass';

/**
 * Callback used by `SmartCastLowering` to allocate a `LazyTypeRef`. The
 * transformer owns the allocator (it is the only stage allowed to mint
 * new TS-symbol-backed nodes); the lowering helper invokes it whenever
 * a cast wrap needs a target type.
 */
export type CreateLazyTypeRef = (
    parent: cs.Node | null,
    tsNode: ts.Node,
    tsType?: ts.Type,
    tsSymbol?: ts.Symbol
) => cs.LazyTypeRef;

/**
 * Encapsulates the runtime "wrap an expression in a smart-cast" policy
 * that the transformer applies after producing each candidate
 * expression. Lives next to `SmartCastLoweringPass` so all smart-cast
 * decisions (cast to narrowed type, IsTruthy wrap, NonNull, value-type
 * `.Value` access) sit in one module.
 *
 * The decisions themselves come from `context.smartCast.*`; this class
 * just translates those predicates into IR node mutations. Numeric
 * coercions performed by `makeInt`/`makeDouble` for operator narrowing
 * are deliberately NOT part of smart-cast lowering and remain on the
 * transformer.
 *
 * For this session the helper is invoked synchronously from the
 * transformer (the legacy invocation timing). A future session migrates
 * the call sites to set a marker on the candidate node, with the pass
 * walking the IR and applying the wrap as a separate phase.
 */
export class SmartCastLowering {
    public constructor(
        private readonly _context: EmitterContextBase,
        private readonly _createLazyTypeRef: CreateLazyTypeRef
    ) {}

    /**
     * Coerces an expression into a boolean context via
     * `AlphaTab.Core.TypeHelper.IsTruthy(expression)` when the
     * containing TS expression is in a boolean position and the
     * expression's TS type is not already boolean. `force` skips the
     * `isBoolean` precheck (used after producing a cast wrap that
     * still needs truthification).
     */
    public makeTruthy(expression: cs.Node, force: boolean = false): cs.Expression {
        if (!expression.tsNode) {
            return expression as cs.Expression;
        }

        if (!force) {
            if (!this._context.smartCast.isBoolean(expression.tsNode!)) {
                return expression as cs.Expression;
            }
        }

        const type = this._context.typeChecker.getTypeAtLocation(expression.tsNode!);
        if (type.flags & ts.TypeFlags.Boolean || type.flags & ts.TypeFlags.BooleanLiteral) {
            return expression as cs.Expression;
        }

        // AlphaTab.Core.TypeHelper.IsTruthy(expression);
        const access = csf.staticMemberAccess(
            null,
            this._context.makeTypeName(AlphaTabCore.typeHelper),
            this._context.toMethodNameCase('isTruthy'),
            expression.tsNode
        );
        const call = csf.invocation(expression.parent!, access, [expression as cs.Expression], expression.tsNode);
        return call;
    }

    /**
     * Wraps `node` in whatever smart-cast tree the resolver demands for
     * `expression` (the originating TS expression). Returns `node`
     * unchanged when no narrowing applies. Always returns an expression
     * suitable for storage in the parent's slot.
     */
    public wrapToSmartCast(
        parent: cs.Node,
        node: cs.Node,
        expression: ts.Expression,
        _forceCast: boolean = false
    ): cs.Expression {
        if (node.tsSymbol) {
            if (
                (node.tsSymbol.flags & ts.SymbolFlags.Property) === ts.SymbolFlags.Property ||
                (node.tsSymbol.flags & ts.SymbolFlags.Variable) === ts.SymbolFlags.Variable ||
                (node.tsSymbol.flags & ts.SymbolFlags.EnumMember) === ts.SymbolFlags.EnumMember ||
                (node.tsSymbol.flags & ts.SymbolFlags.FunctionScopedVariable) ===
                    ts.SymbolFlags.FunctionScopedVariable ||
                (node.tsSymbol.flags & ts.SymbolFlags.BlockScopedVariable) === ts.SymbolFlags.BlockScopedVariable
            ) {
                const smartCastType = this._context.smartCast.getCastType(expression);
                if (smartCastType && !this._context.isIterable(smartCastType)) {
                    if (smartCastType.flags & ts.TypeFlags.Boolean) {
                        return this.makeTruthy(node, true);
                    }

                    const paren = {
                        expression: {} as cs.Expression,
                        parent: parent,
                        tsNode: expression,
                        nodeType: cs.SyntaxKind.ParenthesizedExpression
                    } as cs.ParenthesizedExpression;

                    const castExpression = {
                        type: this._createLazyTypeRef(
                            null,
                            expression,
                            smartCastType,
                            smartCastType.symbol ?? node.tsSymbol
                        ),
                        expression: node,
                        parent: paren,
                        tsNode: expression,
                        nodeType: cs.SyntaxKind.CastExpression
                    } as cs.CastExpression;
                    paren.expression = castExpression;

                    castExpression.type.parent = castExpression;
                    castExpression.expression.parent = castExpression;

                    return this.makeTruthy(paren);
                }

                const isValueTypeNotNullSmartCast = this._context.smartCast.isValueTypeNotNull(expression);
                if (isValueTypeNotNullSmartCast !== undefined) {
                    if (isValueTypeNotNullSmartCast) {
                        return {
                            parent: parent,
                            nodeType: cs.SyntaxKind.MemberAccessExpression,
                            tsNode: expression,
                            expression: node,
                            member: 'Value'
                        } as cs.MemberAccessExpression;
                    }
                    return this.makeTruthy({
                        parent: parent,
                        nodeType: cs.SyntaxKind.NonNullExpression,
                        tsNode: expression,
                        expression: node
                    } as cs.NonNullExpression);
                }

                if (this._context.smartCast.isNonNull(expression)) {
                    return this.makeTruthy({
                        parent: parent,
                        nodeType: cs.SyntaxKind.NonNullExpression,
                        tsNode: expression,
                        expression: node
                    } as cs.NonNullExpression);
                }
            }
        }

        return this.makeTruthy(node);
    }
}

/**
 * Pipeline pass that owns smart-cast lowering. For this session the
 * pass itself is a no-op gate: the `SmartCastLowering` helper above is
 * still invoked synchronously by the transformer because the wrap
 * results feed directly into parent IR slots during construction.
 *
 * Keeping the pass wired into the pipeline anchors the architectural
 * commitment — IR README invariant 5 ("Printers do no type inference of
 * their own") is enforced by the existence of this pass; future work
 * migrates the *timing* of the wrapping into `run()` without changing
 * the helper's policy.
 */
export class SmartCastLoweringPass implements IrPass {
    public readonly name = 'smart-cast-lowering';

    public run(_files: readonly cs.SourceFile[], _context: EmitterContextBase): void {
        // No-op for this session. Smart-cast policy lives in
        // `SmartCastLowering`; the transformer invokes it inline so
        // wrap results land in parent IR slots immediately. Once the
        // marker-based candidate model lands, this body grows into the
        // walker that consumes those markers and rewrites slots.
    }
}
