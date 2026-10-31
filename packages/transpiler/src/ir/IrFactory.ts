/**
 * Factory functions for IR node construction.
 *
 * Every factory always sets `nodeType` and `parent` — the two fields
 * most commonly forgotten when writing inline object literals.
 *
 * Convention:
 *   - Simple nodes (≤4 fields): all required fields as direct positional params.
 *   - Complex nodes (>4 fields): `parent` and optional `tsNode` as first params,
 *     remaining required + optional fields via a typed `init` spread.
 *
 * `tsNode` is typed as `ts.Node | undefined` (not required) so callers that
 * synthesise nodes without a TS source counterpart can omit it.
 */
import type * as ts from 'typescript';
import * as cs from './Ir';

// ── Literals ─────────────────────────────────────────────────────────────────

export function identifier(parent: cs.Node, text: string, tsNode?: ts.Node): cs.Identifier {
    return { nodeType: cs.SyntaxKind.Identifier, parent, tsNode, text };
}

export function stringLiteral(parent: cs.Node, text: string, tsNode?: ts.Node): cs.StringLiteral {
    return { nodeType: cs.SyntaxKind.StringLiteral, parent, tsNode, text };
}

export function numericLiteral(parent: cs.Node, value: string, tsNode?: ts.Node): cs.NumericLiteral {
    return { nodeType: cs.SyntaxKind.NumericLiteral, parent, tsNode, value };
}

export function nullLiteral(parent: cs.Node, tsNode?: ts.Node): cs.NullLiteral {
    return { nodeType: cs.SyntaxKind.NullLiteral, parent, tsNode };
}

export function trueLiteral(parent: cs.Node, tsNode?: ts.Node): cs.BooleanLiteral {
    return { nodeType: cs.SyntaxKind.TrueLiteral, parent, tsNode };
}

export function falseLiteral(parent: cs.Node, tsNode?: ts.Node): cs.BooleanLiteral {
    return { nodeType: cs.SyntaxKind.FalseLiteral, parent, tsNode };
}

export function thisLiteral(parent: cs.Node, tsNode?: ts.Node): cs.ThisLiteral {
    return { nodeType: cs.SyntaxKind.ThisLiteral, parent, tsNode };
}

export function todoExpression(parent: cs.Node, tsNode?: ts.Node): cs.ToDoExpression {
    return { nodeType: cs.SyntaxKind.ToDoExpression, parent, tsNode };
}

// ── Types ─────────────────────────────────────────────────────────────────────

export function primitiveType(parent: cs.Node, type: cs.PrimitiveType, tsNode?: ts.Node): cs.PrimitiveTypeNode {
    return { nodeType: cs.SyntaxKind.PrimitiveTypeNode, parent, tsNode, type };
}

export function typeReference(parent: cs.Node, reference: cs.TypeReferenceType, tsNode?: ts.Node): cs.TypeReference {
    return { nodeType: cs.SyntaxKind.TypeReference, parent, tsNode, reference, isAsync: false };
}

// ── Expressions ───────────────────────────────────────────────────────────────

export function memberAccess(
    parent: cs.Node,
    expression: cs.Expression,
    member: string,
    tsNode?: ts.Node
): cs.MemberAccessExpression {
    const access: cs.MemberAccessExpression = {
        nodeType: cs.SyntaxKind.MemberAccessExpression,
        parent,
        tsNode,
        expression,
        member
    };
    if (expression) {
        expression.parent = access;
    }
    return access;
}

export function invocation(
    parent: cs.Node,
    expression: cs.Expression,
    args: cs.Expression[],
    tsNode?: ts.Node
): cs.InvocationExpression {
    const call: cs.InvocationExpression = {
        nodeType: cs.SyntaxKind.InvocationExpression,
        parent,
        tsNode,
        expression,
        arguments: args
    };
    if (expression) {
        expression.parent = call;
    }
    for (const a of args) {
        a.parent = call;
    }
    return call;
}

export function newExpression(
    parent: cs.Node,
    type: cs.TypeNode,
    args: cs.Expression[],
    tsNode?: ts.Node
): cs.NewExpression {
    return { nodeType: cs.SyntaxKind.NewExpression, parent, tsNode, type, arguments: args };
}

export function castExpression(
    parent: cs.Node,
    type: cs.TypeNode,
    expression: cs.Expression,
    tsNode?: ts.Node
): cs.CastExpression {
    return { nodeType: cs.SyntaxKind.CastExpression, parent, tsNode, type, expression };
}

/**
 * `(T)(expr)` — cast wrapping a parenthesized expression with parent pointers
 * wired. Inherits `tsNode` from `inner` unless one is given explicitly.
 */
export function castToPrimitive(
    parent: cs.Node | null,
    target: cs.PrimitiveType,
    inner: cs.Expression,
    tsNode?: ts.Node
): cs.CastExpression {
    const sharedTsNode = tsNode ?? inner.tsNode;
    const cast: cs.CastExpression = {
        nodeType: cs.SyntaxKind.CastExpression,
        parent,
        tsNode: sharedTsNode,
        expression: null!,
        type: null!
    };
    cast.expression = parenthesized(cast, inner, sharedTsNode);
    cast.type = primitiveType(cast, target, sharedTsNode);
    return cast;
}

/** `qualifiedName.member` — MemberAccessExpression with a freshly-built identifier on the LHS. */
export function staticMemberAccess(
    parent: cs.Node | null,
    qualifiedName: string,
    member: string,
    tsNode?: ts.Node
): cs.MemberAccessExpression {
    const access: cs.MemberAccessExpression = {
        nodeType: cs.SyntaxKind.MemberAccessExpression,
        parent,
        tsNode,
        expression: null!,
        member
    };
    access.expression = identifier(access, qualifiedName, tsNode);
    return access;
}

export function binaryExpression(
    parent: cs.Node,
    left: cs.Expression,
    operator: string,
    right: cs.Expression,
    tsNode?: ts.Node
): cs.BinaryExpression {
    return { nodeType: cs.SyntaxKind.BinaryExpression, parent, tsNode, left, operator, right };
}

export function prefixUnary(
    parent: cs.Node,
    operator: string,
    operand: cs.Expression,
    tsNode?: ts.Node
): cs.PrefixUnaryExpression {
    return { nodeType: cs.SyntaxKind.PrefixUnaryExpression, parent, tsNode, operator, operand };
}

export function postfixUnary(
    parent: cs.Node,
    operator: string,
    operand: cs.Expression,
    tsNode?: ts.Node
): cs.PostfixUnaryExpression {
    return { nodeType: cs.SyntaxKind.PostfixUnaryExpression, parent, tsNode, operator, operand };
}

export function parenthesized(
    parent: cs.Node,
    expression: cs.Expression,
    tsNode?: ts.Node
): cs.ParenthesizedExpression {
    return { nodeType: cs.SyntaxKind.ParenthesizedExpression, parent, tsNode, expression };
}

export function labeledExpression(
    parent: cs.Node,
    label: string,
    expression: cs.Expression,
    tsNode?: ts.Node
): cs.LabeledExpression {
    return { nodeType: cs.SyntaxKind.LabeledExpression, parent, tsNode, label, expression };
}

export function yieldExpression(
    parent: cs.Node,
    expression: cs.Expression | null,
    tsNode?: ts.Node
): cs.YieldExpression {
    return { nodeType: cs.SyntaxKind.YieldExpression, parent, tsNode, expression };
}

export function awaitExpression(parent: cs.Node, expression: cs.Expression, tsNode?: ts.Node): cs.AwaitExpression {
    return { nodeType: cs.SyntaxKind.AwaitExpression, parent, tsNode, expression };
}

export function nonNullExpression(parent: cs.Node, expression: cs.Expression, tsNode?: ts.Node): cs.NonNullExpression {
    return { nodeType: cs.SyntaxKind.NonNullExpression, parent, tsNode, expression };
}

// ── Statements ────────────────────────────────────────────────────────────────

export function block(parent: cs.Node, statements: cs.Statement[], tsNode?: ts.Node): cs.Block {
    return { nodeType: cs.SyntaxKind.Block, parent, tsNode, statements };
}

export function expressionStatement(
    parent: cs.Node,
    expression: cs.Expression,
    tsNode?: ts.Node
): cs.ExpressionStatement {
    return { nodeType: cs.SyntaxKind.ExpressionStatement, parent, tsNode, expression };
}

// ── Declarations (complex — use init spread) ──────────────────────────────────

export function attribute(parent: cs.Node, type: cs.TypeNode, args?: cs.Expression[], tsNode?: ts.Node): cs.Attribute {
    return { nodeType: cs.SyntaxKind.Attribute, parent, tsNode, type, arguments: args };
}

export function propertyAccessor(
    parent: cs.Node,
    keyword: string,
    body?: cs.Block | cs.Expression,
    tsNode?: ts.Node
): cs.PropertyAccessorDeclaration {
    return { nodeType: cs.SyntaxKind.PropertyAccessorDeclaration, parent, tsNode, keyword, body };
}

export function classDeclaration(
    parent: cs.Node,
    init: Omit<cs.ClassDeclaration, 'nodeType' | 'parent'>,
    tsNode?: ts.Node
): cs.ClassDeclaration {
    return { nodeType: cs.SyntaxKind.ClassDeclaration, parent, tsNode, ...init };
}

export function methodDeclaration(
    parent: cs.Node,
    init: Omit<cs.MethodDeclaration, 'nodeType' | 'parent'>,
    tsNode?: ts.Node
): cs.MethodDeclaration {
    return { nodeType: cs.SyntaxKind.MethodDeclaration, parent, tsNode, ...init };
}

export function propertyDeclaration(
    parent: cs.Node,
    init: Omit<cs.PropertyDeclaration, 'nodeType' | 'parent'>,
    tsNode?: ts.Node
): cs.PropertyDeclaration {
    return { nodeType: cs.SyntaxKind.PropertyDeclaration, parent, tsNode, ...init };
}

export function constructorDeclaration(
    parent: cs.Node,
    init: Omit<cs.ConstructorDeclaration, 'nodeType' | 'parent'>,
    tsNode?: ts.Node
): cs.ConstructorDeclaration {
    return { nodeType: cs.SyntaxKind.ConstructorDeclaration, parent, tsNode, ...init };
}

export function parameterDeclaration(
    parent: cs.Node,
    name: string,
    params: boolean,
    isOptional: boolean,
    type?: cs.TypeNode,
    initializer?: cs.Expression,
    tsNode?: ts.Node
): cs.ParameterDeclaration {
    return {
        nodeType: cs.SyntaxKind.ParameterDeclaration,
        parent,
        tsNode,
        name,
        params,
        isOptional,
        type,
        initializer
    };
}
