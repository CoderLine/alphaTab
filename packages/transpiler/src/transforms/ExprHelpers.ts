import ts from 'typescript';
import type AstTransformer from '../AstTransformer';
import * as cs from '../ir/Ir';
import * as csf from '../ir/IrFactory';
import { createLazyTypeRef } from '../TransformerHelpers';

export const _bitwiseAssignmentOperators = new Map<ts.SyntaxKind, string>([
    [ts.SyntaxKind.BarBarEqualsToken, '||'],
    [ts.SyntaxKind.BarEqualsToken, '|'],
    [ts.SyntaxKind.CaretEqualsToken, '^'],
    [ts.SyntaxKind.LessThanLessThanEqualsToken, '<<'],
    [ts.SyntaxKind.GreaterThanGreaterThanEqualsToken, '>>'],
    [ts.SyntaxKind.AmpersandEqualsToken, '&'],
    [ts.SyntaxKind.AmpersandAmpersandEqualsToken, '&&']
]);

export function wrapIntoCastToTargetType(state: AstTransformer, expression: cs.Expression): cs.Expression {
    const actualType = state.context.typeChecker.getTypeAtLocation(expression.tsNode!);
    const cast = csf.castExpression(
        expression.parent!,
        createLazyTypeRef(state.context, null, expression.tsNode!, actualType),
        expression,
        expression.tsNode
    );

    cast.expression.parent = cast;
    cast.type.parent = cast;
    return cast;
}

export function makeDouble(state: AstTransformer, expression: cs.Expression): cs.Expression {
    // (double)(expr)

    let targetType = cs.PrimitiveType.Double;
    if (expression.tsNode) {
        const nodeType = state.context.getType(expression.tsNode);

        // no casting on bools
        if ((nodeType.flags & ts.TypeFlags.Boolean) !== 0 || (nodeType.flags & ts.TypeFlags.BooleanLike) !== 0) {
            return expression;
        }

        // do not cast to doubles if we're working with bigints
        if ((nodeType.flags & ts.TypeFlags.BigInt) !== 0 || (nodeType.flags & ts.TypeFlags.BigIntLiteral) !== 0) {
            targetType = cs.PrimitiveType.Long;
        }
    }

    return csf.castToPrimitive(expression.parent, targetType, expression);
}

export function makeInt(state: AstTransformer, expression: cs.Expression, bigIntToLong: boolean): cs.Expression {
    switch (expression.nodeType) {
        case cs.SyntaxKind.NumericLiteral:
            const value = (expression as cs.NumericLiteral).value;
            if (value.indexOf('.') === -1) {
                if (value.includes('L') && !bigIntToLong) {
                    (expression as cs.NumericLiteral).value = value.substring(0, value.length - 1);
                }
                return expression;
            }
            break;
    }
    // (int)(expr)

    // use longs when required
    let targetType = cs.PrimitiveType.Int;
    if (expression.tsNode) {
        const nodeType = state.context.getType(expression.tsNode);
        if (bigIntToLong) {
            // no casting on bools
            if ((nodeType.flags & ts.TypeFlags.Boolean) !== 0 || (nodeType.flags & ts.TypeFlags.BooleanLike) !== 0) {
                return expression;
            }

            if ((nodeType.flags & ts.TypeFlags.BigInt) !== 0 || (nodeType.flags & ts.TypeFlags.BigIntLiteral) !== 0) {
                targetType = cs.PrimitiveType.Long;
            }
        } else {
            if ((nodeType.flags & ts.TypeFlags.BigInt) !== 0 || (nodeType.flags & ts.TypeFlags.BigIntLiteral) !== 0) {
                targetType = cs.PrimitiveType.Int;
            }
        }
    }

    return csf.castToPrimitive(expression.parent, targetType, expression);
}

export function makeTruthy(state: AstTransformer, expression: cs.Node, force: boolean = false): cs.Expression {
    return state.smartCastLowering.makeTruthy(expression, force);
}

export function makeMemberAccess(_state: AstTransformer, parent: cs.Node, identifier: string, member: string): cs.Node {
    const memberAccess = csf.memberAccess(parent, null!, member);
    memberAccess.expression = csf.identifier(memberAccess, identifier);
    memberAccess.parent = memberAccess;
    return memberAccess;
}

export function toInvariantString(state: AstTransformer, expr: cs.Expression): cs.Expression {
    const callExpr = csf.invocation(expr.parent!, null!, [], expr.tsNode);
    const memberAccess = csf.memberAccess(
        callExpr,
        null!,
        state.context.toMethodNameCase('toInvariantString'),
        expr.tsNode
    );
    callExpr.expression = memberAccess;

    const par = csf.parenthesized(memberAccess, expr, expr.tsNode);
    par.tsSymbol = expr.tsSymbol;
    expr.parent = par;
    memberAccess.expression = par;

    return callExpr;
}

export function buildNumberFromString(
    state: AstTransformer,
    parent: cs.Node,
    expression: ts.CallExpression
): cs.Expression | null {
    // double.Parse(s, System.Globalization.CultureInfo.InvariantCulture)
    const callExpr = csf.invocation(parent, null!, [], expression);
    callExpr.expression = makeMemberAccess(state, callExpr, 'Double', 'Parse') as cs.Expression;

    const arg = state.visitExpression(callExpr, expression.arguments[0]);
    if (!arg) {
        return null;
    }
    callExpr.arguments.push(arg);

    callExpr.arguments.push(csf.identifier(callExpr, 'System.Globalization.CultureInfo.InvariantCulture', expression));

    return callExpr;
}

export function mapOperator(operator: ts.SyntaxKind): string {
    switch (operator) {
        case ts.SyntaxKind.PlusPlusToken:
            return '++';
        case ts.SyntaxKind.MinusMinusToken:
            return '--';
        case ts.SyntaxKind.TildeToken:
            return '~';
        case ts.SyntaxKind.ExclamationToken:
            return '!';

        case ts.SyntaxKind.CommaToken:
            return ',';

        case ts.SyntaxKind.QuestionQuestionToken:
            return '??';

        case ts.SyntaxKind.AsteriskToken:
            return '*';
        case ts.SyntaxKind.SlashToken:
            return '/';
        case ts.SyntaxKind.PercentToken:
            return '%';

        case ts.SyntaxKind.PlusToken:
            return '+';
        case ts.SyntaxKind.MinusToken:
            return '-';

        case ts.SyntaxKind.LessThanLessThanToken:
            return '<<';
        case ts.SyntaxKind.GreaterThanGreaterThanToken:
        case ts.SyntaxKind.GreaterThanGreaterThanGreaterThanToken:
            return '>>';

        case ts.SyntaxKind.LessThanToken:
            return '<';
        case ts.SyntaxKind.LessThanEqualsToken:
            return '<=';
        case ts.SyntaxKind.GreaterThanToken:
            return '>';
        case ts.SyntaxKind.GreaterThanEqualsToken:
            return '>=';
        case ts.SyntaxKind.InstanceOfKeyword:
            return 'is';

        case ts.SyntaxKind.EqualsEqualsToken:
        case ts.SyntaxKind.EqualsEqualsEqualsToken:
            return '==';
        case ts.SyntaxKind.ExclamationEqualsEqualsToken:
        case ts.SyntaxKind.ExclamationEqualsToken:
            return '!=';

        case ts.SyntaxKind.AmpersandToken:
            return '&';
        case ts.SyntaxKind.BarToken:
            return '|';
        case ts.SyntaxKind.CaretToken:
            return '^';

        case ts.SyntaxKind.AmpersandAmpersandToken:
            return '&&';
        case ts.SyntaxKind.BarBarToken:
            return '||';

        case ts.SyntaxKind.EqualsToken:
            return '=';
        case ts.SyntaxKind.PlusEqualsToken:
            return '+=';
        case ts.SyntaxKind.MinusEqualsToken:
            return '-=';
        case ts.SyntaxKind.AsteriskEqualsToken:
            return '*=';
        case ts.SyntaxKind.SlashEqualsToken:
            return '/=';
        case ts.SyntaxKind.PercentEqualsToken:
            return '%=';
        case ts.SyntaxKind.AmpersandEqualsToken:
            return '&=';
        case ts.SyntaxKind.BarEqualsToken:
            return '|=';
        case ts.SyntaxKind.CaretEqualsToken:
            return '^=';
        case ts.SyntaxKind.LessThanLessThanEqualsToken:
            return '<<=';
        case ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken:
            return '>>>=';
        case ts.SyntaxKind.GreaterThanGreaterThanEqualsToken:
            return '>>=';
        case ts.SyntaxKind.QuestionQuestionEqualsToken:
            return '??=';
    }
    return '';
}

export function getDeclarationOrAssignmentType(state: AstTransformer): ts.Type | undefined {
    return state.declarationOrAssignmentTypeStack.length === 0
        ? undefined
        : state.declarationOrAssignmentTypeStack[state.declarationOrAssignmentTypeStack.length - 1];
}

export function isEnumFromOrToString(state: AstTransformer, expression: ts.ElementAccessExpression): boolean {
    const enumType = state.context.typeChecker.getTypeAtLocation(expression.expression);
    return !!(enumType?.symbol && enumType.symbol.flags & ts.SymbolFlags.RegularEnum);
}

export function isBind(_state: AstTransformer, expression: ts.CallExpression) {
    if (ts.isPropertyAccessExpression(expression.expression)) {
        return expression.expression.name.text === 'bind' && expression.arguments.length === 1;
    }
    return false;
}

export function removeExtension(fileName: string) {
    return fileName.substring(0, fileName.lastIndexOf('.'));
}
