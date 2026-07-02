import path from 'node:path';
import ts from 'typescript';
import type AstTransformer from '../AstTransformer';
import type { LanguageDescriptor } from '../AstTransformer';
import { CSharpLanguage } from '../csharp/CSharpLanguage';
import type EmitterContextBase from '../EmitterContextBase';
import type { HandlerRegistry } from '../HandlerRegistry';
import * as cs from '../ir/Ir';
import * as csf from '../ir/IrFactory';
import { hasTag, JsDocTag } from '../jsDocTags';
import { createLazyTypeRef, createVarTypeNode } from '../TransformerHelpers';
import * as Members from '../transforms/Members';

export const KotlinLanguage: LanguageDescriptor = {
    fileExtension: '.kt',

    attributeNames: {
        testClassAttribute: 'TestClass',
        testMethodAttribute: 'TestName',
        snapshotFileAttribute: 'SnapshotFile',
        deprecatedAttributeName: 'kotlin.Deprecated'
    },

    buildFileName(fileName: string, context: EmitterContextBase, isTestFile: boolean): string {
        const ext = '.kt';
        const firstDir = fileName.indexOf(path.sep);
        const base = fileName.substring(firstDir + 1).replace(/\.[^/.]+$/, '');
        return path.join(isTestFile ? context.testOutDir : context.srcOutDir, base + ext);
    },

    registerHandlers(registry: HandlerRegistry): void {
        CSharpLanguage.registerHandlers(registry);

        // Kotlin-specific mutable state — scoped to this registration call,
        // captured by all wrap closures below.
        const paramReferences: Map<string, cs.Identifier[]>[] = [];
        const paramsWithAssignment: Set<string>[] = [];

        // ── Expression wraps ──────────────────────────────────────────────────

        registry.wrap<ts.PrefixUnaryExpression>(ts.SyntaxKind.PrefixUnaryExpression, (base, t, p, node) => {
            const pre = base(t, p, node);
            const preUnwrapped =
                pre && cs.isCastExpression(pre)
                    ? (pre.expression as cs.PrefixUnaryExpression)
                    : (pre as cs.PrefixUnaryExpression);
            if (preUnwrapped) {
                switch (preUnwrapped.operator) {
                    case '++':
                    case '--': {
                        // Only bare-identifier operands can be parameter reassignments.
                        // `this.x++` looks like a parameter ref for parameter properties
                        // because TS shares the symbol — but it mutates the property.
                        if (ts.isIdentifier(node.operand)) {
                            const op = t.context.typeChecker.getSymbolAtLocation(node.operand);
                            if (op?.valueDeclaration && op.valueDeclaration.kind === ts.SyntaxKind.Parameter) {
                                paramsWithAssignment[paramsWithAssignment.length - 1]?.add(op.name);
                            }
                        }
                        break;
                    }
                }
            }
            return pre;
        });

        registry.wrap<ts.PostfixUnaryExpression>(ts.SyntaxKind.PostfixUnaryExpression, (base, t, p, node) => {
            const post = base(t, p, node) as cs.PostfixUnaryExpression | null;
            if (post) {
                switch (post.operator) {
                    case '++':
                    case '--': {
                        if (ts.isIdentifier(node.operand)) {
                            const op = t.context.typeChecker.getSymbolAtLocation(node.operand);
                            if (op?.valueDeclaration && op.valueDeclaration.kind === ts.SyntaxKind.Parameter) {
                                paramsWithAssignment[paramsWithAssignment.length - 1]?.add(op.name);
                            }
                        }
                        break;
                    }
                }
            }
            return post;
        });

        registry.wrap<ts.BinaryExpression>(ts.SyntaxKind.BinaryExpression, (base, t, p, node) => {
            const bin = base(t, p, node);
            if (
                node.operatorToken.kind === ts.SyntaxKind.EqualsToken ||
                node.operatorToken.kind === ts.SyntaxKind.PlusEqualsToken ||
                node.operatorToken.kind === ts.SyntaxKind.MinusEqualsToken ||
                node.operatorToken.kind === ts.SyntaxKind.AsteriskEqualsToken ||
                node.operatorToken.kind === ts.SyntaxKind.GreaterThanGreaterThanEqualsToken ||
                node.operatorToken.kind === ts.SyntaxKind.LessThanLessThanEqualsToken ||
                node.operatorToken.kind === ts.SyntaxKind.SlashEqualsToken
            ) {
                // Only bare-identifier LHS can be a parameter reassignment.
                if (ts.isIdentifier(node.left)) {
                    const left = t.context.typeChecker.getSymbolAtLocation(node.left);
                    if (left?.valueDeclaration && left.valueDeclaration.kind === ts.SyntaxKind.Parameter) {
                        paramsWithAssignment[paramsWithAssignment.length - 1]?.add(left.name);
                    }
                }
            }
            if (
                bin &&
                cs.isBinaryExpression(bin) &&
                (node.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken ||
                    node.operatorToken.kind === ts.SyntaxKind.EqualsEqualsToken) &&
                t.currentClassElement?.name &&
                ts.isIdentifier(t.currentClassElement.name) &&
                t.currentClassElement.name.text === 'equals' &&
                (node.left.kind === ts.SyntaxKind.ThisKeyword || node.right.kind === ts.SyntaxKind.ThisKeyword)
            ) {
                (bin as cs.BinaryExpression).operator = '===';
            }
            return bin;
        });

        registry.wrap<ts.CallExpression>(ts.SyntaxKind.CallExpression, (base, t, p, node) => {
            const invocation = base(t, p, node);
            if (!invocation) {
                return invocation;
            }
            if (cs.isInvocationExpression(invocation)) {
                const method = t.context.typeChecker.getSymbolAtLocation(node.expression);
                if (method?.name === 'filter' && node.arguments.length === 1 && ts.isArrowFunction(node.arguments[0])) {
                    const body = node.arguments[0].body;
                    if (
                        ts.isBinaryExpression(body) &&
                        body.operatorToken.kind === ts.SyntaxKind.ExclamationEqualsEqualsToken &&
                        ts.isIdentifier(body.left) &&
                        (body.right.kind === ts.SyntaxKind.NullKeyword ||
                            body.right.kind === ts.SyntaxKind.UndefinedKeyword ||
                            (ts.isIdentifier(body.right) &&
                                (body.right.text === 'undefined' || body.right.text === 'null')))
                    ) {
                        (invocation.expression as cs.MemberAccessExpression).member =
                            t.context.toMethodNameCase('filterNotNull');
                        invocation.arguments = [];
                    }
                }
            }
            return invocation;
        });

        registry.wrap<ts.ArrowFunction>(ts.SyntaxKind.ArrowFunction, (base, t, p, node) =>
            _withParameterScope(paramReferences, paramsWithAssignment, () => base(t, p, node))
        );

        registry.wrap<ts.FunctionExpression>(ts.SyntaxKind.FunctionExpression, (base, t, p, node) =>
            _withParameterScope(paramReferences, paramsWithAssignment, () => base(t, p, node))
        );

        registry.wrap<ts.NonNullExpression>(ts.SyntaxKind.NonNullExpression, (_base, t, p, node) => {
            const nonNullExpression = csf.nonNullExpression(p, {} as cs.Expression, node);
            nonNullExpression.expression = t.visitExpression(nonNullExpression, node.expression)!;
            if (!nonNullExpression.expression) {
                return null;
            }
            return nonNullExpression;
        });

        registry.wrap<ts.AsExpression>(ts.SyntaxKind.AsExpression, (base, t, p, node) => {
            if (_isCastToEnum(t, node)) {
                const methodAccess = csf.memberAccess(
                    p,
                    createLazyTypeRef(t.context, null, node.type),
                    'fromValue',
                    node
                );
                const call = csf.invocation(p, methodAccess, [], node);
                const expr = t.visitExpression(call, node.expression);
                if (!expr) {
                    return null;
                }
                call.arguments.push(expr);
                return call;
            }
            if (_isCastFromEnumToNumber(t, node)) {
                const methodAccess = csf.memberAccess(p, null!, 'toDouble', node);
                const expr = t.visitExpression(methodAccess, node.expression);
                if (!expr) {
                    return null;
                }
                methodAccess.expression = expr;
                return csf.invocation(p, methodAccess, [], node);
            }
            return base(t, p, node);
        });

        registry.wrap<ts.Identifier>(ts.SyntaxKind.Identifier, (base, t, p, node) => {
            const result = base(t, p, node) as cs.Node | null;
            const identifier: cs.Identifier | null = result
                ? (_findInner(result, cs.isIdentifier) as cs.Identifier | null)
                : null;

            if (identifier?.tsSymbol?.valueDeclaration && ts.isParameter(identifier.tsSymbol.valueDeclaration)) {
                if (!_isSuperCall(node.parent)) {
                    const currentParamRefs = paramReferences[paramReferences.length - 1];
                    if (currentParamRefs) {
                        if (!currentParamRefs.has(identifier.text)) {
                            currentParamRefs.set(identifier.text, []);
                        }
                        currentParamRefs.get(identifier.text)!.push(identifier);
                    }
                }
            }
            return result;
        });

        registry.wrap<ts.PropertyAccessExpression>(ts.SyntaxKind.PropertyAccessExpression, (base, t, p, node) => {
            // Kotlin getSymbolName overrides
            const result = base(t, p, node) as cs.Node | null;
            if (!result) {
                return result;
            }

            // The base C# handler may wrap the member access in a smart-cast
            // tree (Parenthesized/Cast/Invocation). Unwrap to find the actual
            // MemberAccessExpression so we can fix the Kotlin name.
            const memberAccess = _findInnerMemberAccess(result);
            if (!memberAccess || !memberAccess.tsSymbol) {
                return result;
            }

            // Use the same parentSymbol resolution as the C# visitPropertyAccessExpression:
            // prefer tsSymbol.parent (the direct parent type symbol), fall back to
            // property-declaration parentage.  This correctly resolves through non-null
            // assertions (s!!) and other transparent wrapper expressions where
            // getSymbolAtLocation(node.expression) can return null or the wrong symbol.
            let parentSymbol = (memberAccess.tsSymbol as any).parent as ts.Symbol | undefined;
            if (!parentSymbol) {
                const propertyDeclaration = memberAccess.tsSymbol.declarations?.find(
                    d => ts.isPropertyDeclaration(d) || ts.isPropertySignature(d)
                );
                if (propertyDeclaration) {
                    parentSymbol =
                        propertyDeclaration.parent &&
                        (ts.isClassLike(propertyDeclaration.parent) ||
                            ts.isInterfaceDeclaration(propertyDeclaration.parent))
                            ? t.context.typeChecker.getSymbolAtLocation(propertyDeclaration.parent.name!)
                            : undefined;
                }
            }

            if (parentSymbol) {
                const renamed = _getSymbolName(parentSymbol, memberAccess.tsSymbol);
                if (renamed !== null) {
                    memberAccess.member = renamed;
                } else {
                    // _getSymbolName returned null → no Kotlin-specific rename.
                    // Restore the Kotlin-appropriate default for the original TS name
                    // instead of keeping whatever the C# handler set (PascalCase).
                    if (t.context.isMethodSymbol(memberAccess.tsSymbol)) {
                        memberAccess.member = t.context.buildMethodName(node.name);
                    } else if (t.context.isPropertySymbol(memberAccess.tsSymbol)) {
                        memberAccess.member = t.context.toPropertyNameCase(node.name.text);
                    } else if (!(memberAccess.tsSymbol.flags & ts.SymbolFlags.EnumMember)) {
                        memberAccess.member = t.context.toPropertyNameCase(node.name.text);
                    }
                }
                // convertPropertyToInvocation: Kotlin always returns false (same as C#)
            }
            return result;
        });

        // ── Statement wraps ───────────────────────────────────────────────────

        registry.wrap<ts.ExpressionStatement>(ts.SyntaxKind.ExpressionStatement, (base, t, p, node) => {
            if (
                ts.isBinaryExpression(node.expression) &&
                ts.isArrayLiteralExpression(node.expression.left) &&
                node.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken
            ) {
                const invoc: cs.InvocationExpression = {
                    nodeType: cs.SyntaxKind.InvocationExpression,
                    parent: p,
                    expression: null!,
                    tsNode: node,
                    arguments: []
                };
                const letAccess: cs.MemberAccessExpression = {
                    nodeType: cs.SyntaxKind.MemberAccessExpression,
                    expression: null!,
                    member: 'let',
                    parent: invoc
                };
                letAccess.expression = t.visitExpression(invoc, node.expression.right)!;
                invoc.expression = letAccess;
                const block: cs.Block = { nodeType: cs.SyntaxKind.Block, parent: invoc, statements: [] };
                for (let i = 0; i < node.expression.left.elements.length; i++) {
                    const stmt: cs.ExpressionStatement = {
                        nodeType: cs.SyntaxKind.ExpressionStatement,
                        parent: block,
                        expression: null!
                    };
                    block.statements.push(stmt);
                    const assign: cs.BinaryExpression = {
                        nodeType: cs.SyntaxKind.BinaryExpression,
                        parent: block,
                        left: null!,
                        right: null!,
                        operator: '='
                    };
                    stmt.expression = assign;
                    assign.left = t.visitExpression(assign, node.expression.left.elements[i])!;
                    assign.right = {
                        nodeType: cs.SyntaxKind.Identifier,
                        text: `it.v${i}`,
                        parent: assign
                    } as cs.Identifier;
                }
                invoc.arguments.push(block);
                const result: cs.ExpressionStatement = {
                    nodeType: cs.SyntaxKind.ExpressionStatement,
                    expression: invoc,
                    parent: p
                };
                invoc.parent = result;
                return result;
            }
            return base(t, p, node);
        });

        // Record-shaped classes need Kotlin-specific property fixups
        // (override flag, default initializer) that `RecordPostProcessPass`
        // applies after `ResolveTypesPass`. Doing the work mid-transform
        // would force-resolve cross-file interface refs prematurely and
        // bake the wrong namespace into the IR.

        registry.wrap<ts.FunctionDeclaration>(ts.SyntaxKind.FunctionDeclaration, (base, t, p, node) =>
            _withParameterScope(
                paramReferences,
                paramsWithAssignment,
                () => base(t, p, node) as cs.LocalFunctionDeclaration,
                fun => {
                    if (fun?.body) {
                        _injectParametersAsLocal(paramsWithAssignment, paramReferences, fun.body as cs.Block);
                    }
                }
            )
        );

        // ── Class element wraps ───────────────────────────────────────────────

        registry.wrap<ts.MethodSignature>(ts.SyntaxKind.MethodSignature, (base, t, p, node) => {
            base(t, p, node);
            // Parent is either a ClassDeclaration or an InterfaceDeclaration —
            // both expose `members`. The method may have been skipped, so
            // verify the last member actually corresponds to this signature.
            const parentDecl = p as unknown as { members: cs.Node[] };
            const last = parentDecl.members[parentDecl.members.length - 1] as cs.MethodDeclaration | undefined;
            if (last && last.tsNode === node && hasTag(node as unknown as ts.MethodSignature, JsDocTag.async)) {
                last.isAsync = true;
            }
            return null;
        });

        registry.wrap<ts.GetAccessorDeclaration>(ts.SyntaxKind.GetAccessor, (base, t, p, node) => {
            _withParameterScope(paramReferences, paramsWithAssignment, () => base(t, p, node));
            return null;
        });

        registry.wrap<ts.SetAccessorDeclaration>(ts.SyntaxKind.SetAccessor, (base, t, p, node) => {
            _withParameterScope(
                paramReferences,
                paramsWithAssignment,
                () => base(t, p, node),
                () => {
                    const csClass = p as unknown as cs.ClassDeclaration;
                    const prop = csClass.members[csClass.members.length - 1] as cs.PropertyDeclaration;
                    _injectIntoBlockBody(paramsWithAssignment, paramReferences, prop.setAccessor);
                }
            );
            return null;
        });

        registry.wrap<ts.ConstructorDeclaration>(ts.SyntaxKind.Constructor, (base, t, p, node) => {
            _withParameterScope(
                paramReferences,
                paramsWithAssignment,
                () => base(t, p, node),
                () => {
                    const csClass = p as unknown as cs.ClassDeclaration;
                    const constr = csClass.members[csClass.members.length - 1] as { body?: cs.Block | cs.Expression };
                    _injectIntoBlockBody(paramsWithAssignment, paramReferences, constr);
                }
            );
            return null;
        });

        registry.wrap<ts.MethodDeclaration>(ts.SyntaxKind.MethodDeclaration, (base, t, p, node) => {
            _withParameterScope(
                paramReferences,
                paramsWithAssignment,
                () => base(t, p, node),
                result => {
                    const method = result as cs.MethodDeclaration | undefined;
                    if (!method) {
                        return;
                    }
                    const csClass = method.parent as cs.ClassDeclaration;
                    _injectIntoBlockBody(paramsWithAssignment, paramReferences, method);
                    if (method.skipEmit && method.isOverride && method.partial && !method.isStatic) {
                        method.skipEmit = undefined;
                        csClass.members.push(method);
                        const invoke = {
                            nodeType: cs.SyntaxKind.InvocationExpression,
                            arguments: [],
                            parent: method,
                            expression: null!
                        } as cs.InvocationExpression;
                        const access = {
                            nodeType: cs.SyntaxKind.MemberAccessExpression,
                            member: method.name,
                            parent: invoke,
                            expression: null!
                        } as cs.MemberAccessExpression;
                        invoke.expression = access;
                        const clz = {
                            nodeType: cs.SyntaxKind.Identifier,
                            parent: access,
                            text: `${(csClass.parent as cs.NamespaceDeclaration).namespace}.${csClass.name}Partials`
                        } as cs.Identifier;
                        access.expression = clz;
                        for (const param of method.parameters) {
                            invoke.arguments.push({
                                nodeType: cs.SyntaxKind.Identifier,
                                parent: invoke,
                                text: param.name
                            } as cs.Identifier);
                        }
                        method.body = invoke;
                    }
                }
            );
            return null;
        });

        registry.wrap<ts.PropertyDeclaration>(ts.SyntaxKind.PropertyDeclaration, (base, t, p, node) => {
            base(t, p, node);
            const csClass = p as unknown as cs.ClassDeclaration;
            const prop = csClass.members[csClass.members.length - 1] as cs.PropertyDeclaration;
            // Kotlin applyPropertyOverride variant
            if (
                (csClass as cs.ClassDeclaration).isRecord &&
                (node as unknown as ts.PropertyDeclaration).parent !== csClass.tsNode
            ) {
                prop.isOverride = true;
                if (!(node as unknown as ts.PropertyDeclaration).questionToken && !prop.initializer) {
                    prop.initializer = {
                        nodeType: cs.SyntaxKind.NonNullExpression,
                        parent: prop,
                        expression: { nodeType: cs.SyntaxKind.NullLiteral } as cs.NullLiteral
                    } as cs.NonNullExpression;
                }
            } else {
                Members.applyPropertyOverride(t, prop, node as unknown as ts.PropertyDeclaration);
            }
            if (!prop.initializer && hasTag(node as unknown as ts.PropertyDeclaration, JsDocTag.lateinit)) {
                prop.initializer = {
                    nodeType: cs.SyntaxKind.NonNullExpression,
                    parent: prop,
                    expression: { nodeType: cs.SyntaxKind.NullLiteral } as cs.NullLiteral
                } as cs.NonNullExpression;
            }
            return null;
        });

        // ── Deep overrides (called via state.X in transform modules) ──────────
        // These replace the public override methods that were on KotlinAstTransformer.
        // They patch the transformer instance directly so transform modules calling
        // t.context.X() still get the right behavior.
        // NOTE: getIdentifierName, getSymbolName, convertPropertyToInvocation are
        // baked into the Identifier and PropertyAccessExpression wraps above rather
        // than patched on the transformer.

        // visitTestClass override (adds kotlinx.coroutines.test using)
        registry.wrap<ts.CallExpression>(ts.SyntaxKind.CallExpression, (base, t, p, node) => {
            if (ts.isIdentifier(node.expression) && node.expression.text === 'describe') {
                t.csharpFile.usings.push({
                    nodeType: cs.SyntaxKind.UsingDeclaration,
                    name: 'kotlinx.coroutines.test',
                    parent: t.csharpFile
                } as cs.UsingDeclaration);
            }
            return base(t, p, node);
        });

        _pendingParamState = { paramReferences, paramsWithAssignment };
    },

    postInit(transformer: AstTransformer): void {
        const { paramReferences, paramsWithAssignment } = _pendingParamState!;
        _pendingParamState = null;

        transformer.typeParameterProcessor = (csTypeParameter, p) => {
            // Strip TS `extends object` / `extends {}` constraints — Kotlin
            // type parameters default to `Any?` and the C#-style `where T :
            // class` constraint has no Kotlin equivalent.
            if (p.constraint) {
                const c = p.constraint;
                const constraintText = c.getText().trim();
                if (constraintText === 'object' || constraintText === '{}' || c.kind === ts.SyntaxKind.ObjectKeyword) {
                    csTypeParameter.constraint = undefined;
                    return;
                }
            }
            if (csTypeParameter.constraint && cs.isTypeReference(csTypeParameter.constraint)) {
                const ref = csTypeParameter.constraint.reference;
                if (ref === 'object' || ref === 'class') {
                    csTypeParameter.constraint = undefined;
                }
            }
        };

        transformer.visitTestClassMethodWrapper = (parent, d, base) =>
            _withParameterScope(
                paramReferences,
                paramsWithAssignment,
                () => base(parent, d),
                method => _injectIntoBlockBody(paramsWithAssignment, paramReferences, method)
            );
    }
};

// ── Module-level state for registerHandlers→postInit handoff ─────────────────

let _pendingParamState: {
    paramReferences: Map<string, cs.Identifier[]>[];
    paramsWithAssignment: Set<string>[];
} | null = null;

// ── Module-level helpers (formerly private class methods) ─────────────────────

function _withParameterScope<T>(
    paramReferences: Map<string, cs.Identifier[]>[],
    paramsWithAssignment: Set<string>[],
    visit: () => T,
    afterVisit?: (result: T) => void
): T {
    paramReferences.push(new Map<string, cs.Identifier[]>());
    paramsWithAssignment.push(new Set<string>());
    try {
        const result = visit();
        afterVisit?.(result);
        return result;
    } finally {
        paramReferences.pop();
        paramsWithAssignment.pop();
    }
}

function _injectIntoBlockBody(
    paramsWithAssignment: Set<string>[],
    paramReferences: Map<string, cs.Identifier[]>[],
    node: { body?: cs.Block | cs.Expression } | undefined | null
): void {
    if (node?.body && cs.isBlock(node.body)) {
        _injectParametersAsLocal(paramsWithAssignment, paramReferences, node.body);
    }
}

function _injectParametersAsLocal(
    paramsWithAssignment: Set<string>[],
    paramReferences: Map<string, cs.Identifier[]>[],
    block: cs.Block
): void {
    const localParams: cs.VariableStatement[] = [];
    const currentAssignments = paramsWithAssignment[paramsWithAssignment.length - 1];
    const currentScope = paramReferences[paramReferences.length - 1];
    for (const p of currentAssignments) {
        const renamedP = `param${p}`;
        for (const ident of currentScope.get(p)!) {
            ident.text = renamedP;
        }
        const variableStatement = {
            nodeType: cs.SyntaxKind.VariableStatement,
            parent: block,
            tsNode: block.tsNode,
            declarationList: {} as cs.VariableDeclarationList,
            variableStatementKind: cs.VariableStatementKind.Normal
        } as cs.VariableStatement;
        variableStatement.declarationList = {
            nodeType: cs.SyntaxKind.VariableDeclarationList,
            parent: variableStatement,
            tsNode: block.tsNode,
            declarations: [],
            isConst: false
        } as cs.VariableDeclarationList;
        const declaration = {
            nodeType: cs.SyntaxKind.VariableDeclaration,
            parent: variableStatement.declarationList,
            tsNode: block.tsNode,
            name: renamedP,
            type: null!,
            initializer: { tsNode: block.tsNode, nodeType: cs.SyntaxKind.Identifier, text: p } as cs.Identifier
        } as cs.VariableDeclaration;
        declaration.type = createVarTypeNode(declaration, block.tsNode!);
        declaration.initializer!.parent = declaration;
        variableStatement.declarationList.declarations.push(declaration);
        localParams.push(variableStatement);
    }
    block.statements.unshift(...localParams);
}

function _isSuperCall(parent: ts.Node): boolean {
    return ts.isCallExpression(parent) && parent.expression.kind === ts.SyntaxKind.SuperKeyword;
}

/**
 * Unwrap smart-cast tree wrappers (Parenthesized/Cast/Invocation) emitted by
 * the C# base PropertyAccess handler to reach the underlying MemberAccess.
 * The truthy wrapping is `TypeHelper.isTruthy(Paren(Cast(memberAccess)))`, so
 * Invocation must descend into its first argument, not its callee.
 * Returns null if no MemberAccessExpression can be located.
 */
function _findInnerMemberAccess(node: cs.Node): cs.MemberAccessExpression | null {
    return _findInner(node, cs.isMemberAccessExpression) as cs.MemberAccessExpression | null;
}

function _isCastFromEnumToNumber(t: AstTransformer, expression: ts.AsExpression): boolean {
    const targetType = t.context.typeChecker.getTypeFromTypeNode(expression.type);
    const nonNullable = t.context.typeChecker.getNonNullableType(targetType);
    if (nonNullable.flags === ts.TypeFlags.Number) {
        const sourceType = t.context.typeChecker.getNonNullableType(t.context.getType(expression.expression));
        return !!(sourceType.flags & ts.TypeFlags.Enum || sourceType.flags & ts.TypeFlags.EnumLiteral);
    }
    return false;
}

function _isCastToEnum(t: AstTransformer, expression: ts.AsExpression): boolean {
    const targetType = t.context.typeChecker.getTypeFromTypeNode(expression.type);
    return !!(targetType.flags & ts.TypeFlags.Enum || targetType.flags & ts.TypeFlags.EnumLiteral);
}

function _getSymbolName(parentSymbol: ts.Symbol, symbol: ts.Symbol): string | null {
    switch (parentSymbol.name) {
        case 'String':
            switch (symbol.name) {
                case 'length':
                    return 'length.toDouble()';
                case 'includes':
                    return 'contains';
                case 'indexOf':
                    return 'indexOfInDouble';
                case 'lastIndexOf':
                    return 'lastIndexOfInDouble';
                case 'trimRight':
                    return 'trimEnd';
                case 'toLowerCase':
                    return 'lowercase';
                case 'toUpperCase':
                    return 'uppercase';
                case 'split':
                    return 'splitBy';
            }
            break;
        case 'Number':
            switch (symbol.name) {
                case 'toString':
                    return 'toInvariantString';
            }
            break;
    }
    return null;
}

/**
 * Unwrap smart-cast tree wrappers (Parenthesized/Cast/Invocation) emitted by
 * the C# base handler to reach the underlying node of interest.
 * The truthy wrapping is `TypeHelper.isTruthy(Paren(Cast(memberAccess)))`, so
 * Invocation must descend into its first argument, not its callee.
 * Returns null if no MemberAccessExpression can be located.
 */
function _findInner(node: cs.Node, predicate: (child: cs.Node) => boolean): cs.Node | null {
    let current: cs.Node | undefined = node;
    while (current) {
        if (predicate(current)) {
            return current;
        }
        if (current.nodeType === cs.SyntaxKind.ParenthesizedExpression) {
            current = (current as cs.ParenthesizedExpression).expression;
            continue;
        }
        if (current.nodeType === cs.SyntaxKind.CastExpression) {
            current = (current as cs.CastExpression).expression;
            continue;
        }
        if (current.nodeType === cs.SyntaxKind.NonNullExpression) {
            current = (current as cs.NonNullExpression).expression;
            continue;
        }
        if (current.nodeType === cs.SyntaxKind.InvocationExpression) {
            const inv = current as cs.InvocationExpression;
            // Smart cast wraps the access in TypeHelper.isTruthy(<access>).
            // Descend into the first argument; if none, fall through.
            if (inv.arguments && inv.arguments.length > 0) {
                current = inv.arguments[0];
                continue;
            }
            return null;
        }
        return null;
    }
    return null;
}
