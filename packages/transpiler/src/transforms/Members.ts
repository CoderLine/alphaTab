import ts from 'typescript';
import type AstTransformer from '../AstTransformer';
import * as cs from '../ir/Ir';
import * as csf from '../ir/IrFactory';
import { hasTag, JsDocTag } from '../jsDocTags';
import {
    createLazyTypeRef,
    getVisibility,
    mapVisibility,
    shouldSkip,
    visitDocumentationAttributes
} from '../TransformerHelpers';
import { visitDocumentation, visitTypeParameterDeclaration } from './Declarations';

export function visitPropertyDeclaration(
    state: AstTransformer,
    parent: cs.ClassDeclaration | cs.InterfaceDeclaration,
    classElement: ts.PropertyDeclaration
) {
    const visibility = mapVisibility(state.context, classElement, cs.Visibility.Public);
    const type = state.context.typeChecker.getTypeAtLocation(classElement);
    const csProperty: cs.PropertyDeclaration = {
        parent: parent,
        nodeType: cs.SyntaxKind.PropertyDeclaration,
        isAbstract: false,
        isOverride: false,
        isStatic: false,
        isVirtual: false,
        name: state.context.toPropertyNameCase(classElement.name.getText()),
        type: createLazyTypeRef(state.context, null, classElement.type ?? classElement, type),
        visibility: visibility,
        tsNode: classElement,
        tsSymbol: state.context.symbols.getSymbolForDeclaration(classElement),
        skipEmit: shouldSkip(classElement, false, state.context.targetTag)
    };

    if (classElement.name) {
        csProperty.documentation = visitDocumentation(state, classElement.name);
    }

    visitDocumentationAttributes(state.context, state.attributeNames, csProperty, classElement);
    applyPropertyOverride(state, csProperty, classElement);

    let isReadonly = false;
    if (classElement.modifiers) {
        for (const m of classElement.modifiers) {
            switch (m.kind) {
                case ts.SyntaxKind.AbstractKeyword:
                    csProperty.isAbstract = true;
                    if (cs.isClassDeclaration(parent)) {
                        parent.isAbstract = true;
                    }
                    csProperty.isVirtual = false;
                    csProperty.isOverride = false;
                    break;
                case ts.SyntaxKind.StaticKeyword:
                    csProperty.isStatic = true;
                    csProperty.isVirtual = false;
                    csProperty.isOverride = false;
                    break;
                case ts.SyntaxKind.ReadonlyKeyword:
                    isReadonly = true;
                    break;
            }
        }
    }

    csProperty.type.parent = csProperty;
    csProperty.getAccessor = csf.propertyAccessor(csProperty, 'get');

    if (!isReadonly) {
        csProperty.setAccessor = csf.propertyAccessor(csProperty, 'set');
    }

    if (classElement.initializer) {
        state.declarationOrAssignmentTypeStack.push(type);
        csProperty.initializer = state.visitExpression(csProperty, classElement.initializer) ?? undefined;
        state.declarationOrAssignmentTypeStack.pop();
    } else if (classElement.exclamationToken) {
        if (state.context.isValueType(type)) {
            const isBool =
                (type.flags & ts.TypeFlags.Boolean) !== 0 || (type.flags & ts.TypeFlags.BooleanLiteral) !== 0;
            csProperty.initializer = isBool
                ? csf.falseLiteral(csProperty, csProperty.tsNode)
                : csf.numericLiteral(csProperty, '0', csProperty.tsNode);
        } else {
            const nonNull = csf.nonNullExpression(csProperty, null!, csProperty.tsNode);
            nonNull.expression = csf.nullLiteral(nonNull, csProperty.tsNode);
            csProperty.initializer = nonNull;
        }
    }

    parent.members.push(csProperty);

    state.context.symbols.register(csProperty);

    return csProperty;
}

export function visitMethodDeclaration(
    state: AstTransformer,
    parent: cs.ClassDeclaration | cs.InterfaceDeclaration,
    classElement: ts.MethodDeclaration
) {
    const signature = state.context.typeChecker.getSignatureFromDeclaration(classElement);
    const returnType: ts.Type | undefined = signature
        ? state.context.typeChecker.getReturnTypeOfSignature(signature)
        : undefined;

    const csMethod: cs.MethodDeclaration = {
        parent: parent,
        nodeType: cs.SyntaxKind.MethodDeclaration,
        isAbstract: false,
        isOverride: false,
        isStatic: false,
        isVirtual: false,
        isTestMethod: false,
        isGeneratorFunction: !!classElement.asteriskToken,
        partial: hasTag(classElement, JsDocTag.partial),
        name: state.context.buildMethodName(classElement.name),
        parameters: [],
        returnType: createLazyTypeRef(state.context, null, classElement.type ?? classElement, returnType),
        visibility: mapVisibility(state.context, classElement, cs.Visibility.Public),
        tsNode: classElement,
        tsSymbol: state.context.symbols.getSymbolForDeclaration(classElement),
        skipEmit: shouldSkip(classElement, false, state.context.targetTag)
    };

    if (classElement.name) {
        csMethod.documentation = visitDocumentation(state, classElement.name);
    }

    visitDocumentationAttributes(state.context, state.attributeNames, csMethod, classElement);
    applyMethodOverride(state, csMethod, classElement);

    if (classElement.modifiers) {
        for (const m of classElement.modifiers) {
            switch (m.kind) {
                case ts.SyntaxKind.AbstractKeyword:
                    csMethod.isAbstract = true;
                    if (cs.isClassDeclaration(parent)) {
                        parent.isAbstract = true;
                    }
                    csMethod.isVirtual = false;
                    break;
                case ts.SyntaxKind.StaticKeyword:
                    csMethod.isStatic = true;
                    csMethod.isVirtual = false;
                    csMethod.isOverride = false;
                    break;
                case ts.SyntaxKind.AsyncKeyword:
                    csMethod.isAsync = true;
                    break;
            }
        }
    }

    csMethod.returnType.parent = csMethod;

    if (classElement.typeParameters && classElement.typeParameters.length > 0) {
        csMethod.typeParameters = [];
        for (const p of classElement.typeParameters) {
            const csp = visitTypeParameterDeclaration(state, csMethod, p);
            csMethod.typeParameters!.push(csp);
        }
    }

    for (const p of classElement.parameters) {
        visitMethodParameter(state, csMethod, p);
    }

    if (classElement.body && !csMethod.skipEmit) {
        csMethod.body = state.visitBlock(csMethod, classElement.body);
    }

    switch (csMethod.name) {
        case state.context.toMethodNameCase('toString'):
            if (csMethod.parameters.length === 0) {
                csMethod.isVirtual = false;
                csMethod.isOverride = true;
            }
            break;
        case state.context.toMethodNameCase('equals'):
            if (csMethod.parameters.length === 1) {
                csMethod.isVirtual = false;
                csMethod.isOverride = true;
            }
            break;
    }

    if (!csMethod.skipEmit) {
        parent.members.push(csMethod);
    }

    state.context.symbols.register(csMethod);

    return csMethod;
}

export function visitMethodSignature(
    state: AstTransformer,
    parent: cs.ClassDeclaration | cs.InterfaceDeclaration,
    classElement: ts.MethodSignature
): cs.MethodDeclaration {
    const signature = state.context.typeChecker.getSignatureFromDeclaration(classElement);
    const returnType = state.context.typeChecker.getReturnTypeOfSignature(signature!);

    const csMethod: cs.MethodDeclaration = {
        parent: parent,
        nodeType: cs.SyntaxKind.MethodDeclaration,
        isAbstract: false,
        isOverride: false,
        isStatic: false,
        isVirtual: false,
        isTestMethod: false,
        isGeneratorFunction: false,
        partial: hasTag(classElement, JsDocTag.partial),
        name: state.context.buildMethodName(classElement.name),
        parameters: [],
        returnType: createLazyTypeRef(state.context, null, classElement.type ?? classElement, returnType),
        visibility: cs.Visibility.None,
        tsNode: classElement,
        skipEmit: shouldSkip(classElement, false, state.context.targetTag)
    };

    if (classElement.name) {
        csMethod.documentation = visitDocumentation(state, classElement.name);
    }

    visitDocumentationAttributes(state.context, state.attributeNames, csMethod, classElement);
    csMethod.returnType.parent = csMethod;

    if (classElement.typeParameters && classElement.typeParameters.length > 0) {
        csMethod.typeParameters = [];
        for (const p of classElement.typeParameters) {
            const csp = {
                parent: csMethod,
                name: p.name.text,
                nodeType: cs.SyntaxKind.TypeParameterDeclaration,
                tsNode: p
            } as cs.TypeParameterDeclaration;
            if (p.constraint) {
                csp.constraint = createLazyTypeRef(state.context, csp, p.constraint);
            }

            csMethod.typeParameters!.push(csp);
        }
    }

    for (const p of classElement.parameters) {
        visitMethodParameter(state, csMethod, p);
    }

    if (!csMethod.skipEmit) {
        parent.members.push(csMethod);
    }

    state.context.symbols.register(csMethod);

    return csMethod;
}

export function visitGetAccessor(
    state: AstTransformer,
    parent: cs.ClassDeclaration,
    classElement: ts.GetAccessorDeclaration
) {
    const propertyName = state.context.toPropertyNameCase(classElement.name.getText());
    const member = parent.members.find(m => m.name === propertyName);
    if (member && cs.isPropertyDeclaration(member)) {
        member.getAccessor = csf.propertyAccessor(
            member,
            'get',
            classElement.body ? state.visitBlock(member, classElement.body) : undefined,
            classElement
        );

        applyPropertyOverride(state, member, classElement);
    } else {
        const signature = state.context.typeChecker.getSignatureFromDeclaration(classElement);
        const returnType = state.context.typeChecker.getReturnTypeOfSignature(signature!);

        const newProperty: cs.PropertyDeclaration = {
            isAbstract: false,
            isOverride: false,
            isVirtual: false,
            isStatic: false,
            name: propertyName,
            nodeType: cs.SyntaxKind.PropertyDeclaration,
            parent: parent,
            visibility: mapVisibility(state.context, classElement, cs.Visibility.Public),
            type: createLazyTypeRef(state.context, null, classElement.type ?? classElement, returnType),
            skipEmit: shouldSkip(classElement, false, state.context.targetTag),
            tsNode: classElement,
            tsSymbol: state.context.symbols.getSymbolForDeclaration(classElement)
        };

        applyPropertyOverride(state, newProperty, classElement);

        if (classElement.modifiers) {
            for (const m of classElement.modifiers) {
                switch (m.kind) {
                    case ts.SyntaxKind.AbstractKeyword:
                        newProperty.isAbstract = true;
                        parent.isAbstract = true;
                        newProperty.isVirtual = false;
                        newProperty.isOverride = false;
                        break;
                    case ts.SyntaxKind.StaticKeyword:
                        newProperty.isStatic = true;
                        newProperty.isVirtual = false;
                        newProperty.isOverride = false;
                        break;
                }
            }
        }

        newProperty.type.parent = newProperty;

        newProperty.getAccessor = csf.propertyAccessor(
            newProperty,
            'get',
            classElement.body ? state.visitBlock(newProperty, classElement.body) : undefined,
            classElement
        );

        parent.members.push(newProperty);
    }
}

export function visitSetAccessor(
    state: AstTransformer,
    parent: cs.ClassDeclaration,
    classElement: ts.SetAccessorDeclaration
) {
    const propertyName = state.context.toPropertyNameCase(classElement.name.getText());
    const setParamName = classElement.parameters[0]?.name.getText();
    const member = parent.members.find(m => m.name === propertyName);
    if (member && cs.isPropertyDeclaration(member)) {
        member.setAccessor = csf.propertyAccessor(
            member,
            'set',
            classElement.body ? state.visitBlock(member, classElement.body) : undefined,
            classElement
        );
        member.setAccessor.valueParameterName = setParamName !== 'value' ? setParamName : undefined;

        applyPropertyOverride(state, member, classElement);

        return member.setAccessor;
    }
    const setParam = classElement.parameters[0];
    const setParamType = setParam
        ? state.context.typeChecker.getTypeAtLocation(setParam)
        : state.context.typeChecker.getReturnTypeOfSignature(
              state.context.typeChecker.getSignatureFromDeclaration(classElement)!
          );

    const newProperty: cs.PropertyDeclaration = {
        isAbstract: false,
        isOverride: false,
        isVirtual: false,
        isStatic: false,
        name: propertyName,
        nodeType: cs.SyntaxKind.PropertyDeclaration,
        parent: parent,
        visibility: mapVisibility(state.context, classElement, cs.Visibility.Public),
        type: createLazyTypeRef(state.context, null, setParam?.type ?? classElement, setParamType),
        skipEmit: shouldSkip(classElement, false, state.context.targetTag),
        tsNode: classElement,
        tsSymbol: state.context.symbols.getSymbolForDeclaration(classElement)
    };

    applyPropertyOverride(state, newProperty, classElement);

    if (classElement.modifiers) {
        for (const m of classElement.modifiers) {
            switch (m.kind) {
                case ts.SyntaxKind.AbstractKeyword:
                    newProperty.isAbstract = true;
                    parent.isAbstract = true;
                    newProperty.isVirtual = false;
                    newProperty.isOverride = false;
                    break;
                case ts.SyntaxKind.StaticKeyword:
                    newProperty.isStatic = true;
                    newProperty.isVirtual = false;
                    newProperty.isOverride = false;
                    break;
            }
        }
    }

    newProperty.type.parent = newProperty;

    newProperty.setAccessor = csf.propertyAccessor(
        newProperty,
        'set',
        classElement.body ? state.visitBlock(newProperty, classElement.body) : undefined,
        classElement
    );
    newProperty.setAccessor.valueParameterName = setParamName !== 'value' ? setParamName : undefined;

    parent.members.push(newProperty);

    return newProperty.setAccessor;
}

export function visitConstructorDeclaration(
    state: AstTransformer,
    parent: cs.ClassDeclaration,
    classElement: ts.ConstructorDeclaration
) {
    const csConstructor: cs.ConstructorDeclaration = {
        parent: parent,
        nodeType: cs.SyntaxKind.ConstructorDeclaration,
        name: '.ctor',
        parameters: [],
        isStatic: false,
        visibility: mapVisibility(state.context, classElement, cs.Visibility.Public),
        tsNode: classElement,
        skipEmit: shouldSkip(classElement, false, state.context.targetTag)
    };

    // Collect parameter properties (constructor params with visibility/readonly
    // modifiers) so we can synthesise PropertyDeclarations + assignment
    // statements below. The parameter itself still flows through normal
    // visitMethodParameter so it stays in the signature.
    const parameterProperties: Array<{
        propName: string;
        paramName: string;
        tsParam: ts.ParameterDeclaration;
    }> = [];

    for (const p of classElement.parameters) {
        visitMethodParameter(state, csConstructor, p);
        if (ts.isParameterPropertyDeclaration(p, p.parent) && ts.isIdentifier(p.name)) {
            _addParameterProperty(state, parent, p, parameterProperties);
        }
    }

    if (classElement.body) {
        csConstructor.body = state.visitBlock(csConstructor, classElement.body);
        const block = csConstructor.body as cs.Block;
        if (
            block.statements.length > 0 &&
            cs.isExpressionStatement(block.statements[0]) &&
            cs.isInvocationExpression((block.statements[0] as cs.ExpressionStatement).expression) &&
            cs.isBaseLiteralExpression(
                ((block.statements[0] as cs.ExpressionStatement).expression as cs.InvocationExpression).expression
            )
        ) {
            csConstructor.baseConstructorArguments = (
                (block.statements[0] as cs.ExpressionStatement).expression as cs.InvocationExpression
            ).arguments;
            block.statements.shift();

            // subclassing errors with cause forwarding
            if (
                csConstructor.baseConstructorArguments.length === 2 &&
                cs.isAnonymousObjectCreationExpression(csConstructor.baseConstructorArguments[1]) &&
                csConstructor.baseConstructorArguments[1].properties.find(p => p.name === 'cause')
            ) {
                csConstructor.baseConstructorArguments[1] = csConstructor.baseConstructorArguments[1].properties.find(
                    p => p.name === 'cause'
                )!.value;
            }
        }

        if (parameterProperties.length > 0) {
            const assignments: cs.Statement[] = parameterProperties.map(pp =>
                _buildParameterPropertyAssignment(block, pp.propName, pp.paramName, pp.tsParam)
            );
            block.statements.unshift(...assignments);
        }
    }

    parent.members.push(csConstructor);
    return csConstructor;
}

function _addParameterProperty(
    state: AstTransformer,
    parent: cs.ClassDeclaration,
    p: ts.ParameterDeclaration,
    collector: Array<{ propName: string; paramName: string; tsParam: ts.ParameterDeclaration }>
): void {
    const paramName = (p.name as ts.Identifier).text;
    const propName = state.context.toPropertyNameCase(paramName);

    const symbol = state.context.typeChecker.getSymbolAtLocation(p.name);
    const type = symbol
        ? state.context.typeChecker.getTypeOfSymbolAtLocation(symbol, p)
        : state.context.typeChecker.getTypeAtLocation(p);

    let isReadonly = false;
    if (p.modifiers) {
        for (const m of p.modifiers) {
            if (m.kind === ts.SyntaxKind.ReadonlyKeyword) {
                isReadonly = true;
            }
        }
    }

    const csProperty: cs.PropertyDeclaration = {
        parent: parent,
        nodeType: cs.SyntaxKind.PropertyDeclaration,
        isAbstract: false,
        isOverride: false,
        isStatic: false,
        isVirtual: false,
        name: propName,
        type: createLazyTypeRef(state.context, null, p.type ?? p, type),
        visibility: mapVisibility(state.context, p, cs.Visibility.Public),
        tsNode: p,
        tsSymbol: symbol,
        skipEmit: false
    };
    csProperty.type.parent = csProperty;

    if (p.questionToken) {
        csProperty.type.isNullable = true;
    }

    if (p.name) {
        csProperty.documentation = visitDocumentation(state, p.name);
    }

    csProperty.getAccessor = csf.propertyAccessor(csProperty, 'get');
    if (!isReadonly) {
        csProperty.setAccessor = csf.propertyAccessor(csProperty, 'set');
    }

    // Insert the property immediately before the constructor (which is the
    // most recently pushed member at this point — _ pushed by visitConstructorDeclaration
    // only AFTER all parameter processing). The constructor isn't pushed yet,
    // so a plain push() lands the property in source-order before the ctor.
    parent.members.push(csProperty);
    state.context.symbols.register(csProperty);

    collector.push({ propName, paramName, tsParam: p });
}

function _buildParameterPropertyAssignment(
    parent: cs.Block,
    propName: string,
    paramName: string,
    tsParam: ts.ParameterDeclaration
): cs.ExpressionStatement {
    const stmt: cs.ExpressionStatement = {
        nodeType: cs.SyntaxKind.ExpressionStatement,
        parent: parent,
        tsNode: tsParam,
        expression: null!
    };
    const assignment: cs.BinaryExpression = {
        nodeType: cs.SyntaxKind.BinaryExpression,
        parent: stmt,
        tsNode: tsParam,
        left: null!,
        right: null!,
        operator: '='
    };
    const lhs = csf.memberAccess(
        assignment,
        csf.thisLiteral(assignment, tsParam),
        propName,
        tsParam
    );
    assignment.left = lhs;
    assignment.right = csf.identifier(assignment, paramName, tsParam);
    stmt.expression = assignment;
    return stmt;
}

export function visitMethodParameter(
    state: AstTransformer,
    parent: cs.MethodDeclarationBase,
    p: ts.ParameterDeclaration
): void {
    parent.parameters.push(makeParameter(state, parent, p));
}

export function makeParameter(
    state: AstTransformer,
    csMethod: cs.Node,
    p: ts.ParameterDeclaration
): cs.ParameterDeclaration {
    const symbol = state.context.typeChecker.getSymbolAtLocation(p.name);
    const type = state.context.typeChecker.getTypeOfSymbolAtLocation(symbol!, p);

    const csParameter: cs.ParameterDeclaration = {
        nodeType: cs.SyntaxKind.ParameterDeclaration,
        name: (p.name as ts.Identifier).text,
        parent: csMethod,
        type: createLazyTypeRef(state.context, null, p.type ?? p, type),
        tsNode: p,
        params: !!p.dotDotDotToken,
        isOptional: !!p.questionToken
    };
    csParameter.type!.parent = csParameter;

    if (p.questionToken) {
        (csParameter.type! as cs.LazyTypeRef).isNullable = true;
    }

    if (p.initializer) {
        csParameter.initializer = state.visitExpression(csParameter, p.initializer) ?? undefined;
        if (csParameter.initializer && cs.isNullLiteral(csParameter.initializer)) {
            csParameter.type!.isNullable = true;
        }
    }

    if (p.name) {
        csParameter.documentation = visitDocumentation(state, p.name);
    }
    return csParameter;
}

export function visitPropertySignature(
    state: AstTransformer,
    parent: cs.ClassDeclaration | cs.InterfaceDeclaration,
    classElement: ts.PropertySignature
) {
    const overridden = state.context.getOverriddenMembers(
        classElement.parent as ts.ClassDeclaration | ts.InterfaceDeclaration,
        classElement,
        false,
        true
    );
    if (overridden.length > 0) {
        // ignore properties repeated in derived interfaces
        return;
    }

    const type = state.context.typeChecker.getTypeAtLocation(classElement);
    const csProperty: cs.PropertyDeclaration = {
        parent: parent,
        nodeType: cs.SyntaxKind.PropertyDeclaration,
        isAbstract: false,
        isOverride: false,
        isStatic: false,
        isVirtual: false,
        name: state.context.toPropertyNameCase((classElement.name as ts.Identifier).text),
        type: createLazyTypeRef(state.context, null, classElement.type ?? classElement, type),
        visibility: cs.Visibility.None,
        tsNode: classElement,
        skipEmit: shouldSkip(classElement, false, state.context.targetTag)
    };

    if (classElement.name) {
        csProperty.documentation = visitDocumentation(state, classElement.name);
    }

    visitDocumentationAttributes(state.context, state.attributeNames, csProperty, classElement);

    let isReadonly = false;
    if (classElement.modifiers) {
        for (const m of classElement.modifiers) {
            switch (m.kind) {
                case ts.SyntaxKind.ReadonlyKeyword:
                    isReadonly = true;
                    break;
            }
        }
    }

    csProperty.type.parent = csProperty;
    csProperty.getAccessor = csf.propertyAccessor(csProperty, 'get');
    if (!isReadonly) {
        csProperty.setAccessor = csf.propertyAccessor(csProperty, 'set');
    }

    parent.members.push(csProperty);
    state.context.symbols.register(csProperty);
}

export function visitInterfaceElement(
    state: AstTransformer,
    parent: cs.InterfaceDeclaration,
    classElement: ts.TypeElement
) {
    if (ts.isMethodSignature(classElement) || ts.isPropertySignature(classElement)) {
        // Go through the registry so language-specific wraps (e.g. the
        // Kotlin @async → isAsync handler) fire on interface members.
        state.visit(parent as unknown as cs.Node, classElement);
    } else {
        state.context.addTsNodeDiagnostics(
            classElement,
            `Unsupported interface element: ${ts.SyntaxKind[classElement.kind]}`,
            ts.DiagnosticCategory.Error
        );
    }
}

export function applyMethodOverride(
    state: AstTransformer,
    csMethod: cs.MethodDeclaration,
    classElement: ts.MethodDeclaration
) {
    const overrides = state.context.markOverride(classElement);
    if (overrides.length > 0) {
        csMethod.isOverride = true;
        for (const o of overrides) {
            let type: ts.Type | undefined = undefined;
            let typeNode: ts.TypeNode | undefined = undefined;
            if (ts.isMethodDeclaration(classElement)) {
                const signature = state.context.typeChecker.getSignatureFromDeclaration(classElement);
                type = signature ? state.context.typeChecker.getReturnTypeOfSignature(signature) : undefined;
            }

            if (!type) {
                return;
            }

            if (ts.isMethodDeclaration(o)) {
                typeNode = o.type;
            } else if (ts.isMethodSignature(o)) {
                typeNode = o.type;
            }

            // Previous `returnType` was a LazyTypeRef allocated upstream; replacing the
            // slot drops the reference, and LazyTypeRef has no global buffer to deregister.
            csMethod.returnType = createLazyTypeRef(state.context, csMethod, typeNode ?? o, type);

            // NOTE: we could also ensure the correct parameter list here
            return;
        }
    }
}

export function applyPropertyOverride(
    state: AstTransformer,
    csProperty: cs.PropertyDeclaration,
    classElement: ts.PropertyDeclaration | ts.GetAccessorDeclaration | ts.SetAccessorDeclaration | ts.PropertySignature
) {
    const overrides = state.context.markOverride(classElement);
    if (overrides.length > 0) {
        csProperty.isOverride = true;
        for (const o of overrides) {
            let type: ts.Type | undefined = undefined;
            let typeNode: ts.TypeNode | undefined = undefined;

            if (ts.isGetAccessorDeclaration(o)) {
                const signature = state.context.typeChecker.getSignatureFromDeclaration(o);
                type = signature ? state.context.typeChecker.getReturnTypeOfSignature(signature) : undefined;
                typeNode = o.type;
            } else if (ts.isSetAccessorDeclaration(o)) {
                const signature = state.context.typeChecker.getSignatureFromDeclaration(o);
                type = signature ? state.context.typeChecker.getTypeOfSymbol(signature.parameters[0]) : undefined;
                typeNode = o.parameters[0].type;
            } else if (ts.isPropertyDeclaration(o)) {
                type = state.context.typeChecker.getTypeAtLocation(o);
                typeNode = o.type;
            } else if (ts.isPropertySignature(o)) {
                type = state.context.typeChecker.getTypeAtLocation(o);
                typeNode = o.type;
            }

            if (!type) {
                return;
            }

            // Same rebind dance as applyMethodOverride: drop the previous LazyTypeRef
            // by assignment; no buffer to deregister.
            csProperty.type = createLazyTypeRef(state.context, csProperty, typeNode ?? o, type);
            return;
        }
    }
}

export function visitTopLevelFunctionDeclaration(
    state: AstTransformer,
    parent: cs.ClassDeclaration,
    node: ts.FunctionDeclaration
): cs.MethodDeclaration | null {
    // Skip overload signatures; only emit the implementation.
    if (!node.body) {
        return null;
    }
    if (shouldSkip(node, false, state.context.targetTag)) {
        return null;
    }

    const signature = state.context.typeChecker.getSignatureFromDeclaration(node);
    const returnType: ts.Type | undefined = signature
        ? state.context.typeChecker.getReturnTypeOfSignature(signature)
        : undefined;

    const csMethod: cs.MethodDeclaration = {
        parent: parent,
        nodeType: cs.SyntaxKind.MethodDeclaration,
        isAbstract: false,
        isOverride: false,
        isStatic: true,
        isVirtual: false,
        isTestMethod: false,
        isGeneratorFunction: !!node.asteriskToken,
        partial: hasTag(node, JsDocTag.partial),
        name: state.context.toMethodNameCase((node.name as ts.Identifier).text),
        parameters: [],
        returnType: createLazyTypeRef(state.context, null, node.type ?? node, returnType),
        visibility: getVisibility(state.context, node),
        tsNode: node,
        tsSymbol: state.context.symbols.getSymbolForDeclaration(node),
        skipEmit: false
    };

    if (node.name) {
        csMethod.documentation = visitDocumentation(state, node.name);
    }

    visitDocumentationAttributes(state.context, state.attributeNames, csMethod, node);

    if (node.modifiers) {
        for (const m of node.modifiers) {
            if (m.kind === ts.SyntaxKind.AsyncKeyword) {
                csMethod.isAsync = true;
            }
        }
    }

    csMethod.returnType.parent = csMethod;

    if (node.typeParameters && node.typeParameters.length > 0) {
        csMethod.typeParameters = [];
        for (const p of node.typeParameters) {
            const csp = visitTypeParameterDeclaration(state, csMethod, p);
            csMethod.typeParameters.push(csp);
        }
    }

    for (const p of node.parameters) {
        visitMethodParameter(state, csMethod, p);
    }

    csMethod.body = state.visitBlock(csMethod, node.body);

    parent.members.push(csMethod);
    state.context.symbols.register(csMethod);

    return csMethod;
}

export function visitTopLevelVariableStatement(
    state: AstTransformer,
    parent: cs.ClassDeclaration,
    node: ts.VariableStatement
): void {
    if (shouldSkip(node, false, state.context.targetTag)) {
        return;
    }
    const isConst = (node.declarationList.flags & ts.NodeFlags.Const) !== 0;
    const visibility = getVisibility(state.context, node);

    for (const decl of node.declarationList.declarations) {
        if (!ts.isIdentifier(decl.name)) {
            state.context.addTsNodeDiagnostics(
                decl,
                'Destructuring patterns are not supported in top-level declarations',
                ts.DiagnosticCategory.Error
            );
            continue;
        }
        const symbol = state.context.typeChecker.getSymbolAtLocation(decl.name);
        const type = symbol
            ? state.context.typeChecker.getTypeOfSymbolAtLocation(symbol, decl)
            : state.context.typeChecker.getTypeAtLocation(decl);

        const csField: cs.FieldDeclaration = {
            parent: parent,
            nodeType: cs.SyntaxKind.FieldDeclaration,
            name: state.context.toPropertyNameCase(decl.name.text),
            isStatic: true,
            isReadonly: isConst,
            type: createLazyTypeRef(state.context, null, decl.type ?? decl, type),
            visibility: visibility,
            tsNode: decl
        };
        csField.type.parent = csField;

        if (decl.name) {
            csField.documentation = visitDocumentation(state, decl.name);
        }

        if (decl.initializer) {
            csField.initializer = state.visitExpression(csField, decl.initializer) ?? undefined;
        }

        parent.members.push(csField);
        state.context.symbols.register(csField);
    }
}
