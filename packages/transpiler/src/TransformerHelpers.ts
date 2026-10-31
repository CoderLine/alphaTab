import ts from 'typescript';
import type EmitterContextBase from './EmitterContextBase';
import * as cs from './ir/Ir';
import { findAllTags, hasTag, JsDocTag } from './jsDocTags';

export function createLazyTypeRef(
    context: EmitterContextBase,
    parent: cs.Node | null,
    tsNode: ts.Node,
    tsType?: ts.Type,
    tsSymbol?: ts.Symbol
): cs.LazyTypeRef {
    if (!tsType) {
        tsType = context.typeChecker.getTypeAtLocation(tsNode);
    }

    const lazy = {
        nodeType: cs.SyntaxKind.LazyTypeRef,
        tsNode,
        tsType,
        tsSymbol,
        parent,
        resolve(): cs.TypeNode {
            if (this.resolved) {
                return this.resolved;
            }
            const r = context.resolveLazyTypeRef(this);
            return r ?? this;
        }
    } as cs.LazyTypeRef;

    let typeArguments = (tsType as ts.TypeReference)?.typeArguments;
    if (tsType && !typeArguments) {
        const nonNullable = context.typeChecker.getNonNullableType(tsType);
        typeArguments = (nonNullable as ts.TypeReference)?.typeArguments;
    }
    if (typeArguments) {
        lazy.typeArguments = typeArguments.map(a => createLazyTypeRef(context, lazy, tsNode, a));
    }

    return lazy;
}

export function createVarTypeNode(parent: cs.Node | null, tsNode: ts.Node): cs.PrimitiveTypeNode {
    return {
        nodeType: cs.SyntaxKind.PrimitiveTypeNode,
        tsNode,
        parent,
        type: cs.PrimitiveType.Var
    } as cs.PrimitiveTypeNode;
}

export function shouldSkip(node: ts.Node, checkComments: boolean, targetTag: string): boolean {
    if (checkComments) {
        const text = node.getSourceFile().text;
        const commentText = text.substr(node.getStart() - node.getLeadingTriviaWidth(), node.getLeadingTriviaWidth());
        if (commentText.indexOf('/*@target web*/') >= 0) {
            return true;
        }
    }
    const tags = findAllTags(node, JsDocTag.target);
    if (tags.length > 0) {
        return !tags.find(t => t.comment === targetTag);
    }
    return false;
}

export function getVisibility(context: EmitterContextBase, node: ts.Node): cs.Visibility {
    if (hasTag(node, JsDocTag.public)) {
        return cs.Visibility.Public;
    }
    if (hasTag(node, JsDocTag.internal)) {
        return cs.Visibility.Internal;
    }

    switch (node.kind) {
        case ts.SyntaxKind.ClassDeclaration:
        case ts.SyntaxKind.InterfaceDeclaration:
        case ts.SyntaxKind.EnumDeclaration:
        case ts.SyntaxKind.TypeAliasDeclaration:
            context.addTsNodeDiagnostics(
                node,
                'All types need to define their visibility with @public or @internal',
                ts.DiagnosticCategory.Error
            );
            break;
    }

    return cs.Visibility.Internal;
}

export function mapVisibility(context: EmitterContextBase, node: ts.Node, fallback: cs.Visibility): cs.Visibility {
    if (context.isInternal(node)) {
        return cs.Visibility.Internal;
    }
    if ('modifiers' in node && node.modifiers) {
        for (const m of node.modifiers as ts.NodeArray<ts.Modifier>) {
            switch (m.kind) {
                case ts.SyntaxKind.PublicKeyword:
                    return cs.Visibility.Public;
                case ts.SyntaxKind.PrivateKeyword:
                    return cs.Visibility.Private;
                case ts.SyntaxKind.ProtectedKeyword:
                    return cs.Visibility.Protected;
            }
        }
    }
    return fallback;
}

export function visitDocumentationAttributes(
    context: EmitterContextBase,
    attributeNames: { deprecatedAttributeName: string },
    a: cs.AttributedElement,
    node: ts.Node
): void {
    const deprecated = ts.getJSDocDeprecatedTag(node);
    if (deprecated) {
        a.attributes ??= [];
        a.attributes.push({
            nodeType: cs.SyntaxKind.Attribute,
            parent: a,
            type: {
                parent: null,
                nodeType: cs.SyntaxKind.TypeReference,
                reference: context.makeTypeName(attributeNames.deprecatedAttributeName)
            } as cs.TypeReference,
            arguments: [
                {
                    nodeType: cs.SyntaxKind.StringLiteral,
                    text: _jsDocToString(deprecated.comment)
                } as cs.StringLiteral
            ]
        });
    }
}

function _jsDocToString(
    comment: string | ts.NodeArray<ts.JSDocComment> | ts.JSDocComment | ts.EntityName | ts.JSDocMemberName | undefined
): string {
    switch (typeof comment) {
        case 'string':
            return comment;
        case 'undefined':
            return '';
        default:
            if ('kind' in comment) {
                switch (comment.kind) {
                    case ts.SyntaxKind.Identifier:
                        return comment.text;
                    case ts.SyntaxKind.QualifiedName:
                    case ts.SyntaxKind.JSDocMemberName:
                        return `${_jsDocToString(comment.left)}.${_jsDocToString(comment.right)}`;
                    case ts.SyntaxKind.JSDocText:
                        return comment.text;
                    case ts.SyntaxKind.JSDocLink:
                    case ts.SyntaxKind.JSDocLinkCode:
                    case ts.SyntaxKind.JSDocLinkPlain:
                        return comment.text || _jsDocToString(comment.name);
                }
            }
            return comment.map(v => _jsDocToString(v)).join('');
    }
}

export function tryCreateEnumAccess(
    context: EmitterContextBase,
    parent: cs.Node,
    type: ts.Type,
    expression: ts.Expression
): cs.Expression | undefined {
    const enumValue = Number.parseInt(expression.getText(), 10);
    const enumMember = (type as ts.UnionType).types.find(t => (t as ts.NumberLiteralType).value === enumValue);
    if (enumMember) {
        const access = {
            nodeType: cs.SyntaxKind.MemberAccessExpression,
            parent,
            expression: null!,
            tsSymbol: enumMember.symbol,
            member: context.toPropertyNameCase(enumMember.symbol.name)
        } as cs.MemberAccessExpression;
        const identifier = {
            parent: access,
            tsNode: expression,
            tsSymbol: type.symbol,
            nodeType: cs.SyntaxKind.Identifier,
            text: type.symbol.name
        } as cs.Identifier;
        access.expression = identifier;
        return access;
    }
    return undefined;
}
