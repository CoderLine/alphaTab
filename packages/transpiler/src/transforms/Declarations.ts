import ts from 'typescript';
import type AstTransformer from '../AstTransformer';
import * as cs from '../ir/Ir';
import * as csf from '../ir/IrFactory';
import { hasTag, JsDocTag } from '../jsDocTags';
import { createLazyTypeRef, getVisibility, shouldSkip, visitDocumentationAttributes } from '../TransformerHelpers';
import { visitInterfaceElement, visitMethodParameter } from './Members';
import { visitDiscriminatedUnion, visitRecordDeclaration } from './RecordDecls';

export function visitEnumDeclaration(state: AstTransformer, node: ts.EnumDeclaration) {
    const csEnum: cs.EnumDeclaration = {
        visibility: getVisibility(state.context, node),
        name: node.name.text,
        nodeType: cs.SyntaxKind.EnumDeclaration,
        parent: state.csharpFile.namespace,
        members: [],
        tsNode: node,
        partial: false,
        skipEmit: shouldSkip(node, false, state.context.targetTag),
        tsSymbol: state.context.symbols.getSymbolForDeclaration(node),
        hasVirtualMembersOrSubClasses: false
    };

    if (node.name) {
        csEnum.documentation = visitDocumentation(state, node.name);
    }

    visitDocumentationAttributes(state.context, state.attributeNames, csEnum, node);

    for (const m of node.members) {
        visitEnumMember(state, csEnum, m);
    }

    state.csharpFile.namespace.declarations.push(csEnum);
    state.context.symbols.register(csEnum);
}

export function visitEnumMember(state: AstTransformer, parent: cs.EnumDeclaration, enumMember: ts.EnumMember) {
    const csEnumMember: cs.EnumMember = {
        parent: parent,
        tsNode: enumMember,
        nodeType: cs.SyntaxKind.EnumMember,
        name: enumMember.name.getText(),
        skipEmit: shouldSkip(enumMember, false, state.context.targetTag)
    };

    if (enumMember.initializer) {
        csEnumMember.initializer = state.visitExpression(csEnumMember, enumMember.initializer) ?? undefined;
    }

    if (enumMember.name) {
        csEnumMember.documentation = visitDocumentation(state, enumMember.name);
    }

    visitDocumentationAttributes(state.context, state.attributeNames, csEnumMember, enumMember);

    parent.members.push(csEnumMember);
    state.context.symbols.register(csEnumMember);
}

export function visitTypeAliasDeclaration(state: AstTransformer, node: ts.TypeAliasDeclaration) {
    const _skip = shouldSkip(node, false, state.context.targetTag);
    const isExported = node.modifiers && !!node.modifiers.find(m => m.kind === ts.SyntaxKind.ExportKeyword);
    if (ts.isFunctionTypeNode(node.type)) {
        visitFunctionTypeAliasDeclaration(state, node);
    } else if (ts.isTypeLiteralNode(node.type)) {
        visitTypeLiteralAliasDeclaration(state, node);
    } else if (state.context.isDiscriminatedUnion(node)) {
        visitDiscriminatedUnion(state, node);
    } else if (isExported && !_skip) {
        state.context.addTsNodeDiagnostics(
            node,
            `Unsupported type alias declaration, found ${ts.SyntaxKind[node.type.kind]}`,
            ts.DiagnosticCategory.Error
        );
    } else {
        // non exported type aliases can be replaced by local
        // using statements

        // the type definition has an alias symbol set, we need to handle it sepcial
        // to avoid this type referring to this alias definition itself.

        const using: cs.UsingDeclaration = {
            nodeType: cs.SyntaxKind.UsingDeclaration,
            name: node.name.text,
            parent: state.csharpFile,
            tsNode: node,
            skipEmit: shouldSkip(node, false, state.context.targetTag),
            alias: createLazyTypeRef(
                state.context,
                null,
                node.type,
                state.context.typeChecker.getTypeAtLocation(node.type)
            )
        };
        (using.alias as cs.LazyTypeRef).skipAliasSymbolOnResolve = true;
        state.csharpFile.usings.push(using);
        state.context.symbols.register(using);
    }
}

export function visitFunctionTypeAliasDeclaration(state: AstTransformer, node: ts.TypeAliasDeclaration) {
    const type = node.type as ts.FunctionTypeNode;
    const signature = state.context.typeChecker.getSignatureFromDeclaration(type);
    const returnType = state.context.typeChecker.getReturnTypeOfSignature(signature!);

    const typeDeclaration: cs.DelegateDeclaration = {
        visibility: getVisibility(state.context, node),
        name: node.name.text,
        nodeType: cs.SyntaxKind.DelegateDeclaration,
        parent: state.csharpFile.namespace,
        parameters: [],
        tsNode: node,
        skipEmit: shouldSkip(node, false, state.context.targetTag),
        partial: false,
        tsSymbol: state.context.symbols.getSymbolForDeclaration(node),
        hasVirtualMembersOrSubClasses: false,
        isStatic: false,
        returnType: createLazyTypeRef(state.context, null, type.type, returnType)
    };

    if (node.name) {
        typeDeclaration.documentation = visitDocumentation(state, node.name);
    }

    visitDocumentationAttributes(state.context, state.attributeNames, typeDeclaration, node);

    if (node.typeParameters) {
        typeDeclaration.typeParameters = node.typeParameters.map(p =>
            visitTypeParameterDeclaration(state, typeDeclaration, p)
        );
    }

    if (!typeDeclaration.skipEmit) {
        for (const m of type.parameters) {
            visitMethodParameter(state, typeDeclaration, m);
        }
    }

    state.csharpFile.namespace.declarations.push(typeDeclaration);
    state.context.symbols.register(typeDeclaration);
}

export function visitTypeLiteralAliasDeclaration(state: AstTransformer, node: ts.TypeAliasDeclaration) {
    visitRecordDeclaration(state, node);
}

export { visitDiscriminatedUnion } from './RecordDecls';

export function visitInterfaceDeclaration(state: AstTransformer, node: ts.InterfaceDeclaration) {
    if (state.context.isRecord(node)) {
        visitRecordDeclaration(state, node);
        return;
    }

    let extendsClauses: ts.ExpressionWithTypeArguments[] = [];

    if (node.heritageClauses) {
        for (const c of node.heritageClauses) {
            if (c.token === ts.SyntaxKind.ExtendsKeyword) {
                extendsClauses = c.types.slice();
            }
        }
    }

    const csInterface: cs.InterfaceDeclaration = {
        visibility: getVisibility(state.context, node),
        name: node.name.text,
        nodeType: cs.SyntaxKind.InterfaceDeclaration,
        parent: state.csharpFile.namespace,
        members: [],
        tsNode: node,
        skipEmit: shouldSkip(node, false, state.context.targetTag),
        partial: hasTag(node, JsDocTag.partial),
        tsSymbol: state.context.symbols.getSymbolForDeclaration(node),
        hasVirtualMembersOrSubClasses: false
    };

    if (node.name) {
        csInterface.documentation = visitDocumentation(state, node.name);
    }

    visitDocumentationAttributes(state.context, state.attributeNames, csInterface, node);

    if (node.typeParameters) {
        csInterface.typeParameters = node.typeParameters.map(p => visitTypeParameterDeclaration(state, csInterface, p));
    }

    if (extendsClauses && extendsClauses.length > 0) {
        csInterface.interfaces = extendsClauses.map(n => {
            const inter = createLazyTypeRef(state.context, csInterface, n);
            if (n.typeArguments) {
                inter.typeArguments = n.typeArguments.map(a => createLazyTypeRef(state.context, csInterface, a));
            } else {
                inter.typeArguments = undefined;
            }

            return inter;
        });
    }

    if (!csInterface.skipEmit) {
        for (const m of node.members) {
            visitInterfaceElement(state, csInterface, m);
        }
    }

    state.csharpFile.namespace.declarations.push(csInterface);
    state.context.symbols.register(csInterface);
}

export { visitRecordDeclaration } from './RecordDecls';

export function visitTypeParameterDeclaration(
    state: AstTransformer,
    parent: cs.Node,
    p: ts.TypeParameterDeclaration
): cs.TypeParameterDeclaration {
    const csTypeParameter: cs.TypeParameterDeclaration = {
        nodeType: cs.SyntaxKind.TypeParameterDeclaration,
        name: p.name.text,
        parent: parent,
        tsNode: p
    };

    if (p.constraint) {
        const constraintType = ts.isUnionTypeNode(p.constraint) ? p.constraint.types[0] : p.constraint;
        csTypeParameter.constraint = createLazyTypeRef(state.context, csTypeParameter, constraintType);
    }

    state.context.symbols.register(csTypeParameter);

    state.typeParameterProcessor?.(csTypeParameter, p);

    return csTypeParameter;
}

export { visitTestClass, visitTestClassMethod, visitTestClassProperty, visitTestMethod } from './Tests';

export function visitClassDeclaration(
    state: AstTransformer,
    node: ts.ClassDeclaration,
    _additionalNestedExportDeclarations?: ts.Declaration[],
    _additionalNestedNonExportsDeclarations?: ts.Declaration[],
    globalStatements?: ts.Statement[]
) {
    let extendsClause: ts.ExpressionWithTypeArguments | null = null;
    let implementsClauses: ts.ExpressionWithTypeArguments[] = [];

    if (node.heritageClauses) {
        for (const c of node.heritageClauses) {
            if (c.token === ts.SyntaxKind.ExtendsKeyword) {
                extendsClause = c.types[0];
            }
            if (c.token === ts.SyntaxKind.ImplementsKeyword) {
                implementsClauses = c.types.slice();
            }
        }
    }

    const csClass: cs.ClassDeclaration = csf.classDeclaration(
        state.csharpFile.namespace,
        {
            visibility: getVisibility(state.context, node),
            name: node.name!.text,
            isAbstract: !!node.modifiers && !!node.modifiers.find(m => m.kind === ts.SyntaxKind.AbstractKeyword),
            partial: hasTag(node, JsDocTag.partial),
            members: [],
            skipEmit: shouldSkip(node, false, state.context.targetTag),
            tsSymbol: state.context.symbols.getSymbolForDeclaration(node),
            hasVirtualMembersOrSubClasses: false
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

    if (extendsClause) {
        const ex = extendsClause as ts.ExpressionWithTypeArguments;
        const baseClass = createLazyTypeRef(state.context, csClass, ex);
        if (ex.typeArguments) {
            baseClass.typeArguments = ex.typeArguments.map(a => createLazyTypeRef(state.context, csClass, a));
        } else {
            baseClass.typeArguments = [];
        }
        csClass.baseClass = baseClass;
    }

    if (implementsClauses && implementsClauses.length > 0) {
        csClass.interfaces = implementsClauses.map(n => {
            const inter = createLazyTypeRef(state.context, csClass, n);
            if (n.typeArguments) {
                inter.typeArguments = n.typeArguments.map(a => createLazyTypeRef(state.context, csClass, a));
            } else {
                inter.typeArguments = undefined;
            }

            return inter;
        });
    }

    if (!csClass.skipEmit) {
        for (const m of node.members) {
            state.visitClassElement(csClass, m);
        }

        if (globalStatements && globalStatements.length > 0) {
            const staticConstructor = csf.constructorDeclaration(
                csClass,
                {
                    isStatic: true,
                    name: 'cctor',
                    parameters: [],
                    visibility: cs.Visibility.None,
                    body: csf.block(null!, [])
                },
                node
            );

            for (const s of globalStatements) {
                const st = state.visitStatement(staticConstructor.body!, s)!;
                if (st) {
                    (staticConstructor.body as cs.Block).statements.push(st);
                }
            }

            csClass.members.push(staticConstructor);
        }
    }

    state.csharpFile.namespace.declarations.push(csClass);
    state.context.symbols.register(csClass);
}

export function visitDocumentation(state: AstTransformer, node: ts.Node): string | undefined {
    const symbol = state.context.typeChecker.getSymbolAtLocation(node);
    if (!symbol) {
        return undefined;
    }

    const docs = symbol.getDocumentationComment(state.context.typeChecker);
    if (!docs || docs.length === 0) {
        return undefined;
    }

    let s = '';

    for (const d of docs) {
        switch ((ts.SymbolDisplayPartKind as any)[d.kind]) {
            case ts.SymbolDisplayPartKind.text:
                s += d.text.split('\r').join('');
                break;
            case ts.SymbolDisplayPartKind.lineBreak:
                s += '\n';
                break;
            case ts.SymbolDisplayPartKind.space:
                s += ' ';
                break;
            case ts.SymbolDisplayPartKind.aliasName:
            case ts.SymbolDisplayPartKind.className:
            case ts.SymbolDisplayPartKind.enumName:
            case ts.SymbolDisplayPartKind.fieldName:
            case ts.SymbolDisplayPartKind.interfaceName:
            case ts.SymbolDisplayPartKind.keyword:
            case ts.SymbolDisplayPartKind.numericLiteral:
            case ts.SymbolDisplayPartKind.stringLiteral:
            case ts.SymbolDisplayPartKind.localName:
            case ts.SymbolDisplayPartKind.methodName:
            case ts.SymbolDisplayPartKind.moduleName:
            case ts.SymbolDisplayPartKind.operator:
            case ts.SymbolDisplayPartKind.parameterName:
            case ts.SymbolDisplayPartKind.propertyName:
            case ts.SymbolDisplayPartKind.punctuation:
            case ts.SymbolDisplayPartKind.typeParameterName:
            case ts.SymbolDisplayPartKind.enumMemberName:
            case ts.SymbolDisplayPartKind.functionName:
            case ts.SymbolDisplayPartKind.regularExpressionLiteral:
                s += d.text.split('\r').join('');
                break;
        }
    }

    return s;
}

export {
    applyMethodOverride,
    applyPropertyOverride,
    makeParameter,
    visitConstructorDeclaration,
    visitGetAccessor,
    visitInterfaceElement,
    visitMethodDeclaration,
    visitMethodParameter,
    visitMethodSignature,
    visitPropertyDeclaration,
    visitPropertySignature,
    visitSetAccessor
} from './Members';
export { _collectMembers, createDiscriminatedUnionBaseInterface, createDiscriminatedUnionClass } from './RecordDecls';
