import ts from 'typescript';
import type AstTransformer from '../AstTransformer';
import * as cs from '../ir/Ir';
import * as csf from '../ir/IrFactory';
import { createLazyTypeRef } from '../TransformerHelpers';
import { AlphaTabCore } from '../typeRegistry';
import { makeMemberAccess } from './ExprHelpers';
import { makeParameter } from './Members';

export function visitFunctionExpression(state: AstTransformer, parent: cs.Node, expression: ts.FunctionExpression) {
    if (expression.name) {
        state.context.addTsNodeDiagnostics(
            expression,
            'Local functions with names have no matching kind in C#, name will be omitted',
            ts.DiagnosticCategory.Warning
        );
    }

    const lambdaExpression = {
        nodeType: cs.SyntaxKind.LambdaExpression,
        parent: parent,
        tsNode: expression,
        body: {} as cs.Expression,
        parameters: [],
        returnType: {} as cs.TypeNode
    } as cs.LambdaExpression;

    const signature = state.context.typeChecker.getSignatureFromDeclaration(expression);
    if (!signature) {
        state.context.addNodeDiagnostics(
            lambdaExpression,
            'Could not get signature for function',
            ts.DiagnosticCategory.Error
        );
        lambdaExpression.returnType = csf.primitiveType(lambdaExpression, cs.PrimitiveType.Void);
    } else {
        const returnType = signature.getReturnType();
        lambdaExpression.returnType = createLazyTypeRef(
            state.context,
            lambdaExpression,
            expression.type ?? expression,
            returnType
        );
    }

    for (const p of expression.parameters) {
        lambdaExpression.parameters.push(makeParameter(state, lambdaExpression, p));
    }

    lambdaExpression.body = state.visitBlock(lambdaExpression, expression.body);

    return lambdaExpression;
}

export function visitArrowExpression(state: AstTransformer, parent: cs.Node, expression: ts.ArrowFunction) {
    const lambdaExpression = {
        nodeType: cs.SyntaxKind.LambdaExpression,
        parent: parent,
        tsNode: expression,
        body: {} as cs.Expression,
        parameters: [],
        returnType: {} as cs.TypeNode
    } as cs.LambdaExpression;

    for (const p of expression.parameters) {
        lambdaExpression.parameters.push(makeParameter(state, lambdaExpression, p));
    }

    const signature = state.context.typeChecker.getSignatureFromDeclaration(expression);
    if (!signature) {
        state.context.addTsNodeDiagnostics(
            expression,
            'Could not find signature from arrow function',
            ts.DiagnosticCategory.Error
        );
        lambdaExpression.returnType = csf.primitiveType(lambdaExpression, cs.PrimitiveType.Void);
    } else {
        const returnType = state.context.typeChecker.getReturnTypeOfSignature(signature!);
        lambdaExpression.returnType = createLazyTypeRef(state.context, lambdaExpression, expression, returnType);
    }

    if (ts.isBlock(expression.body)) {
        lambdaExpression.body = state.visitBlock(lambdaExpression, expression.body);
    } else {
        lambdaExpression.body = state.visitExpression(lambdaExpression, expression.body)!;
        if (!lambdaExpression.body) {
            lambdaExpression.body = csf.block(lambdaExpression, []);
        }
    }

    return lambdaExpression;
}

export function visitFunctionDeclaration(state: AstTransformer, parent: cs.Node, expression: ts.FunctionDeclaration) {
    const localFunction: cs.LocalFunctionDeclaration = {
        name: (expression.name as ts.Identifier)?.text,
        nodeType: cs.SyntaxKind.LocalFunction,
        parent: parent,
        tsNode: expression,
        body: {} as cs.Block,
        parameters: [],
        returnType: {} as cs.TypeNode
    };

    for (const p of expression.parameters) {
        localFunction.parameters.push(makeParameter(state, localFunction, p));
    }

    const signature = state.context.typeChecker.getSignatureFromDeclaration(expression);
    if (!signature) {
        state.context.addNodeDiagnostics(
            localFunction,
            'Could not get signature for function',
            ts.DiagnosticCategory.Error
        );
        localFunction.returnType = csf.primitiveType(localFunction, cs.PrimitiveType.Void);
    } else {
        const returnType = signature.getReturnType();
        localFunction.returnType = createLazyTypeRef(
            state.context,
            localFunction,
            expression.type ?? expression,
            returnType
        );
    }

    if (expression.body) {
        localFunction.body = state.visitBlock(localFunction, expression.body);
    } else {
        localFunction.body = csf.block(localFunction, []);
    }

    return localFunction;
}

export function visitYieldExpression(state: AstTransformer, parent: cs.Node, expression: ts.YieldExpression) {
    const yieldExpression = {
        expression: {} as cs.Expression,
        member: 'Value',
        parent: parent,
        tsNode: expression,
        nodeType: cs.SyntaxKind.YieldExpression
    } as cs.YieldExpression;

    yieldExpression.expression = expression.expression
        ? state.visitExpression(yieldExpression, expression.expression)
        : null;

    if (expression.expression && !yieldExpression.expression) {
        return null;
    }

    return yieldExpression;
}

export function visitAwaitExpression(state: AstTransformer, parent: cs.Node, expression: ts.AwaitExpression) {
    const awaitExpression = {
        parent: parent,
        nodeType: cs.SyntaxKind.AwaitExpression,
        tsNode: expression,
        expression: {} as cs.Expression
    } as cs.AwaitExpression;

    awaitExpression.expression = state.visitExpression(awaitExpression, expression.expression)!;
    if (!awaitExpression.expression) {
        return null;
    }

    return awaitExpression;
}

export function visitTypeOfExpression(state: AstTransformer, parent: cs.Node, expression: ts.TypeOfExpression) {
    // AlphaTab.Core.TypeHelper.TypeOf(expr)
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
        state.context.toMethodNameCase('typeOf')
    );
    const e = state.visitExpression(csExpr, expression.expression);
    if (e) {
        csExpr.arguments.push(e);
    }

    return csExpr;
}

export function visitSuperLiteralExpression(_state: AstTransformer, parent: cs.Node, expression: ts.SuperExpression) {
    const csExpr = {
        parent: parent,
        tsNode: expression,
        nodeType: cs.SyntaxKind.BaseLiteralExpression
    } as cs.BaseLiteralExpression;

    return csExpr;
}

export function visitThisExpression(state: AstTransformer, parent: cs.Node, expression: ts.ThisExpression) {
    if (cs.isMemberAccessExpression(parent) && parent.tsSymbol && state.context.isStaticSymbol(parent.tsSymbol)) {
        const identifier = {
            parent: parent,
            tsNode: expression,
            tsSymbol: state.context.typeChecker.getSymbolAtLocation(expression),
            nodeType: cs.SyntaxKind.Identifier,
            text: parent.tsSymbol.name
        } as cs.Identifier;

        return identifier;
    }
    const csExpr = {
        parent: parent,
        tsNode: expression,
        nodeType: cs.SyntaxKind.ThisLiteral
    } as cs.ThisLiteral;

    return csExpr;
}

export function visitParenthesizedExpression(
    state: AstTransformer,
    parent: cs.Node,
    expression: ts.ParenthesizedExpression
) {
    const csExpr = {
        parent: parent,
        tsNode: expression,
        nodeType: cs.SyntaxKind.ParenthesizedExpression,
        expression: {} as cs.Expression
    } as cs.ParenthesizedExpression;

    csExpr.expression = state.visitExpression(csExpr, expression.expression)!;
    if (!csExpr.expression) {
        return null;
    }

    return csExpr;
}
