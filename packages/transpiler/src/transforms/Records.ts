import ts from 'typescript';
import type AstTransformer from '../AstTransformer';
import * as cs from '../ir/Ir';
import * as csf from '../ir/IrFactory';
import { findTag, JsDocTag } from '../jsDocTags';
import { createLazyTypeRef } from '../TransformerHelpers';
import { AlphaTabCore, TsBuiltin } from '../typeRegistry';
import { makeParameter } from './Members';

export let _recordCreation = 0;

export function visitObjectLiteralExpression(
    state: AstTransformer,
    parent: cs.Node,
    expression: ts.ObjectLiteralExpression
) {
    let type = state.context.typeChecker.getContextualType(expression);
    let isRecord = type?.symbol?.declarations?.some(d => state.context.isRecord(d)) || _recordCreation > 0;
    const isDiscriminatedUnion =
        type?.symbol?.declarations?.some(d => state.context.isDiscriminatedUnion(d)) ||
        type?.aliasSymbol?.declarations?.some(d => state.context.isDiscriminatedUnion(d));

    if (isDiscriminatedUnion) {
        return visitDiscriminatedUnionCreate(state, parent, expression);
    }

    const isBuiltinRecord = (t: ts.Type | undefined | null) =>
        t?.aliasSymbol?.name === TsBuiltin.Record || t?.getNonNullableType()?.aliasSymbol?.name === TsBuiltin.Record;

    if (isBuiltinRecord(type)) {
        return visitBuiltinRecordLiteralExpression(state, parent, expression, type!);
    }

    // assignment of object literal to property without giving type
    // -> try to use specific type of property
    if (!isRecord) {
        if (
            ts.isBinaryExpression(expression.parent) &&
            expression.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken
        ) {
            const propertyType = state.context.typeChecker.getNonNullableType(
                state.context.typeChecker.getTypeAtLocation(expression.parent.left)
            );
            if (!propertyType.isUnion() && propertyType.symbol?.declarations?.some(d => state.context.isRecord(d))) {
                isRecord = true;
                type = propertyType;
            }
        } else {
            const returnStatement = ts.findAncestor(expression, t => t.kind === ts.SyntaxKind.ReturnStatement);
            if (returnStatement) {
                const returnType = state.context.typeChecker.getNonNullableType(
                    state.context.typeChecker.getContextualType((returnStatement as ts.ReturnStatement).expression!) ??
                        state.context.typeChecker.getTypeAtLocation((returnStatement as ts.ReturnStatement).expression!)
                );
                if (!returnType.isUnion() && returnType.symbol?.declarations?.some(d => state.context.isRecord(d))) {
                    isRecord = true;
                    type = returnType;
                }
            }
        }
    }

    if (isRecord) {
        _recordCreation++;

        const newObject = csf.newExpression(parent, createLazyTypeRef(state.context, null, expression, type), []);

        for (const p of expression.properties) {
            const assignment = csf.labeledExpression(newObject, '', {} as cs.Expression);

            if (ts.isPropertyAssignment(p)) {
                assignment.label = p.name.getText();
                assignment.expression = state.visitExpression(assignment, p.initializer)!;
                newObject.arguments.push(assignment);
            } else if (ts.isShorthandPropertyAssignment(p)) {
                assignment.label = p.name.getText();
                if (p.objectAssignmentInitializer) {
                    assignment.expression = state.visitExpression(assignment, p.objectAssignmentInitializer)!;
                } else {
                    assignment.expression = csf.identifier(assignment, p.name.getText(), p.name);
                }
                newObject.arguments.push(assignment);
            } else if (ts.isSpreadAssignment(p)) {
                state.context.addTsNodeDiagnostics(p, 'Spread operator not supported', ts.DiagnosticCategory.Error);
            } else if (ts.isMethodDeclaration(p)) {
                state.context.addTsNodeDiagnostics(
                    p,
                    'Method declarations in object literals not supported',
                    ts.DiagnosticCategory.Error
                );
            } else if (ts.isGetAccessorDeclaration(p)) {
                state.context.addTsNodeDiagnostics(
                    p,
                    'Get accessor declarations in object literals not supported',
                    ts.DiagnosticCategory.Error
                );
            } else if (ts.isSetAccessorDeclaration(p)) {
                state.context.addTsNodeDiagnostics(
                    p,
                    'Set accessor declarations in object literals not supported',
                    ts.DiagnosticCategory.Error
                );
            }
        }

        if (
            type?.aliasSymbol?.name === TsBuiltin.Record ||
            type?.getNonNullableType()?.aliasSymbol?.name === TsBuiltin.Record
        ) {
            const exprs = newObject.arguments;
            newObject.arguments = [];
            for (const e of exprs) {
                const label = e as cs.LabeledExpression;

                const newTupleExpr = {
                    parent: parent,
                    tsNode: expression,
                    nodeType: cs.SyntaxKind.NewExpression,
                    type: null!,
                    arguments: []
                } as cs.NewExpression;
                newObject.arguments.push(newTupleExpr);

                newTupleExpr.type = state.context.makeArrayTupleType(newTupleExpr, []);
                const csTupleType = newTupleExpr.type as cs.ArrayTupleNode;

                csTupleType.types.push({
                    nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                    type: cs.PrimitiveType.String
                } as cs.PrimitiveTypeNode);

                const typeArgs = type!.aliasTypeArguments ?? type?.getNonNullableType()?.aliasTypeArguments;

                csTupleType.types.push(
                    createLazyTypeRef(state.context, csTupleType, expression, typeArgs![1], typeArgs![1]!.symbol)
                );

                newTupleExpr.arguments.push({
                    nodeType: cs.SyntaxKind.StringLiteral,
                    text: label.label
                } as cs.StringLiteral);

                newTupleExpr.arguments.push(label.expression);
            }
        }

        _recordCreation--;

        return newObject;
    }

    const objectLiteral = {
        parent: parent,
        tsNode: expression,
        nodeType: cs.SyntaxKind.AnonymousObjectCreationExpression,
        properties: []
    } as cs.AnonymousObjectCreationExpression;

    for (const p of expression.properties) {
        if (ts.isPropertyAssignment(p)) {
            const assignment = {
                parent: objectLiteral,
                nodeType: cs.SyntaxKind.AnonymousObjectProperty,
                name: p.name.getText(),
                value: {} as cs.Expression
            } as cs.AnonymousObjectProperty;

            assignment.value = state.visitExpression(objectLiteral, p.initializer)!;
            if (assignment.value) {
                objectLiteral.properties.push(assignment);
            }
        } else if (ts.isShorthandPropertyAssignment(p)) {
            const assignment = {
                parent: objectLiteral,
                nodeType: cs.SyntaxKind.AnonymousObjectProperty,
                name: p.name.getText(),
                value: {} as cs.Expression
            } as cs.AnonymousObjectProperty;

            if (p.objectAssignmentInitializer) {
                assignment.value = state.visitExpression(objectLiteral, p.objectAssignmentInitializer!)!;
            } else {
                assignment.value = csf.identifier(assignment, p.name.getText(), p.name);
            }
            if (assignment.value) {
                objectLiteral.properties.push(assignment);
            }
        } else if (ts.isSpreadAssignment(p)) {
            state.context.addTsNodeDiagnostics(p, 'Spread operator not supported', ts.DiagnosticCategory.Error);
        } else if (ts.isMethodDeclaration(p)) {
            const assignment = {
                parent: objectLiteral,
                nodeType: cs.SyntaxKind.AnonymousObjectProperty,
                name: p.name.getText(),
                value: {} as cs.Expression
            } as cs.AnonymousObjectProperty;

            const lambda = {
                nodeType: cs.SyntaxKind.LambdaExpression,
                parent: objectLiteral,
                parameters: [],
                body: {} as cs.Block,
                tsNode: p,
                returnType: {} as cs.TypeNode
            } as cs.LambdaExpression;

            const signature = state.context.typeChecker.getSignatureFromDeclaration(p);
            if (!signature) {
                state.context.addNodeDiagnostics(
                    lambda,
                    'Could not get signature for function',
                    ts.DiagnosticCategory.Error
                );
                lambda.returnType = csf.primitiveType(lambda, cs.PrimitiveType.Void);
            } else {
                const returnType = signature.getReturnType();
                lambda.returnType = createLazyTypeRef(state.context, lambda, p.type ?? p, returnType);
            }

            for (const param of p.parameters) {
                lambda.parameters.push(makeParameter(state, lambda, param));
            }
            lambda.body = state.visitBlock(parent, p.body!);

            assignment.value = lambda;

            objectLiteral.properties.push(assignment);
        } else if (ts.isGetAccessorDeclaration(p)) {
            state.context.addTsNodeDiagnostics(
                p,
                'Get accessor declarations in object literals not supported',
                ts.DiagnosticCategory.Error
            );
        } else if (ts.isSetAccessorDeclaration(p)) {
            state.context.addTsNodeDiagnostics(
                p,
                'Set accessor declarations in object literals not supported',
                ts.DiagnosticCategory.Error
            );
        }
    }

    return objectLiteral;
}

export function visitBuiltinRecordLiteralExpression(
    state: AstTransformer,
    parent: cs.Node,
    expression: ts.ObjectLiteralExpression,
    type: ts.Type
): cs.Expression {
    const effectiveType = type.aliasSymbol?.name === TsBuiltin.Record ? type : type.getNonNullableType();
    const typeArgs = (effectiveType as ts.TypeReference).aliasTypeArguments;

    const dummy = { parent, tsNode: expression, nodeType: cs.SyntaxKind.NewExpression } as cs.Node;
    const keyTypeNode = typeArgs?.[0]
        ? createLazyTypeRef(state.context, dummy, expression, typeArgs[0])
        : ({ nodeType: cs.SyntaxKind.PrimitiveTypeNode, type: cs.PrimitiveType.String } as cs.PrimitiveTypeNode);
    const valueTypeNode = typeArgs?.[1]
        ? createLazyTypeRef(state.context, dummy, expression, typeArgs[1])
        : ({ nodeType: cs.SyntaxKind.PrimitiveTypeNode, type: cs.PrimitiveType.Object } as cs.PrimitiveTypeNode);

    // Use Record<,> as the concrete construction type (inherits from Map<,>),
    // so the result is assignable to Record<>, Map<>, IMap<>, and IDictionary<>
    // parameters alike.
    const recordTypeRef: cs.TypeReference = {
        nodeType: cs.SyntaxKind.TypeReference,
        parent: dummy,
        tsNode: expression,
        reference: state.context.makeTypeName(AlphaTabCore.recordType),
        typeArguments: [keyTypeNode, valueTypeNode],
        isAsync: false
    };
    keyTypeNode.parent = recordTypeRef;
    valueTypeNode.parent = recordTypeRef;

    const newObject = csf.newExpression(parent, recordTypeRef, [], expression);

    for (const p of expression.properties) {
        if (!ts.isPropertyAssignment(p) && !ts.isShorthandPropertyAssignment(p)) {
            state.context.addTsNodeDiagnostics(
                p,
                'Only simple property assignments are supported in Record<K,V> literals',
                ts.DiagnosticCategory.Error
            );
            continue;
        }

        const label = p.name.getText();
        const valueExpr = ts.isPropertyAssignment(p)
            ? state.visitExpression(newObject, p.initializer)!
            : csf.identifier(newObject, label, p.name);

        const tupleExpr = {
            parent: newObject,
            tsNode: expression,
            nodeType: cs.SyntaxKind.NewExpression,
            type: null!,
            arguments: [{ nodeType: cs.SyntaxKind.StringLiteral, text: label } as cs.StringLiteral, valueExpr]
        } as cs.NewExpression;

        tupleExpr.type = state.context.makeArrayTupleType(tupleExpr, []);
        const tupleTypeNode = tupleExpr.type as cs.ArrayTupleNode;
        tupleTypeNode.types.push(keyTypeNode);
        tupleTypeNode.types.push(valueTypeNode);

        newObject.arguments.push(tupleExpr);
    }

    return newObject;
}

export function visitDiscriminatedUnionCreate(
    state: AstTransformer,
    parent: cs.Node,
    expression: ts.ObjectLiteralExpression
) {
    const unionType = state.context.typeChecker.getContextualType(expression)! as ts.UnionType;

    // find concrete type within unionType with which the expression matches

    const tag = findTag(unionType.aliasSymbol!.declarations![0], JsDocTag.discriminated)!;
    const values = (tag.comment as string).split(' ');
    const discriminatorField = values[0];

    const discriminatorProp = expression.properties.find(
        p => ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) && p.name.text === discriminatorField
    ) as ts.PropertyAssignment;

    const discriminatorValue = ts.isStringLiteral(discriminatorProp!.initializer)
        ? discriminatorProp.initializer.text
        : undefined;

    const matching = unionType.types.find(memberType => {
        const prop = memberType.getProperty(discriminatorField);
        if (!prop) {
            return false;
        }
        const propType = state.context.typeChecker.getTypeOfSymbolAtLocation(prop, expression);
        return (
            propType.flags & ts.TypeFlags.StringLiteral &&
            (propType as ts.StringLiteralType).value === discriminatorValue
        );
    });

    if (!matching) {
        state.context.addNodeDiagnostics(parent, 'Could not resolve concrete union type', ts.DiagnosticCategory.Error);
        return null;
    }

    const newObject = csf.newExpression(parent, createLazyTypeRef(state.context, null, expression, matching), []);
    newObject.objectInitializers = [];

    for (const p of expression.properties) {
        const assignment = csf.labeledExpression(newObject, '', {} as cs.Expression);

        if (ts.isPropertyAssignment(p)) {
            assignment.label = state.context.toPropertyNameCase(p.name.getText());
            assignment.expression = state.visitExpression(assignment, p.initializer)!;
            newObject.objectInitializers!.push(assignment);
        } else if (ts.isShorthandPropertyAssignment(p)) {
            assignment.label = state.context.toPropertyNameCase(p.name.getText());
            if (p.objectAssignmentInitializer) {
                assignment.expression = state.visitExpression(assignment, p.objectAssignmentInitializer)!;
            } else {
                assignment.expression = csf.identifier(assignment, p.name.getText(), p.name);
            }
            newObject.objectInitializers!.push(assignment);
        } else if (ts.isSpreadAssignment(p)) {
            state.context.addTsNodeDiagnostics(p, 'Spread operator not supported', ts.DiagnosticCategory.Error);
        } else if (ts.isMethodDeclaration(p)) {
            state.context.addTsNodeDiagnostics(
                p,
                'Method declarations in object literals not supported',
                ts.DiagnosticCategory.Error
            );
        } else if (ts.isGetAccessorDeclaration(p)) {
            state.context.addTsNodeDiagnostics(
                p,
                'Get accessor declarations in object literals not supported',
                ts.DiagnosticCategory.Error
            );
        } else if (ts.isSetAccessorDeclaration(p)) {
            state.context.addTsNodeDiagnostics(
                p,
                'Set accessor declarations in object literals not supported',
                ts.DiagnosticCategory.Error
            );
        }
    }

    return newObject;
}
