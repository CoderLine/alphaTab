import * as ts from 'typescript';

// Base
export enum SyntaxKind {
    SourceFile,
    UsingDeclaration,
    NamespaceDeclaration,
    ClassDeclaration,
    EnumDeclaration,
    InterfaceDeclaration,
    TypeParameterDeclaration,
    MethodDeclaration,
    ConstructorDeclaration,
    FieldDeclaration,
    PropertyDeclaration,
    PropertyAccessorDeclaration,
    ParameterDeclaration,
    UnresolvedTypeNode,
    TypeReference,
    FunctionTypeNode,
    PrimitiveTypeNode,
    EnumMember,
    ArrayTypeNode,
    MapTypeNode,
    ArrayTupleNode,

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

    Attribute,

    SpreadExpression,
    LocalFunction,
    YieldExpression
}

export interface Node {
    skipEmit?: boolean;
    tsNode?: ts.Node;
    tsSymbol?: ts.Symbol;
    nodeType: SyntaxKind;
    parent: Node | null;
}

export interface SourceFile extends Node {
    nodeType: SyntaxKind.SourceFile;
    fileName: string;
    usings: UsingDeclaration[];
    namespace: NamespaceDeclaration;
}

export interface UsingDeclaration extends Node {
    nodeType: SyntaxKind.UsingDeclaration;
    namespaceOrTypeName: string;
}

export interface NamespaceDeclaration extends Node {
    nodeType: SyntaxKind.NamespaceDeclaration;
    namespace: string;
    declarations: NamespaceMember[];
}

export type NamespaceMember = ClassDeclaration | EnumDeclaration | InterfaceDeclaration;

export enum Visibility {
    None,
    Public,
    Protected,
    Private,
    Internal
}

export interface DocumentedElement extends Node {
    documentation?: string;
}
export interface AttributedElement {
    attributes?: Attribute[];
}

export interface Attribute extends Node {
    nodeType: SyntaxKind.Attribute;
    type: TypeNode;
    arguments?: Expression[];
}

export interface NamedElement {
    name: string;
}

// Declarations

export interface TypeParameterDeclaration extends NamedElement, Node {
    nodeType: SyntaxKind.TypeParameterDeclaration;
    constraint?: TypeNode;
}

export interface NamedTypeDeclaration extends NamedElement, DocumentedElement, Node, AttributedElement {
    typeParameters?: TypeParameterDeclaration[];
    visibility: Visibility;
    partial: boolean;
    hasVirtualMembersOrSubClasses: boolean;
}

export interface ClassDeclaration extends NamedTypeDeclaration {
    nodeType: SyntaxKind.ClassDeclaration;
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
    | NamedTypeDeclaration;

export interface EnumDeclaration extends NamedTypeDeclaration {
    nodeType: SyntaxKind.EnumDeclaration;
    members: EnumMember[];
}

export interface EnumMember extends Node, NamedElement, DocumentedElement {
    nodeType: SyntaxKind.EnumMember;
    initializer?: Expression;
}

export interface InterfaceDeclaration extends NamedTypeDeclaration {
    nodeType: SyntaxKind.InterfaceDeclaration;
    interfaces?: TypeNode[];
    members: InterfaceMember[];
}

export type InterfaceMember = MethodDeclaration | PropertyDeclaration;

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
    nodeType: SyntaxKind.MethodDeclaration;
    isVirtual: boolean;
    isOverride: boolean;
    isAbstract: boolean;
    isTestMethod: boolean;
    isGeneratorFunction: boolean;
    partial: boolean;
    returnType: TypeNode;
    parameters: ParameterDeclaration[];
    body?: Block | Expression;
    typeParameters?: TypeParameterDeclaration[];
}

export interface ConstructorDeclaration extends MethodDeclarationBase {
    nodeType: SyntaxKind.ConstructorDeclaration;
    baseConstructorArguments?: Expression[];
}

export interface FieldDeclaration extends MemberDeclaration {
    nodeType: SyntaxKind.FieldDeclaration;
    isReadonly: boolean;
    type: TypeNode;
    initializer?: Expression;
}

export interface PropertyDeclaration extends MemberDeclaration {
    nodeType: SyntaxKind.PropertyDeclaration;
    isVirtual: boolean;
    isOverride: boolean;
    isAbstract: boolean;

    type: TypeNode;
    getAccessor?: PropertyAccessorDeclaration;
    setAccessor?: PropertyAccessorDeclaration;
    initializer?: Expression;
}

export interface PropertyAccessorDeclaration extends Node {
    nodeType: SyntaxKind.PropertyAccessorDeclaration;
    keyword: string;
    body?: Block | Expression;
}

export interface ParameterDeclaration extends NamedElement, Node, DocumentedElement {
    nodeType: SyntaxKind.ParameterDeclaration;
    type?: TypeNode;
    initializer?: Expression;
    params: boolean;
    isOptional: boolean;
}

// Type System

export interface TypeNode extends Node {
    isNullable?: boolean;
}

export interface UnresolvedTypeNode extends TypeNode {
    nodeType: SyntaxKind.UnresolvedTypeNode;
    tsType?: ts.Type;
    tsSymbol?: ts.Symbol;
    typeArguments?: UnresolvedTypeNode[];
}

export type TypeReferenceType = NamedTypeDeclaration | TypeParameterDeclaration | TypeNode | string;
export interface TypeReference extends TypeNode {
    nodeType: SyntaxKind.TypeReference;
    reference: TypeReferenceType;
    isAsync: boolean;
    typeArguments?: TypeNode[];
}

export interface ArrayTypeNode extends TypeNode {
    nodeType: SyntaxKind.ArrayTypeNode;
    elementType: TypeNode;
}

export interface MapTypeNode extends TypeNode {
    nodeType: SyntaxKind.MapTypeNode;
    keyType: TypeNode | null;
    keyIsValueType: boolean;
    valueType: TypeNode | null;
    valueIsValueType: boolean;
}

export interface ArrayTupleNode extends TypeNode {
    nodeType: SyntaxKind.ArrayTupleNode;
    types: TypeNode[];
}

export interface FunctionTypeNode extends TypeNode {
    nodeType: SyntaxKind.FunctionTypeNode;
    parameterTypes: TypeNode[];
    returnType: TypeNode;
}

export enum PrimitiveType {
    Bool,
    String,
    Double,
    Int,
    Void,
    Object,
    Var,
    Long
}

export interface PrimitiveTypeNode extends TypeNode {
    nodeType: SyntaxKind.PrimitiveTypeNode;
    type: PrimitiveType;
}

// Expressions

export interface Expression extends Node { }

export interface PrefixUnaryExpression extends Node {
    nodeType: SyntaxKind.PrefixUnaryExpression;
    operand: Expression;
    operator: string;
}

export interface PostfixUnaryExpression extends Node {
    nodeType: SyntaxKind.PostfixUnaryExpression;
    operand: Expression;
    operator: string;
}

export interface NullLiteral extends Node {
    nodeType: SyntaxKind.NullLiteral;
}

export interface BooleanLiteral extends Node {
    nodeType: SyntaxKind.TrueLiteral | SyntaxKind.FalseLiteral;
}

export interface ThisLiteral extends Node {
    nodeType: SyntaxKind.ThisLiteral;
}

export interface BaseLiteralExpression extends Node { }

export interface StringLiteral extends Node {
    nodeType: SyntaxKind.StringLiteral;
    text: string;
}

export interface AwaitExpression extends Node {
    nodeType: SyntaxKind.AwaitExpression;
    expression: Expression;
}

export interface BinaryExpression extends Node {
    nodeType: SyntaxKind.BinaryExpression;
    left: Expression;
    operator: string;
    right: Expression;
}

export interface ConditionalExpression extends Node {
    nodeType: SyntaxKind.ConditionalExpression;
    condition: Expression;
    whenTrue: Expression;
    whenFalse: Expression;
}

export interface LambdaExpression extends Node {
    nodeType: SyntaxKind.LambdaExpression;
    parameters: ParameterDeclaration[];
    body: Block | Expression;
    returnType: TypeNode;
}

export interface LocalFunctionDeclaration extends Node {
    nodeType: SyntaxKind.LocalFunction;
    name: string;
    parameters: ParameterDeclaration[];
    body: Block;
    returnType: TypeNode;
}

export interface NumericLiteral extends Node {
    nodeType: SyntaxKind.NumericLiteral;
    value: string;
}
export interface StringTemplateExpression extends Node {
    nodeType: SyntaxKind.StringTemplateExpression;
    chunks: (StringLiteral | Expression)[];
}

export interface IsExpression extends Node {
    nodeType: SyntaxKind.IsExpression;
    expression: Expression;
    type: TypeNode;
    newName?: string;
}
export interface ParenthesizedExpression extends Node {
    nodeType: SyntaxKind.ParenthesizedExpression;
    expression: Expression;
}
export interface SpreadExpression extends Node {
    nodeType: SyntaxKind.SpreadExpression;
    expression: Expression;
}
export interface DefaultExpression extends Node {
    nodeType: SyntaxKind.DefaultExpression;
    type?: TypeNode;
}
export interface ArrayCreationExpression extends Node {
    nodeType: SyntaxKind.ArrayCreationExpression;
    type?: TypeNode;
    values?: Expression[];
    sizeExpression?: Expression;
}
export interface MemberAccessExpression extends Node {
    nodeType: SyntaxKind.MemberAccessExpression;
    expression: Expression;
    member: string;
    nullSafe?: boolean;
}

export interface AnonymousObjectCreationExpression extends Node {
    nodeType: SyntaxKind.AnonymousObjectCreationExpression;
    properties: AnonymousObjectProperty[];
}

export interface AnonymousObjectProperty extends Node {
    nodeType: SyntaxKind.AnonymousObjectProperty;
    name: string;
    value: Expression;
}

export interface ElementAccessExpression extends Node {
    nodeType: SyntaxKind.ElementAccessExpression;
    expression: Expression;
    argumentExpression: Expression;
    nullSafe: boolean;
}

export interface InvocationExpression extends Node {
    nodeType: SyntaxKind.InvocationExpression;
    expression: Expression;
    arguments: Expression[];
    typeArguments?: TypeNode[];
    nullSafe?: Boolean;
}

export interface NewExpression extends Node {
    nodeType: SyntaxKind.NewExpression;
    type: TypeNode;
    arguments: Expression[];
}

export interface CastExpression extends Node {
    nodeType: SyntaxKind.CastExpression;
    type: TypeNode;
    expression: Expression;
}

export interface NonNullExpression extends Node {
    nodeType: SyntaxKind.NonNullExpression;
    expression: Expression;
}

export interface TypeOfExpression extends Node {
    nodeType: SyntaxKind.TypeOfExpression;
    expression: Expression;
}

export interface NullSafeExpression extends Node {
    nodeType: SyntaxKind.NullSafeExpression;
    expression: Expression;
}

export interface Identifier extends Expression {
    nodeType: SyntaxKind.Identifier;
    text: string;
}

export interface ToDoExpression extends Node {
    nodeType: SyntaxKind.ToDoExpression;
}
export interface YieldExpression extends Node {
    nodeType: SyntaxKind.YieldExpression;
    expression: Expression | null;
}

// Statements

export interface Statement extends Node { }

export interface Block extends Statement {
    nodeType: SyntaxKind.Block;
    statements: Statement[];
}

export interface EmptyStatement extends Statement {
    nodeType: SyntaxKind.EmptyStatement;
}

export enum VariableStatementKind {
    Normal,
    Const,
    Using,
    AwaitUsing
}

export interface VariableStatement extends Statement {
    nodeType: SyntaxKind.VariableStatement;
    declarationList: VariableDeclarationList;
    variableStatementKind: VariableStatementKind;
}

export interface ExpressionStatement extends Statement {
    nodeType: SyntaxKind.ExpressionStatement;
    expression: Expression;
}

export interface IfStatement extends Statement {
    nodeType: SyntaxKind.IfStatement;
    expression: Expression;
    thenStatement: Statement;
    elseStatement?: Statement;
}

export interface DoStatement extends Statement {
    nodeType: SyntaxKind.DoStatement;
    expression: Expression;
    statement: Statement;
}

export interface WhileStatement extends Statement {
    nodeType: SyntaxKind.WhileStatement;
    expression: Expression;
    statement: Statement;
}

export interface VariableDeclarationList extends Node {
    nodeType: SyntaxKind.VariableDeclarationList;
    declarations: VariableDeclaration[];
    isConst: boolean;
}

export interface VariableDeclaration extends Node {
    nodeType: SyntaxKind.VariableDeclaration;
    type: TypeNode;
    name: string;
    deconstructNames?: string[];
    initializer?: Expression;
}

export interface DeconstructDeclaration extends Node {
    nodeType: SyntaxKind.DeconstructDeclaration;
    names: string[];
}

export interface ForStatement extends Statement {
    nodeType: SyntaxKind.ForStatement;
    initializer?: VariableDeclarationList | Expression;
    condition?: Expression;
    incrementor?: Expression;
    statement: Statement;
}

export interface ForEachStatement extends Statement {
    nodeType: SyntaxKind.ForEachStatement;
    initializer: VariableDeclarationList | Expression;
    expression: Expression;
    statement: Statement;
}

export interface BreakStatement extends Statement {
    nodeType: SyntaxKind.BreakStatement;
}

export interface ContinueStatement extends Statement {
    nodeType: SyntaxKind.ContinueStatement;
}

export interface ReturnStatement extends Statement {
    nodeType: SyntaxKind.ReturnStatement;
    expression?: Expression;
}

export interface SwitchStatement extends Statement {
    nodeType: SyntaxKind.SwitchStatement;
    expression: Expression;
    caseClauses: (CaseClause | DefaultClause)[];
}

export interface CaseClause extends Node {
    nodeType: SyntaxKind.CaseClause;
    expression: Expression;
    statements: Statement[];
}

export interface DefaultClause extends Node {
    nodeType: SyntaxKind.DefaultClause;
    statements: Statement[];
}

export interface ThrowStatement extends Statement {
    nodeType: SyntaxKind.ThrowStatement;
    expression?: Expression;
}

export interface TryStatement extends Statement {
    nodeType: SyntaxKind.TryStatement;
    tryBlock: Block;
    catchClauses?: CatchClause[];
    finallyBlock?: Block;
}

export interface CatchClause extends Node {
    nodeType: SyntaxKind.CatchClause;
    variableDeclaration: VariableDeclaration;
    block: Block;
}

// Node Tests
export function isNode(node: any): node is Node {
    return typeof node === 'object' && 'nodeType' in node;
}
export function isSourceFile(node: Node): node is SourceFile {
    return node.nodeType === SyntaxKind.SourceFile;
}
export function isUsingDeclaration(node: Node): node is UsingDeclaration {
    return node.nodeType === SyntaxKind.UsingDeclaration;
}
export function isNamespaceDeclaration(node: Node): node is NamespaceDeclaration {
    return node.nodeType === SyntaxKind.NamespaceDeclaration;
}
export function isClassDeclaration(node: Node): node is ClassDeclaration {
    return node.nodeType === SyntaxKind.ClassDeclaration;
}
export function isEnumDeclaration(node: Node): node is EnumDeclaration {
    return node.nodeType === SyntaxKind.EnumDeclaration;
}
export function isInterfaceDeclaration(node: Node): node is InterfaceDeclaration {
    return node.nodeType === SyntaxKind.InterfaceDeclaration;
}
export function isTypeParameterDeclaration(node: Node): node is TypeParameterDeclaration {
    return node.nodeType === SyntaxKind.TypeParameterDeclaration;
}
export function isMethodDeclaration(node: Node): node is MethodDeclaration {
    return node.nodeType === SyntaxKind.MethodDeclaration;
}
export function isConstructorDeclaration(node: Node): node is ConstructorDeclaration {
    return node.nodeType === SyntaxKind.ConstructorDeclaration;
}
export function isFieldDeclaration(node: Node): node is FieldDeclaration {
    return node.nodeType === SyntaxKind.FieldDeclaration;
}
export function isPropertyDeclaration(node: Node): node is PropertyDeclaration {
    return node.nodeType === SyntaxKind.PropertyDeclaration;
}
export function isPropertyAccessorDeclaration(node: Node): node is PropertyAccessorDeclaration {
    return node.nodeType === SyntaxKind.PropertyAccessorDeclaration;
}
export function isParameterDeclaration(node: Node): node is ParameterDeclaration {
    return node.nodeType === SyntaxKind.ParameterDeclaration;
}
export function isUnresolvedTypeNode(node: Node): node is UnresolvedTypeNode {
    return node.nodeType === SyntaxKind.UnresolvedTypeNode;
}
export function isTypeReference(node: Node): node is TypeReference {
    return node.nodeType === SyntaxKind.TypeReference;
}
export function isFunctionTypeNode(node: Node): node is FunctionTypeNode {
    return node.nodeType === SyntaxKind.FunctionTypeNode;
}
export function isPrimitiveTypeNode(node: Node): node is PrimitiveTypeNode {
    return node.nodeType === SyntaxKind.PrimitiveTypeNode;
}
export function isEnumMember(node: Node): node is EnumMember {
    return node.nodeType === SyntaxKind.EnumMember;
}
export function isArrayTypeNode(node: Node): node is ArrayTypeNode {
    return node.nodeType === SyntaxKind.ArrayTypeNode;
}
export function isMapTypeNode(node: Node): node is MapTypeNode {
    return node.nodeType === SyntaxKind.MapTypeNode;
}

export function isBlock(node: Node): node is Block {
    return node.nodeType === SyntaxKind.Block;
}
export function isEmptyStatement(node: Node): node is EmptyStatement {
    return node.nodeType === SyntaxKind.EmptyStatement;
}
export function isVariableStatement(node: Node): node is VariableStatement {
    return node.nodeType === SyntaxKind.VariableStatement;
}
export function isExpressionStatement(node: Node): node is ExpressionStatement {
    return node.nodeType === SyntaxKind.ExpressionStatement;
}
export function isIfStatement(node: Node): node is IfStatement {
    return node.nodeType === SyntaxKind.IfStatement;
}
export function isDoStatement(node: Node): node is DoStatement {
    return node.nodeType === SyntaxKind.DoStatement;
}
export function isWhileStatement(node: Node): node is WhileStatement {
    return node.nodeType === SyntaxKind.WhileStatement;
}
export function isForStatement(node: Node): node is ForStatement {
    return node.nodeType === SyntaxKind.ForStatement;
}
export function isForEachStatement(node: Node): node is ForEachStatement {
    return node.nodeType === SyntaxKind.ForEachStatement;
}
export function isBreakStatement(node: Node): node is BreakStatement {
    return node.nodeType === SyntaxKind.BreakStatement;
}
export function isContinueStatement(node: Node): node is ContinueStatement {
    return node.nodeType === SyntaxKind.ContinueStatement;
}
export function isReturnStatement(node: Node): node is ReturnStatement {
    return node.nodeType === SyntaxKind.ReturnStatement;
}
export function isSwitchStatement(node: Node): node is SwitchStatement {
    return node.nodeType === SyntaxKind.SwitchStatement;
}
export function isThrowStatement(node: Node): node is ThrowStatement {
    return node.nodeType === SyntaxKind.ThrowStatement;
}
export function isTryStatement(node: Node): node is TryStatement {
    return node.nodeType === SyntaxKind.TryStatement;
}

export function isVariableDeclarationList(node: Node): node is VariableDeclarationList {
    return node.nodeType === SyntaxKind.VariableDeclarationList;
}
export function isVariableDeclaration(node: Node): node is VariableDeclaration {
    return node.nodeType === SyntaxKind.VariableDeclaration;
}
export function isDeconstructDeclaration(node: Node): node is DeconstructDeclaration {
    return node.nodeType === SyntaxKind.DeconstructDeclaration;
}
export function isCaseClause(node: Node): node is CaseClause {
    return node.nodeType === SyntaxKind.CaseClause;
}
export function isDefaultClause(node: Node): node is DefaultClause {
    return node.nodeType === SyntaxKind.DefaultClause;
}
export function isCatchClause(node: Node): node is CatchClause {
    return node.nodeType === SyntaxKind.CatchClause;
}

export function isPrefixUnaryExpression(node: Node): node is PrefixUnaryExpression {
    return node.nodeType === SyntaxKind.PrefixUnaryExpression;
}
export function isPostfixUnaryExpression(node: Node): node is PostfixUnaryExpression {
    return node.nodeType === SyntaxKind.PostfixUnaryExpression;
}
export function isNullLiteral(node: Node): node is NullLiteral {
    return node.nodeType === SyntaxKind.NullLiteral;
}
export function isTrueLiteral(node: Node): node is BooleanLiteral {
    return node.nodeType === SyntaxKind.TrueLiteral;
}
export function isFalseLiteral(node: Node): node is BooleanLiteral {
    return node.nodeType === SyntaxKind.FalseLiteral;
}
export function isThisLiteral(node: Node): node is ThisLiteral {
    return node.nodeType === SyntaxKind.ThisLiteral;
}
export function isBaseLiteralExpression(node: Node): node is BaseLiteralExpression {
    return node.nodeType === SyntaxKind.BaseLiteralExpression;
}
export function isStringLiteral(node: Node): node is StringLiteral {
    return node.nodeType === SyntaxKind.StringLiteral;
}
export function isAwaitExpression(node: Node): node is AwaitExpression {
    return node.nodeType === SyntaxKind.AwaitExpression;
}
export function isBinaryExpression(node: Node): node is BinaryExpression {
    return node.nodeType === SyntaxKind.BinaryExpression;
}
export function isConditionalExpression(node: Node): node is ConditionalExpression {
    return node.nodeType === SyntaxKind.ConditionalExpression;
}
export function isLambdaExpression(node: Node): node is LambdaExpression {
    return node.nodeType === SyntaxKind.LambdaExpression;
}
export function isNumericLiteral(node: Node): node is NumericLiteral {
    return node.nodeType === SyntaxKind.NumericLiteral;
}
export function isStringTemplateExpression(node: Node): node is StringTemplateExpression {
    return node.nodeType === SyntaxKind.StringTemplateExpression;
}
export function isIsExpression(node: Node): node is IsExpression {
    return node.nodeType === SyntaxKind.IsExpression;
}
export function isParenthesizedExpression(node: Node): node is ParenthesizedExpression {
    return node.nodeType === SyntaxKind.ParenthesizedExpression;
}
export function isArrayCreationExpression(node: Node): node is ArrayCreationExpression {
    return node.nodeType === SyntaxKind.ArrayCreationExpression;
}
export function isMemberAccessExpression(node: Node): node is MemberAccessExpression {
    return node.nodeType === SyntaxKind.MemberAccessExpression;
}
export function isAnonymousObjectCreationExpression(node: Node): node is AnonymousObjectCreationExpression {
    return node.nodeType === SyntaxKind.AnonymousObjectCreationExpression;
}
export function isAnonymousObjectProperty(node: Node): node is AnonymousObjectProperty {
    return node.nodeType === SyntaxKind.AnonymousObjectProperty;
}
export function isElementAccessExpression(node: Node): node is ElementAccessExpression {
    return node.nodeType === SyntaxKind.ElementAccessExpression;
}
export function isInvocationExpression(node: Node): node is InvocationExpression {
    return node.nodeType === SyntaxKind.InvocationExpression;
}
export function isNewExpression(node: Node): node is NewExpression {
    return node.nodeType === SyntaxKind.NewExpression;
}
export function isCastExpression(node: Node): node is CastExpression {
    return node.nodeType === SyntaxKind.CastExpression;
}
export function isNonNullExpression(node: Node): node is NonNullExpression {
    return node.nodeType === SyntaxKind.NonNullExpression;
}
export function isNullSafeExpression(node: Node): node is NullSafeExpression {
    return node.nodeType === SyntaxKind.NullSafeExpression;
}
export function isIdentifier(node: Node): node is Identifier {
    return node.nodeType === SyntaxKind.Identifier;
}
export function isDefaultExpression(node: Node): node is DefaultExpression {
    return node.nodeType === SyntaxKind.DefaultExpression;
}
export function isToDoExpression(node: Node): node is ToDoExpression {
    return node.nodeType === SyntaxKind.ToDoExpression;
}
export function isTypeOfExpression(node: Node): node is TypeOfExpression {
    return node.nodeType === SyntaxKind.TypeOfExpression;
}
export function isAttribute(node: Node): node is Attribute {
    return node.nodeType === SyntaxKind.Attribute;
}
export function isSpreadExpression(node: Node): node is SpreadExpression {
    return node.nodeType === SyntaxKind.SpreadExpression;
}
export function isLocalFunction(node: Node): node is LocalFunctionDeclaration {
    return node.nodeType === SyntaxKind.LocalFunction;
}
export function isYieldExpression(node: Node): node is YieldExpression {
    return node.nodeType === SyntaxKind.YieldExpression;
}
