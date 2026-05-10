import ts from 'typescript';
import type AstTransformer from '../AstTransformer';
import * as cs from '../ir/Ir';
import * as csf from '../ir/IrFactory';
import { createLazyTypeRef } from '../TransformerHelpers';
import { AlphaTabCore, TsBuiltin } from '../typeRegistry';
import {
    buildNumberFromString,
    getDeclarationOrAssignmentType,
    isBind,
    isEnumFromOrToString,
    makeInt,
    makeMemberAccess,
    makeTruthy,
    toInvariantString
} from './ExprHelpers';

export function visitCallExpression(state: AstTransformer, parent: cs.Node, expression: ts.CallExpression) {
    if (isBind(state, expression)) {
        return state.visitExpression(parent, (expression.expression as ts.PropertyAccessExpression).expression);
    }

    // String(x), BigInt(x), Number(x)
    if (ts.isIdentifier(expression.expression) && expression.arguments.length === 1) {
        switch (expression.expression.text) {
            case 'String': {
                const stringArgType = state.context.typeChecker.getTypeAtLocation(expression.arguments[0]);
                const tempParent = { parent: parent, nodeType: cs.SyntaxKind.ParenthesizedExpression } as cs.Node;
                const stringValue = state.visitExpression(tempParent, expression.arguments[0]);
                if (!stringValue) {
                    return null;
                }
                stringValue.parent = parent;
                if (
                    (stringArgType.flags &
                        (ts.TypeFlags.Number |
                            ts.TypeFlags.NumberLiteral |
                            ts.TypeFlags.Enum |
                            ts.TypeFlags.EnumLiteral)) !==
                    0
                ) {
                    return toInvariantString(state, stringValue);
                }
                // For other types, fall back to "" + x (string or unknown)
                const addWithString = csf.binaryExpression(parent, null!, '+', stringValue, expression);
                addWithString.left = csf.stringLiteral(addWithString, '');
                stringValue.parent = addWithString;
                return addWithString;
            }
            case 'BigInt':
                const bigIntCastExpression = csf.castExpression(
                    parent,
                    csf.primitiveType(null!, cs.PrimitiveType.Long),
                    null! as cs.Expression,
                    expression
                );

                const bigIntValue = state.visitExpression(bigIntCastExpression, expression.arguments[0])!;
                if (!bigIntValue) {
                    return null;
                }

                bigIntCastExpression.expression = bigIntValue;
                return bigIntCastExpression;
            case 'Number':
                const numberArgType = state.context.typeChecker.getTypeAtLocation(expression.arguments[0]);
                if ((numberArgType.flags & ts.TypeFlags.StringLike) !== 0) {
                    return buildNumberFromString(state, parent, expression);
                }

                const numebrCastExpression = csf.castExpression(
                    parent,
                    csf.primitiveType(null!, cs.PrimitiveType.Double),
                    null! as cs.Expression,
                    expression
                );

                const numberValue = state.visitExpression(numebrCastExpression, expression.arguments[0])!;
                if (!numberValue) {
                    return null;
                }

                numebrCastExpression.expression = numberValue;
                return numebrCastExpression;
        }
    }

    const callExpression = csf.invocation(parent, {} as cs.Expression, [], expression);
    callExpression.nullSafe = !!expression.questionDotToken;

    // chai
    if (ts.isIdentifier(expression.expression) && (expression.expression as ts.Identifier).text === 'expect') {
        callExpression.expression = csf.identifier(
            callExpression,
            `TestGlobals.${state.context.toMethodNameCase('expect')}`,
            expression.expression
        );
    } else {
        callExpression.expression = state.visitExpression(callExpression, expression.expression)!;
    }

    if (!callExpression.expression) {
        return null;
    }

    if (ts.isPropertyAccessExpression(expression.expression) && expression.expression.name.text === 'setPrototypeOf') {
        return null;
    }

    for (const a of expression.arguments) {
        const e = state.visitExpression(callExpression, a);
        if (e) {
            callExpression.arguments.push(e);
        }
    }

    if (expression.typeArguments) {
        callExpression.typeArguments = [];
        for (const a of expression.typeArguments) {
            callExpression.typeArguments!.push(createLazyTypeRef(state.context, callExpression, a));
        }
    }

    return makeTruthy(state, callExpression);
}

export function visitNewExpression(state: AstTransformer, parent: cs.Node, expression: ts.NewExpression) {
    const symbol = state.context.typeChecker.getSymbolAtLocation(expression.expression);
    let type: ts.Type | undefined = undefined;
    if (symbol) {
        type = state.context.typeChecker.getTypeOfSymbolAtLocation(symbol, expression.expression) ?? null;
    }

    if (type?.symbol?.name === 'PromiseConstructor') {
        const invocation = csf.invocation(parent, {} as cs.Identifier, [], expression);

        invocation.expression = makeMemberAccess(
            state,
            invocation,
            state.context.makeTypeName(AlphaTabCore.typeHelper),
            state.context.toMethodNameCase('createPromise')
        );

        const e = state.visitExpression(invocation, expression.arguments![0]);
        if (e) {
            invocation.arguments.push(e);
        }

        const isVoidPromise =
            !expression.typeArguments || expression.typeArguments[0].kind === ts.SyntaxKind.VoidKeyword;

        if (!isVoidPromise) {
            invocation.typeArguments = [];
            for (const a of expression.typeArguments!) {
                invocation.typeArguments!.push(createLazyTypeRef(state.context, invocation, a));
            }
        } else if (e && cs.isLambdaExpression(e)) {
            e.parameters[0].type = {
                nodeType: cs.SyntaxKind.FunctionTypeNode,
                parameterTypes: [],
                parent: e,
                returnType: {
                    nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                    parent: e,
                    type: cs.PrimitiveType.Void
                } as cs.PrimitiveTypeNode
            } as cs.FunctionTypeNode;
        }
        return invocation;
    }

    const csType = createLazyTypeRef(state.context, null, expression.expression, type, symbol);
    const newExpression = csf.newExpression(parent, csType, [], expression);

    newExpression.type.parent = newExpression;

    if (expression.typeArguments) {
        csType.typeArguments = [];
        for (const a of expression.typeArguments) {
            csType.typeArguments!.push(createLazyTypeRef(state.context, newExpression, a));
        }
    } else {
        const typeAtLocation = state.context.typeChecker.getTypeAtLocation(expression) as ts.TypeReference;
        if (typeAtLocation.typeArguments && typeAtLocation.typeArguments.length > 0) {
            const declarationOrAssignmentType = getDeclarationOrAssignmentType(state);
            const actualTypeArguments = (declarationOrAssignmentType as ts.TypeReference)?.typeArguments;
            // we have some inferred type arguments here
            if (actualTypeArguments && actualTypeArguments.length === typeAtLocation.typeArguments.length) {
                csType.typeArguments = [];
                for (const a of actualTypeArguments) {
                    csType.typeArguments!.push(
                        createLazyTypeRef(state.context, newExpression, expression.expression, a)
                    );
                }
            } else {
                csType.typeArguments = [];

                // ignore and hope for the best in the target language (e.g. new Uint8Array is nowadays a Uint8Array<ArrayBuffer>)
                // state._context.addTsNodeDiagnostics(
                //     expression,
                //     'Cannot infer type arguments on generic object creation',
                //     ts.DiagnosticCategory.Error
                // );
            }
        }
    }

    if (expression.arguments) {
        for (const a of expression.arguments) {
            const e = state.visitExpression(newExpression, a);
            if (e) {
                newExpression.arguments.push(e);
            }
        }
    }

    if (type && type.symbol && type.symbol.name === 'ArrayConstructor' && newExpression.arguments.length === 1) {
        newExpression.arguments[0] = makeInt(state, newExpression.arguments[0], false);
    }

    return newExpression;
}

export function visitPropertyAccessExpression(
    state: AstTransformer,
    parent: cs.Node,
    expression: ts.PropertyAccessExpression
) {
    const tsSymbol = state.context.typeChecker.getSymbolAtLocation(expression);

    // check if member is delegated
    const delegation = state.context.getDelegatedName(tsSymbol);
    if (delegation != null) {
        return csf.identifier(parent, delegation);
    }

    const memberAccess = csf.memberAccess(
        parent,
        {} as cs.Expression,
        state.context.toPropertyNameCase(expression.name.text),
        expression
    );
    memberAccess.tsSymbol = tsSymbol;

    let convertToInvocation = false;

    if (memberAccess.tsSymbol) {
        if (state.context.isMethodSymbol(memberAccess.tsSymbol)) {
            memberAccess.member = state.context.buildMethodName(expression.name);
        } else if (state.context.isPropertySymbol(memberAccess.tsSymbol)) {
            memberAccess.member = state.context.toPropertyNameCase(expression.name.text);
        } else if (memberAccess.tsSymbol.flags & ts.SymbolFlags.EnumMember) {
            memberAccess.member = expression.name.text;
        }
    }

    if (
        memberAccess.tsSymbol &&
        expression.parent.kind === ts.SyntaxKind.CaseClause &&
        (expression.parent as ts.CaseClause).expression === expression
    ) {
        state.context.symbols.markConst(memberAccess.tsSymbol);
    }

    if (memberAccess.tsSymbol) {
        let parentSymbol = (memberAccess.tsSymbol as any).parent as ts.Symbol | undefined;
        if (!parentSymbol) {
            const propertyDeclaration = memberAccess.tsSymbol.declarations?.find(
                d => ts.isPropertyDeclaration(d) || ts.isPropertySignature(d)
            );
            if (propertyDeclaration) {
                parentSymbol =
                    propertyDeclaration.parent &&
                    (ts.isClassLike(propertyDeclaration.parent) ||
                        ts.isInterfaceDeclaration(propertyDeclaration.parent))
                        ? state.context.typeChecker.getSymbolAtLocation(propertyDeclaration.parent.name!)
                        : undefined;
            }
        }
        if (parentSymbol) {
            const renamed = getSymbolName(state, parentSymbol, memberAccess.tsSymbol!);
            if (renamed) {
                memberAccess.member = renamed;
            }

            convertToInvocation = convertPropertyToInvocation(state, parentSymbol, memberAccess.tsSymbol!);
        }
    }

    if (expression.questionDotToken) {
        memberAccess.nullSafe = true;
    }

    memberAccess.expression = state.visitExpression(memberAccess, expression.expression)!;
    if (!memberAccess.expression) {
        return null;
    }

    if (convertToInvocation && !ts.isCallExpression(expression.parent)) {
        const invocation: cs.InvocationExpression = {
            nodeType: cs.SyntaxKind.InvocationExpression,
            expression: memberAccess,
            arguments: [],
            tsNode: memberAccess.tsNode,
            tsSymbol: memberAccess.tsSymbol,
            parent: memberAccess.parent,
            skipEmit: memberAccess.skipEmit
        };

        memberAccess.parent = invocation;

        return state.smartCastLowering.wrapToSmartCast(parent, invocation, expression);
    }
    return state.smartCastLowering.wrapToSmartCast(parent, memberAccess, expression);
}

export function visitElementAccessExpression(
    state: AstTransformer,
    parent: cs.Node,
    expression: ts.ElementAccessExpression
) {
    // Enum[enumValue] => value.toString()
    // Enum[string] => TypeHelper.parseEnum<Type>(value, Type)
    if (isEnumFromOrToString(state, expression)) {
        const elementType = state.context.typeChecker.getTypeAtLocation(expression);

        if (elementType === state.context.typeChecker.getStringType()) {
            const callExpr = csf.invocation(parent, {} as cs.Expression, [], expression);

            const memberAccess = csf.memberAccess(
                callExpr,
                {} as cs.Expression,
                state.context.toMethodNameCase('toString'),
                expression
            );
            callExpr.expression = memberAccess;

            memberAccess.expression = state.visitExpression(memberAccess, expression.argumentExpression)!;
            if (!memberAccess.expression) {
                return null;
            }

            return callExpr;
        }

        const callExpr = csf.invocation(parent, {} as cs.Expression, [], expression);

        callExpr.expression = makeMemberAccess(
            state,
            callExpr,
            state.context.makeTypeName(AlphaTabCore.typeHelper),
            state.context.toMethodNameCase('parseEnum')
        );

        const enumType = state.context.typeChecker.getTypeAtLocation(expression.expression);
        callExpr.typeArguments = [
            createLazyTypeRef(state.context, callExpr, expression.argumentExpression, enumType, enumType.symbol)
        ];

        const typeOf: cs.TypeOfExpression = {
            nodeType: cs.SyntaxKind.TypeOfExpression,
            parent: callExpr
        };
        typeOf.type = createLazyTypeRef(
            state.context,
            typeOf,
            expression.argumentExpression,
            enumType,
            enumType.symbol
        );

        callExpr.arguments = [state.visitExpression(callExpr, expression.argumentExpression)!, typeOf];

        return callExpr;
    }

    const argumentSymbol = state.context.typeChecker.getSymbolAtLocation(expression.argumentExpression);
    const elementAccessMethod = argumentSymbol ? state.context.getNameFromSymbol(argumentSymbol) : '';
    if (elementAccessMethod) {
        const memberAccess = csf.memberAccess(
            parent,
            {} as cs.Expression,
            state.context.toMethodNameCase(elementAccessMethod),
            expression
        );
        memberAccess.nullSafe = !!expression.questionDotToken;

        memberAccess.expression = state.visitExpression(memberAccess, expression.expression)!;
        if (!memberAccess.expression) {
            return null;
        }

        return memberAccess;
    }

    const elementAccess = {
        expression: {} as cs.Expression,
        argumentExpression: {} as cs.Expression,
        parent: parent,
        tsNode: expression,
        nodeType: cs.SyntaxKind.ElementAccessExpression,
        nullSafe: !!expression.questionDotToken
    } as cs.ElementAccessExpression;

    elementAccess.expression = state.visitExpression(elementAccess, expression.expression)!;
    if (!elementAccess.expression) {
        return null;
    }

    const argumentExpression = state.visitExpression(elementAccess, expression.argumentExpression)!;
    if (!argumentExpression) {
        return null;
    }

    const symbol = state.context.typeChecker.getSymbolAtLocation(expression.expression);
    const isArrayTupleAccessor = state.context.isSymbolArrayTupleInstance(expression.expression);
    let type = symbol
        ? state.context.typeChecker.getTypeOfSymbolAtLocation(symbol!, expression.expression)
        : state.context.typeChecker.getTypeAtLocation(expression.expression);
    if (type) {
        type = state.context.typeChecker.getNonNullableType(type);
    }
    const isArrayAccessor =
        (!isArrayTupleAccessor && !symbol) ||
        (type && type.symbol && !!type.symbol.members?.has(ts.escapeLeadingUnderscores('slice')));

    const forceCast = false;
    if (isArrayAccessor) {
        const csArg = csf.castExpression(
            parent,
            csf.primitiveType(null!, cs.PrimitiveType.Int),
            {} as cs.Expression,
            expression.argumentExpression
        );
        elementAccess.argumentExpression = csArg;

        const par = csf.parenthesized(csArg, argumentExpression);
        argumentExpression.parent = par;
        csArg.expression = par;
    } else if (isArrayTupleAccessor) {
        let index = expression.argumentExpression;
        while (ts.isParenthesizedExpression(index)) {
            index = index.expression;
        }

        // x[0] -> x.V1
        if (ts.isNumericLiteral(index)) {
            const memberAccess = csf.memberAccess(
                parent,
                elementAccess.expression,
                state.context.toPropertyNameCase(`v${index.text}`),
                expression
            );
            memberAccess.nullSafe = !!expression.questionDotToken;
            return memberAccess;
        }
        // x[expr] -> x[expr] as Type
        state.context.addTsNodeDiagnostics(
            expression,
            'Dynamic expressions on tuple types are not supported',
            ts.DiagnosticCategory.Error
        );
    } else {
        elementAccess.argumentExpression = argumentExpression;
        argumentExpression.parent = elementAccess;
    }

    return state.smartCastLowering.wrapToSmartCast(parent, elementAccess, expression, forceCast);
}

export function visitIdentifier(state: AstTransformer, parent: cs.Node, expression: ts.Identifier) {
    if (expression.text === 'undefined') {
        return csf.nullLiteral(parent, expression);
    }

    const identifier = csf.identifier(parent, '', expression);
    identifier.tsSymbol = state.context.typeChecker.getSymbolAtLocation(expression);

    identifier.text = expression.text;

    if (identifier.tsSymbol) {
        if (identifier.tsSymbol) {
            if (state.context.isMethodSymbol(identifier.tsSymbol)) {
                identifier.text = state.context.toMethodNameCase(identifier.text);
            } else if (state.context.isPropertySymbol(identifier.tsSymbol)) {
                identifier.text = state.context.toPropertyNameCase(identifier.text);
            }
        }

        switch (expression.parent.kind) {
            case ts.SyntaxKind.PropertyAccessExpression:
            case ts.SyntaxKind.BinaryExpression:
                break;
            default:
                switch (identifier.tsSymbol.flags) {
                    case ts.SymbolFlags.Alias:
                    case ts.SymbolFlags.RegularEnum:
                        return {
                            parent: parent,
                            nodeType: cs.SyntaxKind.TypeOfExpression,
                            tsNode: expression,
                            expression: identifier
                        } as cs.TypeOfExpression;
                }
                break;
        }
    }

    return state.smartCastLowering.wrapToSmartCast(parent, identifier, expression);
}

export function getSymbolName(_state: AstTransformer, parentSymbol: ts.Symbol, symbol: ts.Symbol): string | null {
    switch (parentSymbol.name) {
        case TsBuiltin.Array:
            switch (symbol.name) {
                case 'length':
                    return 'Count';
                case 'reverse':
                    return 'Reversed';
                case 'push':
                    return 'Add';
            }
            break;
        case 'String':
            switch (symbol.name) {
                case 'includes':
                    return 'Contains';
                case 'trimRight':
                    return 'TrimEnd';
                case 'trimLeft':
                    return 'TrimStart';
                case 'substring':
                    return 'SubstringIndex';
            }
            break;
        case 'Number':
            switch (symbol.name) {
                case 'toString':
                    return 'ToInvariantString';
            }
            break;
    }
    return null;
}

export function convertPropertyToInvocation(
    _state: AstTransformer,
    parentSymbol: ts.Symbol,
    symbol: ts.Symbol
): boolean {
    switch (parentSymbol.name) {
        case TsBuiltin.Error:
            switch (symbol.name) {
                case 'stack':
                case 'cause':
                    return true;
            }
            break;
        // chai assertions
        case 'Assertion':
            return true;
    }
    return false;
}
