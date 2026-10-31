import ts from 'typescript';
import type AstTransformer from '../AstTransformer';
import * as cs from '../ir/Ir';
import * as csf from '../ir/IrFactory';
import { createLazyTypeRef, tryCreateEnumAccess } from '../TransformerHelpers';
import { AlphaTabCore } from '../typeRegistry';
import {
    _bitwiseAssignmentOperators,
    makeDouble,
    makeInt,
    makeMemberAccess,
    mapOperator,
    toInvariantString,
    wrapIntoCastToTargetType
} from './ExprHelpers';

function _visitInBinaryOp(state: AstTransformer, parent: cs.Node, expression: ts.BinaryExpression) {
    // AlphaTab.Core.TypeHelper.In('Text', expr)
    const csExpr = csf.invocation(parent, {} as cs.Expression, [], expression);

    csExpr.expression = makeMemberAccess(
        state,
        csExpr,
        state.context.makeTypeName(AlphaTabCore.typeHelper),
        state.context.toMethodNameCase('in')
    );

    let e = state.visitExpression(csExpr, expression.left)!;
    if (e) {
        csExpr.arguments.push(e);
    }
    e = state.visitExpression(csExpr, expression.right)!;
    if (e) {
        csExpr.arguments.push(e);
    }

    return csExpr;
}

function _visitInstanceofBinaryOp(state: AstTransformer, parent: cs.Node, expression: ts.BinaryExpression) {
    const csExpr = {
        parent: parent,
        tsNode: expression,
        nodeType: cs.SyntaxKind.IsExpression,
        expression: null!,
        type: null!
    } as cs.IsExpression;

    csExpr.expression = state.visitExpression(csExpr, expression.left)!;
    csExpr.type = createLazyTypeRef(
        state.context,
        csExpr,
        expression.right,
        state.context.typeChecker.getTypeAtLocation(expression.right),
        state.context.typeChecker.getSymbolAtLocation(expression.right)
    );

    return csExpr;
}

function _visitExponentiationBinaryOp(state: AstTransformer, parent: cs.Node, expression: ts.BinaryExpression) {
    state.context.addTsNodeDiagnostics(
        expression,
        'Exponentiation expresssions are not yet supported',
        ts.DiagnosticCategory.Error
    );
    return csf.todoExpression(parent, expression);
}

function _visitExponentiationAssignmentBinaryOp(
    state: AstTransformer,
    parent: cs.Node,
    expression: ts.BinaryExpression
) {
    state.context.addTsNodeDiagnostics(
        expression,
        'Exponentiation assignment (**=) is not supported. See SYNTAX.md for the workaround.',
        ts.DiagnosticCategory.Error
    );
    return csf.todoExpression(parent, expression);
}

function _visitBitwiseAssignmentBinaryOp(state: AstTransformer, parent: cs.Node, expression: ts.BinaryExpression) {
    if (
        expression.operatorToken.kind === ts.SyntaxKind.BarBarEqualsToken ||
        expression.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandEqualsToken
    ) {
        const lhsType = state.context.typeChecker.getTypeAtLocation(expression.left);
        const isBool =
            (lhsType.flags & ts.TypeFlags.Boolean) !== 0 || (lhsType.flags & ts.TypeFlags.BooleanLiteral) !== 0;
        if (!isBool) {
            state.context.addTsNodeDiagnostics(
                expression,
                'Logical compound assignment (||=, &&=) is not supported. See SYNTAX.md for the workaround.',
                ts.DiagnosticCategory.Error
            );
            return csf.todoExpression(parent, expression);
        }
        // bool ||= / bool &&= : emit f = f || rhs / f = f && rhs
        const op = expression.operatorToken.kind === ts.SyntaxKind.BarBarEqualsToken ? '||' : '&&';
        const assignment = csf.binaryExpression(parent, {} as cs.Expression, '=', {} as cs.Expression, expression);
        assignment.left = state.visitExpression(assignment, expression.left)!;
        const logicalOp = csf.binaryExpression(
            assignment,
            state.visitExpression(assignment, expression.left)!,
            op,
            state.visitExpression(assignment, expression.right)!,
            expression
        );
        assignment.right = logicalOp;
        return assignment;
    }

    const assignment = csf.binaryExpression(parent, {} as cs.Expression, '=', {} as cs.Expression, expression);
    assignment.left = state.visitExpression(assignment, expression.left)!;
    if (!assignment.left) {
        return null;
    }

    const bitOp = csf.binaryExpression(
        assignment,
        csf.parenthesized(null!, {} as cs.Expression, expression),
        _bitwiseAssignmentOperators.get(expression.operatorToken.kind)!,
        csf.parenthesized(null!, {} as cs.Expression, expression),
        expression
    );

    assignment.right = bitOp;
    bitOp.right.parent = bitOp;

    const leftType = state.context.typeChecker.getTypeAtLocation(expression.left);
    const rightType = state.context.typeChecker.getTypeAtLocation(expression.right);

    const isLeftEnum = leftType.flags & ts.TypeFlags.Enum || leftType.flags & ts.TypeFlags.EnumLiteral;
    const isRightEnum = rightType.flags & ts.TypeFlags.Enum || rightType.flags & ts.TypeFlags.EnumLiteral;

    if (!isLeftEnum || !isRightEnum) {
        const toInt = csf.castExpression(
            bitOp,
            csf.primitiveType(null!, cs.PrimitiveType.Int, expression),
            {} as cs.Expression,
            expression
        );
        (bitOp.left as cs.ParenthesizedExpression).expression = toInt;
        toInt.expression = state.visitExpression(assignment, expression.left)!;
        if (!toInt.expression) {
            return null;
        }

        (bitOp.right as cs.ParenthesizedExpression).expression = state.visitExpression(bitOp.right, expression.right)!;

        if (!(bitOp.right as cs.ParenthesizedExpression).expression) {
            return null;
        }
    } else {
        (bitOp.left as cs.ParenthesizedExpression).expression = state.visitExpression(assignment, expression.left)!;

        if (!(bitOp.right as cs.ParenthesizedExpression).expression) {
            return null;
        }

        (bitOp.right as cs.ParenthesizedExpression).expression = state.visitExpression(bitOp.right, expression.right)!;

        if (!(bitOp.right as cs.ParenthesizedExpression).expression) {
            return null;
        }
    }

    assignment.right = makeDouble(state, assignment.right);
    return assignment;
}

function _visitDefaultBinaryOp(state: AstTransformer, parent: cs.Node, expression: ts.BinaryExpression) {
    const binaryExpression = csf.binaryExpression(
        parent,
        {} as cs.Expression,
        mapOperator(expression.operatorToken.kind),
        {} as cs.Expression,
        expression
    );

    binaryExpression.left = state.visitExpression(binaryExpression, expression.left)!;
    if (!binaryExpression.left) {
        return null;
    }

    binaryExpression.right = state.visitExpression(binaryExpression, expression.right)!;
    if (!binaryExpression.right) {
        return null;
    }

    const leftType = state.context.typeChecker.getTypeAtLocation(expression.left);
    const rightType = state.context.typeChecker.getTypeAtLocation(expression.right);

    const isLeftEnum = state.context.isEnum(leftType);
    const isRightEnum = state.context.isEnum(rightType);

    if (isLeftEnum && isRightEnum) {
        return binaryExpression;
    }

    switch (expression.operatorToken.kind) {
        case ts.SyntaxKind.PlusToken:
        case ts.SyntaxKind.PlusEqualsToken:
            _coerceStringOrNumericPlus(state, binaryExpression, leftType, rightType, isLeftEnum, isRightEnum);
            return binaryExpression;
        case ts.SyntaxKind.AmpersandToken:
        case ts.SyntaxKind.GreaterThanGreaterThanToken:
        case ts.SyntaxKind.GreaterThanGreaterThanGreaterThanToken:
        case ts.SyntaxKind.LessThanLessThanToken:
        case ts.SyntaxKind.BarToken:
        case ts.SyntaxKind.CaretToken:
            return _coerceIntegerBitOp(state, parent, binaryExpression, expression);
        case ts.SyntaxKind.SlashToken:
        case ts.SyntaxKind.AsteriskToken:
        case ts.SyntaxKind.MinusToken:
            _coerceRealArithmetic(state, binaryExpression, expression, isLeftEnum, isRightEnum);
            return binaryExpression;
    }

    return binaryExpression;
}

function _coerceStringOrNumericPlus(
    state: AstTransformer,
    bin: cs.BinaryExpression,
    leftType: ts.Type,
    rightType: ts.Type,
    isLeftEnum: boolean,
    isRightEnum: boolean
): void {
    if (leftType.flags & ts.TypeFlags.Number && rightType.flags & (ts.TypeFlags.String | ts.TypeFlags.StringLiteral)) {
        bin.left = toInvariantString(state, bin.left);
        return;
    }
    if (rightType.flags & ts.TypeFlags.Number && leftType.flags & (ts.TypeFlags.String | ts.TypeFlags.StringLiteral)) {
        bin.right = toInvariantString(state, bin.right);
        return;
    }
    // number arithmetics
    if (isLeftEnum) {
        bin.left = makeDouble(state, bin.left);
    }
    if (isRightEnum) {
        bin.right = makeDouble(state, bin.right);
    }
}

function _coerceIntegerBitOp(
    state: AstTransformer,
    parent: cs.Node,
    bin: cs.BinaryExpression,
    expression: ts.BinaryExpression
): cs.Expression {
    if (!_hasBinaryOperationMakeInt(state, bin.left)) {
        bin.left = makeInt(state, bin.left, true);
    }

    if (!_hasBinaryOperationMakeInt(state, bin.right)) {
        let allowLongOnRight = false;
        switch (expression.operatorToken.kind) {
            case ts.SyntaxKind.AmpersandToken:
            case ts.SyntaxKind.BarToken:
            case ts.SyntaxKind.CaretToken:
                allowLongOnRight = true;
                break;
            default:
                allowLongOnRight = false;
                break;
        }
        bin.right = makeInt(state, bin.right, allowLongOnRight);
    }

    let nextParent = parent;
    while (cs.isParenthesizedExpression(nextParent)) {
        nextParent = nextParent.parent!;
    }

    if (
        nextParent.nodeType !== cs.SyntaxKind.BinaryExpression ||
        (nextParent as cs.BinaryExpression).operator === '='
    ) {
        return makeDouble(state, bin);
    }
    return bin;
}

function _coerceRealArithmetic(
    state: AstTransformer,
    bin: cs.BinaryExpression,
    expression: ts.BinaryExpression,
    isLeftEnum: boolean,
    isRightEnum: boolean
): void {
    if (expression.left.kind === ts.SyntaxKind.NumericLiteral || isLeftEnum) {
        bin.left = makeDouble(state, bin.left);
    }
    if (expression.right.kind === ts.SyntaxKind.NumericLiteral || isRightEnum) {
        bin.right = makeDouble(state, bin.right);
    }
}

function _hasBinaryOperationMakeInt(state: AstTransformer, left: cs.Expression): boolean {
    if (cs.isParenthesizedExpression(left)) {
        return _hasBinaryOperationMakeInt(state, left.expression);
    }

    if (left.nodeType !== cs.SyntaxKind.BinaryExpression) {
        return false;
    }

    switch ((left as cs.BinaryExpression).operator) {
        case '&':
        case '>>':
        case '>>>':
        case '<<':
        case '^':
        case '|':
            return true;
    }

    return false;
}

export function visitPrefixUnaryExpression(
    state: AstTransformer,
    parent: cs.Node,
    expression: ts.PrefixUnaryExpression
) {
    // smartcast to enum
    if (ts.isNumericLiteral(expression.operand)) {
        const type = state.context.typeChecker.getContextualType(expression);
        if (type && state.context.isEnum(type)) {
            const enumAccess = tryCreateEnumAccess(state.context, parent, type, expression);
            if (enumAccess) {
                return enumAccess;
            }
        }
    }

    const csExpr = csf.prefixUnary(parent, mapOperator(expression.operator), {} as cs.Expression, expression);

    csExpr.operand = state.visitExpression(csExpr, expression.operand)!;
    if (!csExpr.operand) {
        return null;
    }

    if (csExpr.operator === '~') {
        csExpr.operand = makeInt(state, csExpr.operand, true);
    }

    // ensure number literals assigned to any/unknown
    // are casted explicitly to double (to avoid ending up with ints later expected as doubles)
    if (state.context.smartCast.isUnknown(expression)) {
        return wrapIntoCastToTargetType(state, csExpr);
    }

    return csExpr;
}

export function visitPostfixUnaryExpression(
    state: AstTransformer,
    parent: cs.Node,
    expression: ts.PostfixUnaryExpression
) {
    const csExpr = csf.postfixUnary(parent, mapOperator(expression.operator), {} as cs.Expression, expression);

    csExpr.operand = state.visitExpression(csExpr, expression.operand)!;
    if (!csExpr.operand) {
        return null;
    }

    return csExpr;
}

export function visitBinaryExpression(state: AstTransformer, parent: cs.Node, expression: ts.BinaryExpression) {
    switch (expression.operatorToken.kind) {
        case ts.SyntaxKind.InKeyword:
            return _visitInBinaryOp(state, parent, expression);
        case ts.SyntaxKind.InstanceOfKeyword:
            return _visitInstanceofBinaryOp(state, parent, expression);
        case ts.SyntaxKind.AsteriskAsteriskToken:
            return _visitExponentiationBinaryOp(state, parent, expression);
        case ts.SyntaxKind.AsteriskAsteriskEqualsToken:
            return _visitExponentiationAssignmentBinaryOp(state, parent, expression);
    }

    if (_bitwiseAssignmentOperators.has(expression.operatorToken.kind)) {
        return _visitBitwiseAssignmentBinaryOp(state, parent, expression);
    }

    return _visitDefaultBinaryOp(state, parent, expression);
}

export function visitConditionalExpression(
    state: AstTransformer,
    parent: cs.Node,
    expression: ts.ConditionalExpression
) {
    const conditionalExpression = {
        parent: parent,
        nodeType: cs.SyntaxKind.ConditionalExpression,
        tsNode: expression,
        condition: {} as cs.Expression,
        whenTrue: {} as cs.Expression,
        whenFalse: {} as cs.Expression
    } as cs.ConditionalExpression;

    conditionalExpression.condition = state.visitExpression(conditionalExpression, expression.condition)!;
    if (!conditionalExpression.condition) {
        return null;
    }

    conditionalExpression.whenTrue = state.visitExpression(conditionalExpression, expression.whenTrue)!;
    if (!conditionalExpression.whenTrue) {
        return null;
    }

    conditionalExpression.whenFalse = state.visitExpression(conditionalExpression, expression.whenFalse)!;
    if (!conditionalExpression.whenFalse) {
        return null;
    }

    return conditionalExpression;
}

export function visitTypeAssertionExpression(state: AstTransformer, parent: cs.Node, expression: ts.TypeAssertion) {
    const csExpr = {
        parent: parent,
        tsNode: expression,
        nodeType: cs.SyntaxKind.IsExpression,
        type: createLazyTypeRef(state.context, null, expression.type),
        expression: {} as cs.Expression
    } as cs.IsExpression;

    csExpr.expression = state.visitExpression(csExpr, expression.expression)!;
    if (!csExpr.expression) {
        return csExpr.expression;
    }

    return csExpr;
}

export function visitAsExpression(
    state: AstTransformer,
    parent: cs.Node,
    expression: ts.AsExpression
): cs.Expression | null {
    const castedSymbol = state.context.typeChecker.getSymbolAtLocation(expression.expression);
    if (castedSymbol?.valueDeclaration) {
        const targetType = state.context.typeChecker.getTypeFromTypeNode(expression.type);
        const sourceType = state.context.typeChecker.getTypeAtLocation(castedSymbol.valueDeclaration);
        if (
            targetType === state.context.typeChecker.getNumberType() &&
            sourceType === state.context.typeChecker.getUnknownType()
        ) {
            const csExpr = {
                parent: parent,
                tsNode: expression,
                nodeType: cs.SyntaxKind.InvocationExpression,
                arguments: [],
                expression: {} as cs.Expression
            } as cs.InvocationExpression;

            csExpr.expression = makeMemberAccess(
                state,
                csExpr,
                state.context.makeTypeName(AlphaTabCore.typeHelper),
                state.context.toMethodNameCase('unknownToNumber')
            );
            const e = state.visitExpression(csExpr, expression.expression);
            if (e) {
                csExpr.arguments.push(e);
            }
            return csExpr;
        }
    }

    const castExpression = {
        type: createLazyTypeRef(state.context, null, expression.type),
        expression: {} as cs.Expression,
        parent: parent,
        tsNode: expression,
        nodeType: cs.SyntaxKind.CastExpression
    } as cs.CastExpression;

    castExpression.type.parent = castExpression;
    castExpression.expression = state.visitExpression(castExpression, expression.expression)!;
    if (!castExpression.expression) {
        return null;
    }

    return castExpression;
}

export function visitNonNullExpression(state: AstTransformer, parent: cs.Node, expression: ts.NonNullExpression) {
    if (state.context.isValueTypeExpression(expression)) {
        const valueAccessExpression = {
            expression: {} as cs.Expression,
            member: 'Value',
            parent: parent,
            tsNode: expression,
            nodeType: cs.SyntaxKind.MemberAccessExpression
        } as cs.MemberAccessExpression;

        valueAccessExpression.expression = state.visitExpression(valueAccessExpression, expression.expression)!;
        if (!valueAccessExpression.expression) {
            return null;
        }

        return valueAccessExpression;
    }
    const nonNullExpression = {
        expression: {} as cs.Expression,
        parent: parent,
        tsNode: expression,
        nodeType: cs.SyntaxKind.NonNullExpression
    } as cs.NonNullExpression;

    nonNullExpression.expression = state.visitExpression(nonNullExpression, expression.expression)!;
    if (!nonNullExpression.expression) {
        return null;
    }

    return nonNullExpression;
}
