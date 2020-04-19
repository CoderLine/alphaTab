import * as ts from 'typescript';

export enum SyntaxKind {
    SourceFile,
    UsingDeclaration,
    NamespaceDeclaration,
    ClassDeclaration,
    EnumDeclaration,
    InterfaceDeclaration,
    DelegateDeclaration,
    TypeParameterDeclaration,
    MethodDeclaration,
    ConstructorDeclaration,
    FieldDeclaration,
    PropertyDeclaration,
    EventDeclaration,
    PropertyAccessorDeclaration,
    ParameterDeclaration,
    UnresolvedTypeNode,
    TypeReference,
    PrimitiveTypeNode,
    Block,
    EnumMember,
    ArrayTypeNode
}

export interface Node {
    tsNode?: ts.Node;
    nodeType: SyntaxKind;
    parent: Node | null;
}

export interface UsingDeclaration extends Node {
    typeAlias?: string;
    namespaceOrTypeName: string;
}

export interface NamespaceDeclaration extends Node {
    namespace: string;
    declarations: NamespaceMember[];
}

type NamespaceMember = ClassDeclaration | EnumDeclaration | InterfaceDeclaration | DelegateDeclaration;

export enum Visibility {
    None,
    Public,
    Protected,
    Private,
    Internal
}

export interface DocumentedElement {
    documentation?: string
}

export interface NamedElement {
    name: string
}

export interface TypeParameterDeclaration extends NamedElement, Node {
}

export interface NamedTypeDeclaration extends NamedElement, DocumentedElement, Node {
    typeParameters?: TypeParameterDeclaration[];
    visibility: Visibility;
}

export interface ClassDeclaration extends NamedTypeDeclaration {
    baseClass?: TypeNode;
    interfaces?: TypeNode[];
    isAbstract: boolean;
    members: ClassMember[];
}

export type ClassMember = ConstructorDeclaration | MethodDeclaration | FieldDeclaration | PropertyDeclaration | EventDeclaration | NamedTypeDeclaration;

export interface EnumDeclaration extends NamedTypeDeclaration {
    members: EnumMember[];
}

export interface EnumMember extends Node, NamedElement, DocumentedElement {
    initializer?: Expression;
}

export interface InterfaceDeclaration extends NamedTypeDeclaration {
    interfaces?: TypeNode[];
    members: InterfaceMember[];
}

export type InterfaceMember = MethodDeclaration | PropertyDeclaration | EventDeclaration;


export interface MemberDeclaration extends NamedElement, DocumentedElement, Node {
    visibility: Visibility;
    isStatic: boolean;
}

export interface MethodDeclarationBase extends MemberDeclaration {
    parameters: ParameterDeclaration[];
    body?: Block | Expression;
}

export interface MethodDeclaration extends MethodDeclarationBase {
    isVirtual: boolean;
    isOverride: boolean;
    isAbstract: boolean;
    returnType: TypeNode;
    parameters: ParameterDeclaration[];
    body?: Block | Expression;
    typeParameters?: TypeParameterDeclaration[];
}

export interface ConstructorDeclaration extends MethodDeclarationBase {
    baseConstructorArguments?: Expression[];
}

export interface FieldDeclaration extends MemberDeclaration {
    isReadonly: boolean;
    type: TypeNode;
    initializer?: Expression;
}

export interface PropertyDeclaration extends MemberDeclaration {
    isVirtual: boolean;
    isOverride: boolean;
    isAbstract: boolean;

    type: TypeNode;
    getAccessor?: PropertyAccessorDeclaration;
    setAccessor?: PropertyAccessorDeclaration;
    initializer?: Expression;
}

export interface PropertyAccessorDeclaration extends Node {
    keyword: string;
    body?: Block | Expression;
}

export interface EventDeclaration extends MemberDeclaration {
    eventType: TypeNode;
}

export interface DelegateDeclaration extends NamedTypeDeclaration {
    returnType: TypeNode;
    parameters: ParameterDeclaration[];
}

export interface ParameterDeclaration extends NamedElement, Node, DocumentedElement {
    type: TypeNode;
    initializer?: Expression;
}

export interface TypeNode extends Node {
    isNullable?: boolean;
    isOptional?: boolean;
}

export interface UnresolvedTypeNode extends TypeNode {
    tsType?: ts.Type
}

export interface TypeReference extends TypeNode {
    reference: NamedTypeDeclaration | TypeParameterDeclaration | PrimitiveTypeNode | string;
    typeArguments?: TypeNode[]
}

export interface ArrayTypeNode extends TypeNode {
    elementType: TypeNode
}

export enum PrimitiveType {
    Boolean,
    String,
    Number,
    Void,
    Object,
    Dynamic
}

export interface PrimitiveTypeNode extends TypeNode {
    type: PrimitiveType;
}

export interface Statement extends Node {
}

export interface Block extends Statement {
    statements: Statement[];
}

export interface Expression extends Node {
}

export interface SourceFile extends Node {
    fileName: string;
    usings: UsingDeclaration[];
    namespace: NamespaceDeclaration;
}
