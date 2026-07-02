import ts from 'typescript';
import type AstTransformer from '../AstTransformer';
import * as cs from '../ir/Ir';
import * as csf from '../ir/IrFactory';
import { createLazyTypeRef, tryCreateEnumAccess } from '../TransformerHelpers';
import { AlphaTabCore, TsBuiltin } from '../typeRegistry';
import { makeMemberAccess, wrapIntoCastToTargetType } from './ExprHelpers';

export function visitNullLiteral(_state: AstTransformer, parent: cs.Node, expression: ts.NullLiteral) {
    return csf.nullLiteral(parent, expression);
}

export function visitBooleanLiteral(_state: AstTransformer, parent: cs.Node, expression: ts.BooleanLiteral) {
    return expression.kind === ts.SyntaxKind.TrueKeyword
        ? csf.trueLiteral(parent, expression)
        : csf.falseLiteral(parent, expression);
}

export function visitNumericLiteral(state: AstTransformer, parent: cs.Node, expression: ts.NumericLiteral) {
    const numeric = csf.numericLiteral(parent, expression.text, expression);

    // ensure number literals assigned to any/unknown
    // are casted explicitly to double (to avoid ending up with ints later expected as doubles)
    if (state.context.smartCast.isUnknown(expression)) {
        return wrapIntoCastToTargetType(state, numeric);
    }

    // smartcast to enum
    const type = state.context.typeChecker.getContextualType(expression);
    if (type && state.context.isEnum(type)) {
        const enumAccess = tryCreateEnumAccess(state.context, parent, type, expression);
        if (enumAccess) {
            return enumAccess;
        }
    }

    return numeric;
}

export function visitBigIntLiteral(state: AstTransformer, parent: cs.Node, expression: ts.BigIntLiteral) {
    const numeric = csf.numericLiteral(parent, expression.text.replace('n', 'L'), expression); // map javascript bigints to 64bit longs in target language

    // ensure number literals assigned to any/unknown
    // are casted explicitly to double (to avoid ending up with ints later expected as doubles)
    if (state.context.smartCast.isUnknown(expression)) {
        return wrapIntoCastToTargetType(state, numeric);
    }

    return numeric;
}

export function visitStringLiteral(_state: AstTransformer, parent: cs.Node, expression: ts.Identifier) {
    return csf.stringLiteral(parent, expression.text, expression);
}

export function visitRegularExpressionLiteral(
    state: AstTransformer,
    parent: cs.Node,
    expression: ts.RegularExpressionLiteral
) {
    // AlphaTab.Core.TypeHelper.CreateRegex(expr)
    const csExpr = csf.invocation(parent, {} as cs.Expression, [], expression);

    const parts = expression.text.split('/');
    csExpr.expression = makeMemberAccess(
        state,
        csExpr,
        state.context.makeTypeName(AlphaTabCore.typeHelper),
        state.context.toMethodNameCase('createRegex')
    );
    csExpr.arguments.push(csf.stringLiteral(csExpr, parts[1], expression));

    csExpr.arguments.push(csf.stringLiteral(csExpr, parts[2], expression));

    return csExpr;
}

export function visitNoSubstitutionTemplateLiteral(
    _state: AstTransformer,
    parent: cs.Node,
    expression: ts.NoSubstitutionTemplateLiteral
): cs.Expression {
    return csf.stringLiteral(parent, expression.text, expression);
}

export function visitTemplateExpression(
    state: AstTransformer,
    parent: cs.Node,
    expression: ts.TemplateExpression
): cs.Expression {
    const templateString = {
        parent: parent,
        nodeType: cs.SyntaxKind.StringTemplateExpression,
        tsNode: expression,
        chunks: []
    } as cs.StringTemplateExpression;

    if (expression.head.text) {
        templateString.chunks.push(csf.stringLiteral(templateString, expression.head.text, expression.head));
    }

    for (const s of expression.templateSpans) {
        const e = state.visitExpression(templateString, s.expression);
        if (e) {
            templateString.chunks.push(e);
        }
        templateString.chunks.push(csf.stringLiteral(templateString, s.literal.text, s));
    }

    return templateString;
}

export function visitSpreadElement(
    state: AstTransformer,
    parent: cs.Node,
    expression: ts.SpreadElement
): cs.SpreadExpression {
    return {
        nodeType: cs.SyntaxKind.SpreadExpression,
        expression: state.visitExpression(parent, expression.expression)
    } as cs.SpreadExpression;
}

export function visitArrayLiteralExpression(
    state: AstTransformer,
    parent: cs.Node,
    expression: ts.ArrayLiteralExpression
): cs.Expression {
    const type = state.context.typeChecker.getTypeAtLocation(expression);
    if (state.context.typeChecker.isTupleType(type)) {
        // deconstruction
        // [x, y] = expression
        if (
            ts.isBinaryExpression(expression.parent) &&
            expression.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
            expression.parent.left === expression
        ) {
            const csExpr = {
                parent: parent,
                nodeType: cs.SyntaxKind.DeconstructDeclaration,
                names: []
            } as cs.DeconstructDeclaration;

            for (const m of expression.elements) {
                if (ts.isIdentifier(m)) {
                    csExpr.names.push(m.text);
                } else {
                    state.context.addNodeDiagnostics(
                        parent,
                        'Unsupported tuple destruction',
                        ts.DiagnosticCategory.Error
                    );
                }
            }

            return csExpr;
        }

        const csExpr = csf.newExpression(parent, null!, [], expression);

        csExpr.type = state.context.makeArrayTupleType(csExpr, []);

        let tupleType = state.context.typeChecker.getContextualType(expression);
        let typeArgs = tupleType
            ? state.context.typeChecker.getTypeArguments(tupleType as ts.TypeReference)
            : undefined;
        let isAliasedTuple = false;

        if (!typeArgs || typeArgs.length !== expression.elements.length) {
            // x ? [tuple, type] : undefined
            if (ts.isConditionalExpression(expression.parent)) {
                const parentContextualType = state.context.typeChecker.getContextualType(expression.parent);
                const parentType = parentContextualType
                    ? state.context.typeChecker.getNonNullableType(parentContextualType)
                    : undefined;

                if (parentType && state.context.typeChecker.isTupleType(parentType)) {
                    tupleType = parentType;
                    typeArgs = state.context.typeChecker.getTypeArguments(tupleType as ts.TypeReference);
                }
            } else if (ts.isArrayLiteralExpression(expression.parent)) {
                // array of arraytuples, use the exact type declared
                const parentContextualType = state.context.typeChecker.getContextualType(expression.parent);
                if (
                    parentContextualType?.symbol.name === TsBuiltin.Array &&
                    !state.context.typeChecker.isTupleType(parentContextualType)
                ) {
                    const elementTypeCandidates = [
                        state.context.typeChecker.getTypeArguments(parentContextualType as ts.TypeReference)![0]
                    ];
                    elementTypeCandidates.push(state.context.typeChecker.getNonNullableType(elementTypeCandidates[0]));
                    for (const t of elementTypeCandidates) {
                        if (state.context.typeChecker.isTupleType(t)) {
                            tupleType = t;
                            typeArgs = state.context.typeChecker.getTypeArguments(tupleType as ts.TypeReference);
                            break;
                        } else if (t.aliasSymbol) {
                            tupleType = t;
                            typeArgs = [];
                            isAliasedTuple = true;
                            break;
                        }
                    }
                }
            }
        }

        if (isAliasedTuple) {
            csExpr.type = createLazyTypeRef(state.context, csExpr.type, expression, tupleType);
        } else {
            if (!typeArgs || typeArgs.length !== expression.elements.length) {
                tupleType = type;
                typeArgs = state.context.typeChecker.getTypeArguments(tupleType as ts.TypeReference);
            }

            (csExpr.type as cs.ArrayTupleNode).types = typeArgs!.map((p, i) =>
                createLazyTypeRef(state.context, csExpr.type, expression.elements[i], p)
            );
        }

        for (const e of expression.elements) {
            const ex = state.visitExpression(csExpr, e);
            if (ex) {
                csExpr.arguments!.push(ex);
            }
        }

        return csExpr;
    }
    const csExpr = {
        parent: parent,
        tsNode: expression,
        nodeType: cs.SyntaxKind.ArrayCreationExpression,
        values: []
    } as cs.ArrayCreationExpression;

    const contextual = state.context.typeChecker.getContextualType(expression);
    if (!contextual || !contextual.symbol || contextual.symbol.name !== TsBuiltin.Iterable) {
        csExpr.type = createLazyTypeRef(state.context, csExpr, expression, contextual);
    }

    for (const e of expression.elements) {
        const ex = state.visitExpression(csExpr, e);
        if (ex) {
            csExpr.values!.push(ex);
        }
    }

    return csExpr;
}

export function isSetInitializer(state: AstTransformer, expression: ts.ArrayLiteralExpression) {
    const isCandidate = expression.parent.kind === ts.SyntaxKind.NewExpression;
    if (!isCandidate) {
        return false;
    }

    return state.context.typeChecker.getTypeAtLocation(expression.parent).symbol.name === TsBuiltin.Set;
}
