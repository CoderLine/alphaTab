import * as ts from 'typescript';

// Base
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
    EnumMember,
    ArrayTypeNode,

    Block,
    EmptyStatement,
    VariableStatement,
    ExpressionStatement,
    IfStatement,
    DoStatement,
    WhileStatement,
    ForStatement,
    ForEachStatement,
    BreakStatement,
    ContinueStatement,
    ReturnStatement,
    SwitchStatement,
    LabeledStatement,
    ThrowStatement,
    TryStatement,

    VariableDeclarationList,
    VariableDeclaration,
    DeconstructDeclaration,
    CaseClause,
    DefaultClause,
    CatchClause,

    PrefixUnaryExpression,
    PostfixUnaryExpression,
    NullLiteral,
    TrueLiteral,
    FalseLiteral,
    ThisLiteral,
    BaseLiteralExpression,
    StringLiteral,
    AwaitExpression,
    BinaryExpression,
    ConditionalExpression,
    LambdaExpression,
    NumericLiteral,
    StringTemplateExpression,
    IsExpression,
    ParenthesizedExpression,
    ArrayCreationExpression,
    MemberAccessExpression,
    AnonymousObjectCreationExpression,
    AnonymousObjectProperty,
    ElementAccessExpression,
    InvocationExpression,
    NewExpression,
    CastExpression,
    NonNullExpression,
    NullSafeExpression,
    Identifier,
    DefaultExpression,
    ToDoExpression,
    TypeOfExpression,
    
    Attribute
}

export interface Node {
    skipEmit?: boolean;
    tsNode?: ts.Node;
    tsSymbol?: ts.Symbol;
    nodeType: SyntaxKind;
    parent: Node | null;
}

export interface SourceFile extends Node {
    fileName: string;
    usings: UsingDeclaration[];
    namespace: NamespaceDeclaration;
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
    documentation?: string;
}
export interface AttributedElement {
    attributes?: Attribute[];
}

export interface Attribute extends Node {
    type: TypeNode,
    arguments?: Expression[]
}

export interface NamedElement {
    name: string;
}

// Declarations

export interface TypeParameterDeclaration extends NamedElement, Node {
    constraint?: TypeNode;
}

export interface NamedTypeDeclaration extends NamedElement, DocumentedElement, Node, AttributedElement {
    typeParameters?: TypeParameterDeclaration[];
    visibility: Visibility;
    partial: boolean;
}

export interface ClassDeclaration extends NamedTypeDeclaration {
    baseClass?: TypeNode;
    interfaces?: TypeNode[];
    isAbstract: boolean;
    members: ClassMember[];
}

export type ClassMember =
    | ConstructorDeclaration
    | MethodDeclaration
    | FieldDeclaration
    | PropertyDeclaration
    | EventDeclaration
    | NamedTypeDeclaration;

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
    isAsync?: boolean;
}

export interface MethodDeclaration extends MethodDeclarationBase, AttributedElement {
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
    type?: TypeNode;
    initializer?: Expression;
    params: boolean;
}

// Type System

export interface TypeNode extends Node {
    isNullable?: boolean;
    isOptional?: boolean;
}

export interface UnresolvedTypeNode extends TypeNode {
    tsType?: ts.Type;
    tsSymbol?: ts.Symbol;
    typeArguments?: UnresolvedTypeNode[];
}

export type TypeReferenceType = NamedTypeDeclaration | TypeParameterDeclaration | PrimitiveTypeNode | string;
export interface TypeReference extends TypeNode {
    reference: TypeReferenceType;
    typeArguments?: TypeNode[];
}

export interface ArrayTypeNode extends TypeNode {
    elementType: TypeNode;
}

export enum PrimitiveType {
    Bool,
    String,
    Double,
    Int,
    Void,
    Object,
    Dynamic,
    Var
}

export interface PrimitiveTypeNode extends TypeNode {
    type: PrimitiveType;
}

// Expressions

export interface Expression extends Node {}

export interface PrefixUnaryExpression extends Node {
    operand: Expression;
    operator: string;
}

export interface PostfixUnaryExpression extends Node {
    operand: Expression;
    operator: string;
}

export interface NullLiteral extends Node {}

export interface BooleanLiteral extends Node {}

export interface ThisLiteral extends Node {}

export interface BaseLiteralExpression extends Node {}

export interface StringLiteral extends Node {
    text: string;
}

export interface AwaitExpression extends Node {
    expression: Expression;
}

export interface BinaryExpression extends Node {
    left: Expression;
    operator: string;
    right: Expression;
}

export interface ConditionalExpression extends Node {
    condition: Expression;
    whenTrue: Expression;
    whenFalse: Expression;
}

export interface LambdaExpression extends Node {
    parameters: ParameterDeclaration[];
    body: Block | Expression;
}

export interface NumericLiteral extends Node {
    value: string;
}
export interface StringTemplateExpression extends Node {
    chunks: (StringLiteral | Expression)[];
}

export interface IsExpression extends Node {
    expression: Expression;
    type: TypeNode;
    newName?: string;
}
export interface ParenthesizedExpression extends Node {
    expression: Expression;
}
export interface DefaultExpression extends Node {
    type?: TypeNode;
}
export interface ArrayCreationExpression extends Node {
    type?: TypeNode;
    values?: Expression[];
    sizeExpression?: Expression;
}
export interface MemberAccessExpression extends Node {
    expression: Expression;
    member: string;
    nullSafe?: boolean;
}

export interface AnonymousObjectCreationExpression extends Node {
    properties: AnonymousObjectProperty[];
}

export interface AnonymousObjectProperty extends Node {
    name: string;
    value: Expression;
}

export interface ElementAccessExpression extends Node {
    expression: Expression;
    argumentExpression: Expression;
}

export interface InvocationExpression extends Node {
    expression: Expression;
    arguments: Expression[];
    typeArguments?: TypeNode[];
}

export interface NewExpression extends Node {
    type: TypeNode;
    arguments: Expression[];
}

export interface CastExpression extends Node {
    type: TypeNode;
    expression: Expression;
}

export interface NonNullExpression extends Node {
    expression: Expression;
}

export interface TypeOfExpression extends Node {
    expression: Expression;
}

export interface NullSafeExpression extends Node {
    expression: Expression;
}

export interface Identifier extends Expression {
    text: string;
}

export interface ToDoExpression extends Node {}

// Statements

export interface Statement extends Node {}

export interface Block extends Statement {
    statements: Statement[];
}

export interface EmptyStatement extends Statement {}

export interface VariableStatement extends Statement {
    declarationList: VariableDeclarationList;
}

export interface ExpressionStatement extends Statement {
    expression: Expression;
}

export interface IfStatement extends Statement {
    expression: Expression;
    thenStatement: Statement;
    elseStatement?: Statement;
}

export interface DoStatement extends Statement {
    expression: Expression;
    statement: Statement;
}

export interface WhileStatement extends Statement {
    expression: Expression;
    statement: Statement;
}

export interface VariableDeclarationList extends Node {
    declarations: VariableDeclaration[];
}

export interface VariableDeclaration extends Node {
    type: TypeNode;
    name: string;
    deconstructNames?: string[];
    initializer?: Expression;
}

export interface DeconstructDeclaration extends Node {
    names: string[];
}

export interface ForStatement extends Statement {
    initializer?: VariableDeclarationList | Expression;
    condition?: Expression;
    incrementor?: Expression;
    statement: Statement;
}

export interface ForEachStatement extends Statement {
    initializer: VariableDeclarationList | Expression;
    expression: Expression;
    statement: Statement;
}

export interface BreakStatement extends Statement {}

export interface ContinueStatement extends Statement {}

export interface ReturnStatement extends Statement {
    expression?: Expression;
}

export interface SwitchStatement extends Statement {
    expression: Expression;
    caseClauses: (CaseClause | DefaultClause)[];
}

export interface CaseClause extends Node {
    expression: Expression;
    statements: Statement[];
}

export interface DefaultClause extends Node {
    statements: Statement[];
}

export interface ThrowStatement extends Statement {
    expression?: Expression;
}

export interface TryStatement extends Statement {
    tryBlock: Block;
    catchClauses?: CatchClause[];
    finallyBlock?: Block;
}

export interface CatchClause extends Node {
    variableDeclaration: VariableDeclaration;
    block: Block;
}
