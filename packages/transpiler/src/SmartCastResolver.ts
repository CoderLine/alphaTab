import ts from 'typescript';
import type EmitterContextBase from './EmitterContextBase';

/**
 * Encapsulates the family of "smart cast" predicates that the transformer
 * uses to decide when an expression's emitted type needs to be narrowed
 * compared to its declared type:
 *
 *  - isUnknown          — true when the contextual type is any/unknown.
 *  - isBoolean          — true when the expression appears in a boolean
 *                         context (condition of if/while/for/?:/!).
 *  - isValueTypeNotNull — true when a value-type expression has been
 *                         narrowed from `T | null` to `T`. (Kotlin disables
 *                         this via the per-target flag below.)
 *  - isNonNull          — true when a (reference-type) expression has been
 *                         narrowed from `T | null` to `T`.
 *  - getCastType        — the concrete TS type to cast to, or null when no
 *                         cast is needed; also captures the enum-in-arithmetic
 *                         coercion to number.
 *
 * Behaviour is preserved verbatim from the original methods that
 * previously lived on CSharpEmitterContext (now EmitterContextBase).
 * The resolver is bound to the context at construction so it has live
 * access to the type checker and the isFunctionType / isValueType /
 * isNullableType helpers, without forcing those to move.
 */
export default class SmartCastResolver {
    private readonly _ctx: EmitterContextBase;

    /**
     * Some targets (Kotlin) do not need the value-type-not-null cast at
     * all — Kotlin's null-safety operators handle it. Setting this to
     * false short-circuits `isValueTypeNotNull` to undefined.
     */
    public valueTypeNotNullEnabled: boolean = true;

    public constructor(ctx: EmitterContextBase) {
        this._ctx = ctx;
    }

    private get _typeChecker(): ts.TypeChecker {
        return this._ctx.typeChecker;
    }

    public isUnknown(expression: ts.Expression): boolean {
        if (expression.kind === ts.SyntaxKind.NullKeyword || expression.kind === ts.SyntaxKind.UndefinedKeyword) {
            return false;
        }
        const smartCastType = this.getCastType(expression);
        return (
            !!smartCastType &&
            ((smartCastType.flags & ts.TypeFlags.Any) !== 0 || (smartCastType.flags & ts.TypeFlags.Unknown) !== 0)
        );
    }

    public isBoolean(tsNode: ts.Node): boolean {
        let tsParent = tsNode.parent;
        if (!tsParent) {
            return false;
        }

        while (tsParent.kind === ts.SyntaxKind.ParenthesizedExpression) {
            tsNode = tsParent;
            tsParent = tsParent.parent!;
        }
        switch (tsParent.kind) {
            case ts.SyntaxKind.NonNullExpression:
                return false;
            case ts.SyntaxKind.ConditionalExpression:
                if ((tsParent as ts.ConditionalExpression).condition !== tsNode) {
                    return false;
                }
                break;
            case ts.SyntaxKind.PrefixUnaryExpression:
                if ((tsParent as ts.PrefixUnaryExpression).operator !== ts.SyntaxKind.ExclamationToken) {
                    return false;
                }
                break;
            case ts.SyntaxKind.IfStatement:
                if ((tsParent as ts.IfStatement).expression !== tsNode) {
                    return false;
                }
                break;
            case ts.SyntaxKind.WhileStatement:
                if ((tsParent as ts.WhileStatement).expression !== tsNode) {
                    return false;
                }
                break;
            case ts.SyntaxKind.ForStatement:
                if ((tsParent as ts.ForStatement).condition !== tsNode) {
                    return false;
                }
                break;
            case ts.SyntaxKind.BinaryExpression:
                switch ((tsParent as ts.BinaryExpression).operatorToken.kind) {
                    case ts.SyntaxKind.AmpersandAmpersandToken:
                    case ts.SyntaxKind.BarBarToken:
                        break;
                    default:
                        return false;
                }
                break;
            default:
                return false;
        }

        // The expression is in a syntactic boolean-context slot. Return true
        // only when the expression's own type is NOT already boolean — when it
        // is already boolean, no IsTruthy coercion is required at the consumer.
        // (The historic implementation had an unreachable second `return true`
        // after this check, which made the function widen to "any expression in
        // a boolean-context slot regardless of type". `makeTruthy` at the
        // consumer site re-checks the expression's actual type and short-
        // circuits when it is boolean, so the dead branch produced no output
        // drift in practice; removing it tightens the predicate to match the
        // documented intent.)
        const type = this._typeChecker.getTypeAtLocation(tsNode);
        if (!type) {
            return true;
        }
        return !this._ctx.isBooleanType(type);
    }

    public isValueTypeNotNull(expression: ts.Expression): boolean | undefined {
        if (!this.valueTypeNotNullEnabled) {
            return undefined;
        }

        if (
            expression.parent.kind === ts.SyntaxKind.AsExpression || // already a cast
            expression.parent.kind === ts.SyntaxKind.TypeOfExpression || // type checking
            expression.parent.kind === ts.SyntaxKind.NonNullExpression || // explicit non null expression
            this.isBoolean(expression) ||
            // left hand side assignment
            (ts.isBinaryExpression(expression.parent) &&
                expression.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
                expression.parent.left === expression) ||
            (ts.isBinaryExpression(expression.parent) &&
                expression.parent.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken) ||
            // check against null
            (ts.isBinaryExpression(expression.parent) &&
                (expression.parent.operatorToken.kind === ts.SyntaxKind.EqualsEqualsToken ||
                    ((expression.parent.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken ||
                        expression.parent.operatorToken.kind === ts.SyntaxKind.ExclamationEqualsToken ||
                        expression.parent.operatorToken.kind === ts.SyntaxKind.ExclamationEqualsEqualsToken) &&
                        expression.parent.left === expression &&
                        expression.parent.right.kind === ts.SyntaxKind.NullKeyword)))
        ) {
            return undefined;
        }

        let symbol = this._typeChecker.getSymbolAtLocation(expression);
        if (!symbol) {
            return undefined;
        }
        const declarations = symbol.declarations;
        if (!declarations || declarations.length === 0) {
            return undefined;
        }

        if (symbol.flags & ts.SymbolFlags.Alias) {
            symbol = this._typeChecker.getAliasedSymbol(symbol);
        }
        if (symbol.flags & ts.SymbolFlags.Interface || symbol.flags & ts.SymbolFlags.Class) {
            return undefined;
        }

        // declared type must be nullable
        const declaredType = this._typeChecker.getTypeAtLocation(declarations[0]);
        if (!this._ctx.isNullableType(declaredType)) {
            return undefined;
        }

        // actual type at location must be non nullable
        const declaredTypeNonNull = this._typeChecker.getNonNullableType(declaredType);

        const contextualType = this._typeChecker.getTypeOfSymbolAtLocation(symbol, expression);
        if (!contextualType || this._ctx.isNullableType(contextualType)) {
            return undefined;
        }

        // actual type must match non nullable declaration
        if (declaredTypeNonNull === contextualType) {
            return this._ctx.isValueType(declaredTypeNonNull);
        }

        return undefined;
    }

    public isNonNull(expression: ts.Expression): boolean {
        // if the parent is already casting, we have no "smart" cast.
        if (
            expression.parent.kind === ts.SyntaxKind.AsExpression ||
            (ts.isBinaryExpression(expression.parent) &&
                expression.parent.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken)
        ) {
            return false;
        }

        const contextualType = this._typeChecker.getTypeAtLocation(expression);
        if (!contextualType) {
            return false;
        }

        let symbol = this._typeChecker.getSymbolAtLocation(expression);
        if (!symbol) {
            return false;
        }
        const declarations = symbol.declarations;
        if (!declarations || declarations.length === 0) {
            return false;
        }

        if (symbol.flags & ts.SymbolFlags.Alias) {
            symbol = this._typeChecker.getAliasedSymbol(symbol);
        }

        if (symbol.flags & ts.SymbolFlags.Interface || symbol.flags & ts.SymbolFlags.Class) {
            return false;
        }

        const declaredType = this._typeChecker.getTypeAtLocation(declarations[0]);
        if (!this._ctx.isNullableType(declaredType)) {
            return false;
        }

        return (
            this._typeChecker.getNonNullableType(declaredType) ===
                this._typeChecker.getNonNullableType(contextualType) &&
            this._ctx.isNullableType(declaredType) &&
            !this._ctx.isNullableType(contextualType)
        );
    }

    public getCastType(expression: ts.Expression): ts.Type | null {
        if (expression.parent.kind === ts.SyntaxKind.AsExpression) {
            return null;
        }

        // no smartcast on assignments
        if (
            ts.isBinaryExpression(expression.parent) &&
            (expression.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken ||
                expression.parent.operatorToken.kind === ts.SyntaxKind.QuestionQuestionEqualsToken) &&
            expression.parent.left === expression
        ) {
            return null;
        }

        if (
            expression.parent.kind === ts.SyntaxKind.NonNullExpression &&
            expression.parent.parent.kind === ts.SyntaxKind.AsExpression
        ) {
            return null;
        }

        // For Enum[value] we do not smart cast value to a number
        if (ts.isElementAccessExpression(expression.parent) && expression.parent.argumentExpression === expression) {
            return null;
        }

        let symbol = this._typeChecker.getSymbolAtLocation(expression);
        if (!symbol) {
            // smartcast to unknown?
            const contextualType = this._typeChecker.getContextualType(expression);
            if (
                contextualType &&
                ((contextualType.flags & ts.TypeFlags.Any) !== 0 || (contextualType.flags & ts.TypeFlags.Unknown) !== 0)
            ) {
                return contextualType;
            }
            return null;
        }
        const declarations = symbol.declarations;
        if (!declarations || declarations.length === 0) {
            return null;
        }

        if (symbol.flags & ts.SymbolFlags.Alias) {
            symbol = this._typeChecker.getAliasedSymbol(symbol);
        }

        if (symbol.flags & ts.SymbolFlags.Interface || symbol.flags & ts.SymbolFlags.Class) {
            return null;
        }

        let contextualType = this._typeChecker.getContextualType(expression);
        if (!contextualType) {
            contextualType = this._typeChecker.getTypeOfSymbolAtLocation(symbol, expression);
            if (!contextualType) {
                return null;
            }
        }

        let declaredType = this._typeChecker.getTypeAtLocation(declarations[0]);

        const contextualTypeNullable = contextualType;
        contextualType = this._typeChecker.getNonNullableType(contextualType);
        declaredType = this._typeChecker.getNonNullableType(declaredType);

        if (this.shouldSkip(contextualType)) {
            return null;
        }

        // cast enums to numbers in arithmetic / comparison contexts
        if (
            expression.parent &&
            (contextualType.flags & ts.TypeFlags.Enum || contextualType.flags & ts.TypeFlags.EnumLiteral)
        ) {
            if (ts.isBinaryExpression(expression.parent)) {
                switch (expression.parent.operatorToken.kind) {
                    case ts.SyntaxKind.AsteriskToken:
                    case ts.SyntaxKind.PlusToken:
                    case ts.SyntaxKind.MinusEqualsToken:
                    case ts.SyntaxKind.SlashToken:
                        return this._typeChecker.getNumberType();
                    case ts.SyntaxKind.EqualsEqualsToken:
                    case ts.SyntaxKind.EqualsEqualsEqualsToken:
                    case ts.SyntaxKind.ExclamationEqualsToken:
                    case ts.SyntaxKind.ExclamationEqualsEqualsToken:
                    case ts.SyntaxKind.GreaterThanEqualsToken:
                    case ts.SyntaxKind.GreaterThanToken:
                    case ts.SyntaxKind.LessThanEqualsToken:
                    case ts.SyntaxKind.LessThanToken:
                        const otherExpr =
                            expression.parent.left === expression ? expression.parent.right : expression.parent.left;
                        const otherExprType = this._typeChecker.getTypeAtLocation(otherExpr);
                        if (otherExprType && otherExprType.flags & ts.TypeFlags.Number) {
                            return this._typeChecker.getNumberType();
                        }
                        break;
                }
            } else if (
                ts.isElementAccessExpression(expression.parent) &&
                expression.parent.argumentExpression === expression
            ) {
                return this._typeChecker.getNumberType();
            }
        }

        // enum literal to same enum type
        if (
            contextualType.flags & ts.TypeFlags.EnumLiteral &&
            (declaredType.symbol as any)?.parent === contextualType.symbol
        ) {
            return null;
        }

        return contextualType !== declaredType &&
            !this._ctx.isTypeAssignable(contextualType, contextualTypeNullable, declaredType)
            ? contextualTypeNullable
            : null;
    }

    public shouldSkip(contextualType: ts.Type): boolean {
        // unions that are no enums
        if (contextualType.isUnion() && (contextualType.flags & (ts.TypeFlags.Enum | ts.TypeFlags.EnumLiteral)) === 0) {
            return true;
        }

        // no function types
        if (this._ctx.isFunctionType(contextualType)) {
            return true;
        }

        // no casts to "object"
        if (
            'objectFlags' in contextualType &&
            'intrinsicName' in contextualType &&
            contextualType.intrinsicName === 'object'
        ) {
            return true;
        }

        // ArrayLike — structural detector replacing the old
        // `symbol.name === 'ArrayLike'` match. `globals.isArrayLike`
        // compares against the cached `ArrayLike<T>` global from the lib
        // via `isReferenceToType`. (No purely-structural fallback here:
        // numeric-index-plus-length also matches concrete typed arrays
        // like `Float32Array`/`Uint8Array`, where the cast is required —
        // see the `PrettyFormat.cs` typed-array narrowing sites for
        // examples that broke under an over-broad structural rule.)
        if (this._ctx.globals.isArrayLike(contextualType)) {
            return true;
        }

        // Test-framework types (Assertion, SnapshotMatcher, …) — replaced
        // the symbol-name blacklist with a declaration-source-file
        // location check covering the assertion frameworks alphaTab uses
        // (chai / vitest expose `Assertion`; jasmine exposes `Spy` and
        // friends; `SnapshotMatcher` is vitest's snapshot matcher). The
        // detection mirrors `isTestFunction` at
        // `CSharpEmitterContext.ts:275` — same axis (declaration source
        // file), broader file-name net.
        if (contextualType.symbol) {
            const decls = contextualType.symbol.declarations;
            if (decls && decls.length > 0) {
                const fileName = decls[0].getSourceFile().fileName;
                if (
                    fileName.indexOf('jasmine') !== -1 ||
                    fileName.indexOf('chai') !== -1 ||
                    fileName.indexOf('vitest') !== -1
                ) {
                    return true;
                }
            }

            // empty object type {} (basically object)
            if (
                contextualType.flags & ts.TypeFlags.Object &&
                (contextualType as ts.ObjectType).getProperties().length === 0
            ) {
                return true;
            }
        }

        return false;
    }
}
