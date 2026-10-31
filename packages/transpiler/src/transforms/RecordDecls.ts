import ts from 'typescript';
import type AstTransformer from '../AstTransformer';
import * as cs from '../ir/Ir';
import * as csf from '../ir/IrFactory';
import { findTag, hasTag, JsDocTag } from '../jsDocTags';
import { createLazyTypeRef, getVisibility, shouldSkip, visitDocumentationAttributes } from '../TransformerHelpers';
import { AlphaTabCore } from '../typeRegistry';
import { visitDocumentation, visitTypeParameterDeclaration } from './Declarations';
import { applyPropertyOverride } from './Members';

export function visitRecordDeclaration(state: AstTransformer, node: ts.InterfaceDeclaration | ts.TypeAliasDeclaration) {
    let members: ts.TypeElement[] = [];

    let baseClass: ts.ExpressionWithTypeArguments | undefined;
    const interfaces: ts.ExpressionWithTypeArguments[] = [];

    if (ts.isInterfaceDeclaration(node)) {
        const named = new Map<string, ts.TypeElement>();
        _collectMembers(state, named, node);
        members = Array.from(named.values());

        if (node.heritageClauses) {
            for (const c of node.heritageClauses) {
                if (c.token === ts.SyntaxKind.ExtendsKeyword) {
                    for (const t of c.types) {
                        const type = state.context.typeChecker.getTypeAtLocation(t);
                        if (
                            type.symbol.declarations &&
                            type.symbol.declarations.length > 0 &&
                            state.context.isRecord(type.symbol.declarations[0])
                        ) {
                            baseClass = t;
                        } else {
                            interfaces.push(t);
                        }
                    }
                }
                if (c.token === ts.SyntaxKind.ImplementsKeyword) {
                    interfaces.push(...c.types);
                }
            }
        }
    } else {
        members = Array.from((node.type as ts.TypeLiteralNode).members);
    }

    const csClass: cs.ClassDeclaration = csf.classDeclaration(
        state.csharpFile.namespace,
        {
            visibility: getVisibility(state.context, node),
            name: node.name.text,
            isAbstract: false,
            members: [],
            skipEmit: shouldSkip(node, false, state.context.targetTag),
            partial: hasTag(node, JsDocTag.partial),
            tsSymbol: state.context.symbols.getSymbolForDeclaration(node),
            hasVirtualMembersOrSubClasses: false,
            isRecord: true
        },
        node
    );

    if (node.name) {
        csClass.documentation = visitDocumentation(state, node.name);
    }

    visitDocumentationAttributes(state.context, state.attributeNames, csClass, node);

    if (node.typeParameters) {
        csClass.typeParameters = node.typeParameters.map(p => visitTypeParameterDeclaration(state, csClass, p));
    }

    if (baseClass) {
        const baseClassNode = createLazyTypeRef(state.context, csClass, baseClass);
        if (baseClass.typeArguments) {
            baseClassNode.typeArguments = baseClass.typeArguments.map(a =>
                createLazyTypeRef(state.context, csClass, a)
            );
        } else {
            baseClassNode.typeArguments = [];
        }
        csClass.baseClass = baseClassNode;
    }

    if (interfaces.length > 0) {
        csClass.interfaces = interfaces.map(n => {
            const inter = createLazyTypeRef(state.context, csClass, n);
            if (n.typeArguments) {
                inter.typeArguments = n.typeArguments.map(a => createLazyTypeRef(state.context, csClass, a));
            } else {
                inter.typeArguments = undefined;
            }

            return inter;
        });
    }

    csClass.interfaces ??= [];
    csClass.interfaces.push(csf.typeReference(csClass, state.context.makeTypeName(AlphaTabCore.recordInterface)));

    if (!csClass.skipEmit) {
        const allRecordMembers: ts.PropertySignature[] = [];
        const ownRecordMembers: ts.PropertySignature[] = [];
        const parentRecordMembers: ts.PropertySignature[] = [];
        const interfaceSymbols = new Set(interfaces.map(i => state.context.typeChecker.getTypeAtLocation(i).symbol));
        for (const m of members) {
            if (ts.isPropertySignature(m)) {
                const type = state.context.typeChecker.getTypeAtLocation(m);
                const containedSymbol = state.context.typeChecker.getSymbolAtLocation(
                    (m.parent as any).name ?? m.parent
                )!;
                allRecordMembers.push(m);
                if (m.parent === node || (!state.context.isRecord(m.parent) && interfaceSymbols.has(containedSymbol))) {
                    const csProperty: cs.PropertyDeclaration = {
                        parent: csClass,
                        nodeType: cs.SyntaxKind.PropertyDeclaration,
                        isAbstract: false,
                        isOverride: false,
                        isStatic: false,
                        isVirtual: false,
                        name: state.context.toPropertyNameCase(m.name.getText()),
                        type: createLazyTypeRef(state.context, null, m.type ?? m, type),
                        visibility: cs.Visibility.Public,
                        tsNode: m,
                        tsSymbol: state.context.symbols.getSymbolForDeclaration(m),
                        skipEmit: shouldSkip(m, false, state.context.targetTag)
                    };

                    if (m.name) {
                        csProperty.documentation = visitDocumentation(state, m.name);
                    }

                    visitDocumentationAttributes(state.context, state.attributeNames, csProperty, m);

                    if (ts.isInterfaceDeclaration(node)) {
                        applyPropertyOverride(state, csProperty, m);
                    }

                    csProperty.type.parent = csProperty;
                    csProperty.getAccessor = csf.propertyAccessor(csProperty, 'get');
                    csProperty.setAccessor = csf.propertyAccessor(csProperty, 'set');

                    csClass.members.push(csProperty);

                    state.context.symbols.register(csProperty);
                    ownRecordMembers.push(m);
                } else {
                    parentRecordMembers.push(m);
                }
            } else {
                state.context.addTsNodeDiagnostics(
                    m,
                    `Record interfaces can only declare property signatures, found ${ts.SyntaxKind[m.kind]}`,
                    ts.DiagnosticCategory.Error
                );
            }
        }

        const csConstructor: cs.ConstructorDeclaration = {
            parent: csClass,
            nodeType: cs.SyntaxKind.ConstructorDeclaration,
            name: '.ctor',
            parameters: [],
            isStatic: false,
            visibility: cs.Visibility.Public,
            tsNode: node,
            skipEmit: shouldSkip(node, false, state.context.targetTag)
        };

        for (const p of allRecordMembers) {
            const type = state.context.typeChecker.getTypeAtLocation(p);
            const csParameter: cs.ParameterDeclaration = {
                nodeType: cs.SyntaxKind.ParameterDeclaration,
                name: (p.name as ts.Identifier).text,
                parent: csConstructor,
                type: createLazyTypeRef(state.context, null, p.type ?? p, type),
                tsNode: p,
                params: false,
                isOptional: false
            };
            if (p.questionToken !== undefined) {
                csParameter.isOptional = true;
                csParameter.initializer = {
                    parent: csParameter,
                    nodeType: cs.SyntaxKind.DefaultExpression
                } as cs.DefaultExpression;
            }

            csParameter.type!.parent = csParameter;
            csConstructor.parameters.push(csParameter);
        }

        if (parentRecordMembers.length > 0) {
            csConstructor.baseConstructorArguments = parentRecordMembers.map(p =>
                csf.labeledExpression(
                    csConstructor,
                    (p.name as ts.Identifier).text,
                    csf.identifier(csConstructor, (p.name as ts.Identifier).text)
                )
            );
        }

        csConstructor.parameters.sort((a, b) => {
            const av = a.isOptional ? 1 : 0;
            const bv = b.isOptional ? 1 : 0;
            return av - bv;
        });

        const ctorBody = csf.block(csConstructor, []);
        csConstructor.body = ctorBody;

        for (const p of ownRecordMembers) {
            const stmt = csf.expressionStatement(ctorBody, null!);
            const binary = csf.binaryExpression(stmt, null!, '=', null!);
            stmt.expression = binary;

            const memberAccess = csf.memberAccess(binary, null!, state.context.toPropertyNameCase(p.name.getText()));
            memberAccess.expression = csf.thisLiteral(memberAccess);
            binary.left = memberAccess;

            binary.right = csf.identifier(binary, (p.name as ts.Identifier).text);

            ctorBody.statements.push(stmt);
        }

        csClass.members.push(csConstructor);
    }

    state.csharpFile.namespace.declarations.push(csClass);
    state.context.symbols.register(csClass);
}

export function visitDiscriminatedUnion(state: AstTransformer, node: ts.TypeAliasDeclaration) {
    const tag = findTag(node, JsDocTag.discriminated)!;
    const values = (tag.comment as string).split(' ');
    const discriminatorField = values[0];
    const discriminatorValuePrefix = values[1];

    const unionType = state.context.typeChecker.getTypeAtLocation(node.type);
    if (!unionType.isUnion()) {
        state.context.addTsNodeDiagnostics(
            node,
            `Discriminated union must be a union type`,
            ts.DiagnosticCategory.Error
        );
        return;
    }

    // Create base interface
    const baseInterface = createDiscriminatedUnionBaseInterface(state, node, discriminatorField);
    state.csharpFile.namespace.declarations.push(baseInterface);
    state.context.symbols.register(baseInterface);

    const typeNamePrefix = baseInterface.name.startsWith('I') ? baseInterface.name.substring(1) : baseInterface.name;

    // Create classes for each union member
    for (const memberType of unionType.types) {
        const properties = state.context.typeChecker.getPropertiesOfType(memberType);
        const discriminatorProp = properties.find(p => p.name === discriminatorField);
        if (!discriminatorProp) {
            continue;
        }

        const discriminatorType = state.context.typeChecker.getTypeOfSymbolAtLocation(discriminatorProp, node);
        if (!discriminatorType.isStringLiteral()) {
            continue;
        }

        const discriminatorValue = discriminatorType.value;

        // Compute class name
        const suffix = discriminatorValue.startsWith(discriminatorValuePrefix)
            ? discriminatorValue.substring(discriminatorValuePrefix.length)
            : discriminatorValue;
        const className =
            typeNamePrefix +
            suffix
                .split('.')
                .map(p => state.context.toTypeNameCase(p))
                .join('');

        const csClass = createDiscriminatedUnionClass(
            state,
            node,
            className,
            memberType,
            baseInterface,
            discriminatorField,
            discriminatorValue
        );
        state.csharpFile.namespace.declarations.push(csClass);
        state.context.symbols.register(csClass);
    }
}

export function createDiscriminatedUnionClass(
    state: AstTransformer,
    node: ts.TypeAliasDeclaration,
    className: string,
    memberType: ts.Type,
    baseInterface: cs.InterfaceDeclaration,
    discriminatorField: string,
    discriminatorValue: string
) {
    // Create class
    const csClass: cs.ClassDeclaration = csf.classDeclaration(
        state.csharpFile.namespace,
        {
            visibility: getVisibility(state.context, node),
            name: className,
            isAbstract: false,
            members: [],
            skipEmit: shouldSkip(node, false, state.context.targetTag),
            partial: false,
            tsSymbol: memberType.symbol,
            hasVirtualMembersOrSubClasses: false,
            isRecord: true
        },
        memberType.symbol.declarations![0]
    );

    // Add interface implementation
    csClass.interfaces = [csf.typeReference(csClass, state.context.makeTypeName(baseInterface.name))];

    // Add discriminator property
    const discProp: cs.PropertyDeclaration = {
        visibility: cs.Visibility.Public,
        name: state.context.toPropertyNameCase(discriminatorField),
        nodeType: cs.SyntaxKind.PropertyDeclaration,
        parent: csClass,
        isVirtual: false,
        isOverride: false,
        isAbstract: false,
        isStatic: false,
        type: createLazyTypeRef(state.context, null, node.type, state.context.typeChecker.getStringType()),
        initializer: csf.stringLiteral(null!, discriminatorValue),
        getAccessor: {
            keyword: 'get'
        } as cs.PropertyAccessorDeclaration,
        setAccessor: {
            keyword: 'set'
        } as cs.PropertyAccessorDeclaration,
        tsNode: node,
        skipEmit: false
    };
    discProp.initializer!.parent = discProp;

    csClass.members.push(discProp);

    // Add other properties
    const properties = state.context.typeChecker.getPropertiesOfType(memberType);
    const otherProperties = properties.filter(p => p.name !== discriminatorField);
    for (const prop of otherProperties) {
        const propType = state.context.typeChecker.getTypeOfSymbolAtLocation(prop, node);

        // Create property
        const csProperty: cs.PropertyDeclaration = {
            visibility: cs.Visibility.Public,
            name: state.context.toPropertyNameCase(prop.name),
            nodeType: cs.SyntaxKind.PropertyDeclaration,
            parent: csClass,
            isVirtual: false,
            isOverride: false,
            isAbstract: false,
            isStatic: false,
            type: createLazyTypeRef(state.context, null, node.type, propType),
            tsNode: prop.valueDeclaration ?? prop.declarations![0],
            getAccessor: {
                keyword: 'get'
            } as cs.PropertyAccessorDeclaration,
            setAccessor: {
                keyword: 'set'
            } as cs.PropertyAccessorDeclaration,
            skipEmit: false
        };

        csClass.members.push(csProperty);
    }
    return csClass;
}

export function createDiscriminatedUnionBaseInterface(
    state: AstTransformer,
    node: ts.TypeAliasDeclaration,
    discriminatorField: string
) {
    const baseInterface: cs.InterfaceDeclaration = {
        visibility: getVisibility(state.context, node),
        name: node.name.text,
        nodeType: cs.SyntaxKind.InterfaceDeclaration,
        parent: state.csharpFile.namespace,
        members: [],
        tsNode: node,
        skipEmit: shouldSkip(node, false, state.context.targetTag),
        partial: false,
        tsSymbol: state.context.symbols.getSymbolForDeclaration(node),
        hasVirtualMembersOrSubClasses: false
    };

    if (node.name) {
        baseInterface.documentation = visitDocumentation(state, node.name);
    }

    visitDocumentationAttributes(state.context, state.attributeNames, baseInterface, node);

    // Add discriminator property to interface
    const discriminatorProperty: cs.PropertyDeclaration = {
        visibility: cs.Visibility.Public,
        name: state.context.toPropertyNameCase(discriminatorField),
        nodeType: cs.SyntaxKind.PropertyDeclaration,
        parent: baseInterface,
        isVirtual: false,
        isOverride: false,
        isAbstract: false,
        isStatic: false,
        type: createLazyTypeRef(state.context, null, node.type, state.context.typeChecker.getStringType()),
        tsNode: node,
        getAccessor: {
            keyword: 'get'
        } as cs.PropertyAccessorDeclaration,
        setAccessor: {
            keyword: 'set'
        } as cs.PropertyAccessorDeclaration,
        skipEmit: false
    };

    baseInterface.members.push(discriminatorProperty);
    return baseInterface;
}

export function _collectMembers(
    state: AstTransformer,
    members: Map<string, ts.TypeElement>,
    type: ts.InterfaceDeclaration
) {
    const extendsClause = type.heritageClauses?.find(c => c.token === ts.SyntaxKind.ExtendsKeyword);
    if (extendsClause) {
        for (const t of extendsClause.types) {
            const parentInterface = state.context.getType(t).symbol.declarations![0];
            if (ts.isInterfaceDeclaration(parentInterface)) {
                _collectMembers(state, members, parentInterface);
            }
        }
    }

    for (const m of type.members) {
        if (!members.has(m.name!.getText())) {
            members.set(m.name!.getText(), m);
        }
    }
}
