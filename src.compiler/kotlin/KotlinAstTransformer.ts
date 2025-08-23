import ts from 'typescript';
import * as cs from '../csharp/CSharpAst';
import path from 'node:path';
import type CSharpEmitterContext from '../csharp/CSharpEmitterContext';
import CSharpAstTransformer from '../csharp/CSharpAstTransformer';
import type KotlinEmitterContext from './KotlinEmitterContext';

export default class KotlinAstTransformer extends CSharpAstTransformer {
    protected override context: KotlinEmitterContext;
    public constructor(typeScript: ts.SourceFile, context: KotlinEmitterContext) {
        super(typeScript, context);
        this.testClassAttribute = '';
        this.testMethodAttribute = 'TestName';
        this.snapshotFileAttribute = 'SnapshotFile';
        this.deprecatedAttributeName = 'kotlin.Deprecated';

        this.context = context;
    }

    public override get extension(): string {
        return '.kt';
    }

    private _paramReferences: Map<string, cs.Identifier[]>[] = [];
    private _paramsWithAssignment: Set<string>[] = [];

    private getMethodLocalParameterName(name: string) {
        return `param${name}`;
    }

    protected override visitMethodSignature(
        parent: cs.ClassDeclaration | cs.InterfaceDeclaration,
        classElement: ts.MethodSignature
    ) {
        const csMethod = super.visitMethodSignature(parent, classElement);

        if (ts.getJSDocTags(classElement).find(t => t.tagName.text === 'async')) {
            csMethod.isAsync = true;
        }

        return csMethod;
    }

    protected override buildFileName(fileName: string, context: CSharpEmitterContext): string {
        const parts = this.removeExtension(fileName).split(path.sep);
        if (parts.length > 0) {
            switch (parts[0]) {
                case 'src':
                    parts[0] = path.join('commonMain', 'generated');
                    break;
                case 'test':
                    parts[0] = path.join('commonTest', 'generated');
                    break;
            }
        }

        return path.join(context.compilerOptions.outDir!, parts.join(path.sep) + this.extension);
    }

    protected override getIdentifierName(identifier: cs.Identifier, expression: ts.Identifier): string {
        const paramName = super.getIdentifierName(identifier, expression);
        if (
            identifier.tsSymbol &&
            identifier.tsSymbol.valueDeclaration &&
            ts.isParameter(identifier.tsSymbol.valueDeclaration) &&
            !this.isSuperCall(expression.parent)
        ) {
            // TODO: proper scope handling here, first register all parameters when
            // a new scope is started,
            // and here register all identifier usages.
            const currentParamRefs = this._paramReferences[this._paramReferences.length - 1];
            if (currentParamRefs) {
                if (!currentParamRefs.has(paramName)) {
                    currentParamRefs.set(paramName, []);
                }
                currentParamRefs.get(paramName)!.push(identifier);
            }
        }

        return paramName;
    }

    protected override visitPrefixUnaryExpression(parent: cs.Node, expression: ts.PrefixUnaryExpression) {
        const pre = super.visitPrefixUnaryExpression(parent, expression);

        const preUnwrapped =
            pre && cs.isCastExpression(pre)
                ? (pre.expression as cs.PrefixUnaryExpression)
                : (pre as cs.PrefixUnaryExpression);

        if (preUnwrapped) {
            switch (preUnwrapped.operator) {
                case '++':
                case '--':
                    const op = this.context.typeChecker.getSymbolAtLocation(expression.operand);
                    if (op?.valueDeclaration && op.valueDeclaration.kind === ts.SyntaxKind.Parameter) {
                        this._paramsWithAssignment[this._paramsWithAssignment.length - 1].add(op.name);
                    }
                    break;
            }
        }
        return pre;
    }

    protected override visitPostfixUnaryExpression(parent: cs.Node, expression: ts.PostfixUnaryExpression) {
        const post = super.visitPostfixUnaryExpression(parent, expression);
        if (post) {
            switch (post.operator) {
                case '++':
                case '--':
                    const op = this.context.typeChecker.getSymbolAtLocation(expression.operand);
                    if (op?.valueDeclaration && op.valueDeclaration.kind === ts.SyntaxKind.Parameter) {
                        this._paramsWithAssignment[this._paramsWithAssignment.length - 1].add(op.name);
                    }
                    break;
            }
        }
        return post;
    }

    protected override visitBinaryExpression(parent: cs.Node, expression: ts.BinaryExpression) {
        const bin = super.visitBinaryExpression(parent, expression);
        // detect parameter assignment
        if (
            expression.operatorToken.kind === ts.SyntaxKind.EqualsToken ||
            expression.operatorToken.kind === ts.SyntaxKind.PlusEqualsToken ||
            expression.operatorToken.kind === ts.SyntaxKind.MinusEqualsToken ||
            expression.operatorToken.kind === ts.SyntaxKind.AsteriskEqualsToken ||
            expression.operatorToken.kind === ts.SyntaxKind.GreaterThanGreaterThanEqualsToken ||
            expression.operatorToken.kind === ts.SyntaxKind.LessThanLessThanEqualsToken ||
            expression.operatorToken.kind === ts.SyntaxKind.SlashEqualsToken
        ) {
            const left = this.context.typeChecker.getSymbolAtLocation(expression.left);
            if (left?.valueDeclaration && left.valueDeclaration.kind === ts.SyntaxKind.Parameter) {
                this._paramsWithAssignment[this._paramsWithAssignment.length - 1].add(left.name);
            }
        }

        // a == this or this == a
        // within an equals method needs to have the operator ===

        if (
            bin &&
            cs.isBinaryExpression(bin) &&
            (expression.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken ||
                expression.operatorToken.kind === ts.SyntaxKind.EqualsEqualsToken) &&
            this.currentClassElement?.name &&
            ts.isIdentifier(this.currentClassElement.name) &&
            this.currentClassElement.name.text === 'equals' &&
            (expression.left.kind === ts.SyntaxKind.ThisKeyword || expression.right.kind === ts.SyntaxKind.ThisKeyword)
        ) {
            (bin as cs.BinaryExpression).operator = '===';
        }

        return bin;
    }

    private isSuperCall(parent: ts.Node): boolean {
        return ts.isCallExpression(parent) && parent.expression.kind === ts.SyntaxKind.SuperKeyword;
    }

    private injectParametersAsLocal(block: cs.Block) {
        const localParams: cs.VariableStatement[] = [];

        const currentAssignments = this._paramsWithAssignment[this._paramsWithAssignment.length - 1];
        const currentScope = this._paramReferences[this._paramReferences.length - 1];
        for (const p of currentAssignments) {
            const renamedP = this.getMethodLocalParameterName(p);

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
                initializer: {
                    tsNode: block.tsNode,
                    nodeType: cs.SyntaxKind.Identifier,
                    text: p
                } as cs.Identifier
            } as cs.VariableDeclaration;

            declaration.type = this.createVarTypeNode(declaration, block.tsNode!);
            declaration.initializer!.parent = declaration;

            variableStatement.declarationList.declarations.push(declaration);

            localParams.push(variableStatement);
        }

        block.statements.unshift(...localParams);
    }

    protected override visitGetAccessor(parent: cs.ClassDeclaration, classElement: ts.GetAccessorDeclaration) {
        this._paramReferences.push(new Map<string, cs.Identifier[]>());
        this._paramsWithAssignment.push(new Set<string>());

        const el = super.visitGetAccessor(parent, classElement);

        this._paramReferences.pop();
        this._paramsWithAssignment.pop();

        return el;
    }

    protected override visitSetAccessor(parent: cs.ClassDeclaration, classElement: ts.SetAccessorDeclaration) {
        this._paramReferences.push(new Map<string, cs.Identifier[]>());
        this._paramsWithAssignment.push(new Set<string>());

        const el = super.visitSetAccessor(parent, classElement);
        if (el.body && cs.isBlock(el.body)) {
            this.injectParametersAsLocal(el.body);
        }

        this._paramReferences.pop();
        this._paramsWithAssignment.pop();

        return el;
    }

    override visitCallExpression(parent: cs.Node, expression: ts.CallExpression) {
        const invocation = super.visitCallExpression(parent, expression);

        // For Kotlin we generate async functions as "suspend" functions
        // and await expressions are normal method calls.
        // this is a problem when we want to use the raw Promise like  asyncFunction().then().catch()
        // The following code wraps the code to a "alphaTab.core.TypeHelper.suspendToDeferred({ asyncFunction() }).then().catch()

        // similarly in reverse cases, when we have suspend function calling a method which returns a Deferred directly (e.g. on async interface methods)
        // then we call .await()
        if (invocation && cs.isInvocationExpression(invocation)) {
            const returnType = this.context.typeChecker.getTypeAtLocation(expression);
            const method = this.context.typeChecker.getSymbolAtLocation(expression.expression);

            if (returnType?.symbol?.name === 'Promise' && (method as any)?.parent?.name !== 'Promise') {
                const isSuspend =
                    method?.valueDeclaration &&
                    ((method.valueDeclaration as ts.MethodDeclaration).modifiers?.some(
                        m => m.kind === ts.SyntaxKind.AsyncKeyword
                    ) ||
                        ts.getJSDocTags(method.valueDeclaration!).find(t => t.tagName.text === 'async'));

                if (!ts.isAwaitExpression(expression.parent) && isSuspend) {
                    const suspendToDeferred = {
                        nodeType: cs.SyntaxKind.InvocationExpression
                    } as cs.InvocationExpression;

                    suspendToDeferred.expression = this.makeMemberAccess(
                        suspendToDeferred,
                        this.context.makeTypeName('alphaTab.core.TypeHelper'),
                        this.context.toMethodName('suspendToDeferred')
                    );

                    suspendToDeferred.arguments = [
                        {
                            nodeType: cs.SyntaxKind.LambdaExpression,
                            parameters: [] as cs.ParameterDeclaration[],
                            body: invocation,
                            parent: suspendToDeferred,
                            returnType: {
                                nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                                type: cs.PrimitiveType.Void
                            } as cs.PrimitiveTypeNode
                        } as cs.LambdaExpression
                    ];

                    return suspendToDeferred;
                }

                if (ts.isAwaitExpression(expression.parent) && !isSuspend) {
                    const deferredToSuspend = {
                        nodeType: cs.SyntaxKind.InvocationExpression
                    } as cs.InvocationExpression;

                    deferredToSuspend.expression = {
                        expression: invocation,
                        member: 'await',
                        parent: parent,
                        nodeType: cs.SyntaxKind.MemberAccessExpression
                    } as cs.MemberAccessExpression;

                    deferredToSuspend.arguments = [];

                    return deferredToSuspend;
                }
            }
        }

        return invocation;
    }

    protected override visitConstructorDeclaration(
        parent: cs.ClassDeclaration,
        classElement: ts.ConstructorDeclaration
    ) {
        this._paramReferences.push(new Map<string, cs.Identifier[]>());
        this._paramsWithAssignment.push(new Set<string>());

        const constr = super.visitConstructorDeclaration(parent, classElement);

        if (constr.body && cs.isBlock(constr.body)) {
            this.injectParametersAsLocal(constr.body);
        }

        this._paramReferences.pop();
        this._paramsWithAssignment.pop();

        return constr;
    }

    protected override visitArrowExpression(parent: cs.Node, expression: ts.ArrowFunction) {
        this._paramReferences.push(new Map<string, cs.Identifier[]>());
        this._paramsWithAssignment.push(new Set<string>());

        const func = super.visitArrowExpression(parent, expression);

        this._paramReferences.pop();
        this._paramsWithAssignment.pop();

        return func;
    }

    protected override visitFunctionExpression(parent: cs.Node, expression: ts.FunctionExpression) {
        this._paramReferences.push(new Map<string, cs.Identifier[]>());
        this._paramsWithAssignment.push(new Set<string>());

        const func = super.visitFunctionExpression(parent, expression);

        this._paramReferences.pop();
        this._paramsWithAssignment.pop();

        return func;
    }

    protected override visitTestClassMethod(parent: cs.ClassDeclaration, d: ts.FunctionDeclaration) {
        this._paramReferences.push(new Map<string, cs.Identifier[]>());
        this._paramsWithAssignment.push(new Set<string>());

        const method = super.visitTestClassMethod(parent, d);

        if (method.body && cs.isBlock(method.body)) {
            this.injectParametersAsLocal(method.body);
        }

        this._paramReferences.pop();
        this._paramsWithAssignment.pop();

        return method;
    }

    protected override visitMethodDeclaration(
        parent: cs.ClassDeclaration | cs.InterfaceDeclaration,
        classElement: ts.MethodDeclaration
    ) {
        this._paramReferences.push(new Map<string, cs.Identifier[]>());
        this._paramsWithAssignment.push(new Set<string>());

        const method = super.visitMethodDeclaration(parent, classElement);

        if (method.body && cs.isBlock(method.body)) {
            this.injectParametersAsLocal(method.body);
        }

        this._paramReferences.pop();
        this._paramsWithAssignment.pop();

        return method;
    }

    protected visitFunctionDeclaration(
        parent: cs.Node,
        expression: ts.FunctionDeclaration
    ): cs.LocalFunctionDeclaration {
        this._paramReferences.push(new Map<string, cs.Identifier[]>());
        this._paramsWithAssignment.push(new Set<string>());

        const fun = super.visitFunctionDeclaration(parent, expression);

        if (fun.body) {
            this.injectParametersAsLocal(fun.body);
        }

        this._paramReferences.pop();
        this._paramsWithAssignment.pop();

        return fun;
    }

    protected override getSymbolName(parentSymbol: ts.Symbol, symbol: ts.Symbol): string | null {
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

    protected override visitNonNullExpression(parent: cs.Node, expression: ts.NonNullExpression) {
        const nonNullExpression = {
            expression: {} as cs.Expression,
            parent: parent,
            tsNode: expression,
            nodeType: cs.SyntaxKind.NonNullExpression
        } as cs.NonNullExpression;

        nonNullExpression.expression = this.visitExpression(nonNullExpression, expression.expression)!;
        if (!nonNullExpression.expression) {
            return null;
        }

        return nonNullExpression;
    }

    protected override visitAsExpression(parent: cs.Node, expression: ts.AsExpression): cs.Expression | null {
        if (this.isCastToEnum(expression)) {
            const methodAccess = {
                nodeType: cs.SyntaxKind.MemberAccessExpression,
                parent: parent,
                expression: this.createUnresolvedTypeNode(null, expression.type),
                member: 'fromValue',
                tsNode: expression
            } as cs.MemberAccessExpression;

            const call = {
                nodeType: cs.SyntaxKind.InvocationExpression,
                parent: parent,
                expression: methodAccess,
                tsNode: expression,
                arguments: []
            } as cs.InvocationExpression;

            const expr = this.visitExpression(call, expression.expression);
            if (!expr) {
                return null;
            }
            call.arguments.push(expr);

            return call;
        }

        if (this.isCastFromEnumToNumber(expression)) {
            const methodAccess = {
                nodeType: cs.SyntaxKind.MemberAccessExpression,
                parent: parent,
                expression: null!,
                member: 'toDouble',
                tsNode: expression
            } as cs.MemberAccessExpression;

            const expr = this.visitExpression(methodAccess, expression.expression);
            if (!expr) {
                return null;
            }
            methodAccess.expression = expr;
            const call = {
                nodeType: cs.SyntaxKind.InvocationExpression,
                parent: parent,
                expression: methodAccess,
                tsNode: expression,
                arguments: []
            } as cs.InvocationExpression;

            return call;
        }
        return super.visitAsExpression(parent, expression);
    }

    private isCastFromEnumToNumber(expression: ts.AsExpression) {
        const targetType = this.context.typeChecker.getTypeFromTypeNode(expression.type);
        const nonNullable = this.context.typeChecker.getNonNullableType(targetType);
        if (nonNullable.flags === ts.TypeFlags.Number) {
            const sourceType = this.context.typeChecker.getNonNullableType(this.context.getType(expression.expression));
            return sourceType.flags & ts.TypeFlags.Enum || sourceType.flags & ts.TypeFlags.EnumLiteral;
        }
        return false;
    }
    private isCastToEnum(expression: ts.AsExpression) {
        const targetType = this.context.typeChecker.getTypeFromTypeNode(expression.type);
        return targetType.flags & ts.TypeFlags.Enum || targetType.flags & ts.TypeFlags.EnumLiteral;
    }

    override visitTestClass(d: ts.CallExpression): void {
        this.csharpFile.usings.push({
            nodeType: cs.SyntaxKind.UsingDeclaration,
            namespaceOrTypeName: 'kotlinx.coroutines.test',
            parent: this.csharpFile
        } as cs.UsingDeclaration);
        super.visitTestClass(d);
    }

    protected override convertPropertyToInvocation(parentSymbol: ts.Symbol, symbol: ts.Symbol): boolean {
        switch (parentSymbol.name) {
            // chai assertions
            case 'Assertion':
                return true;
        }
        return false;
    }

    protected applyMethodOverride(csMethod: cs.MethodDeclaration, classElement: ts.MethodDeclaration) {
        super.applyMethodOverride(csMethod, classElement);
        if (!csMethod.isOverride) {
            if (
                ts.isComputedPropertyName(classElement.name) &&
                classElement.name.getText().includes('Symbol.dispose')
            ) {
                csMethod.isOverride = true;
            }
        }
    }

    protected visitExpressionStatement(parent: cs.Node, s: ts.ExpressionStatement): cs.Statement | null {
        // array tuple destruction

        // (x,y) = someCallOrExpression()
        // becomes
        // someCallOrExpression.let({ x = it.v0; y = it.v1 })

        if (
            ts.isBinaryExpression(s.expression) &&
            ts.isArrayLiteralExpression(s.expression.left) &&
            s.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken
        ) {
            const invoc: cs.InvocationExpression = {
                nodeType: cs.SyntaxKind.InvocationExpression,
                parent,
                expression: null!,
                tsNode: s,
                arguments: []
            };
            const letAccess: cs.MemberAccessExpression = {
                nodeType: cs.SyntaxKind.MemberAccessExpression,
                expression: null!,
                member: 'let',
                parent: invoc
            };
            letAccess.expression = this.visitExpression(invoc, s.expression.right)!;
            invoc.expression = letAccess;

            const block: cs.Block = {
                nodeType: cs.SyntaxKind.Block,
                parent: invoc,
                statements: []
            };

            for (let i = 0; i < s.expression.left.elements.length; i++) {
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

                assign.left = this.visitExpression(assign, s.expression.left.elements[i])!;
                assign.right = {
                    nodeType: cs.SyntaxKind.Identifier,
                    text: `it.v${i}`,
                    parent: assign
                } as cs.Identifier;
            }

            invoc.arguments.push(block);

            const stmt: cs.ExpressionStatement = {
                nodeType: cs.SyntaxKind.ExpressionStatement,
                expression: invoc,
                parent
            };
            invoc.parent = stmt;
            return stmt;
        }

        return super.visitExpressionStatement(parent, s);
    }

    protected visitPropertyDeclaration(
        parent: cs.ClassDeclaration | cs.InterfaceDeclaration,
        classElement: ts.PropertyDeclaration
    ) {
        const prop = super.visitPropertyDeclaration(parent, classElement);
        if (!prop.initializer && ts.getJSDocTags(classElement).some(e => e.tagName.text === 'lateinit')) {
            prop.initializer = {
                nodeType: cs.SyntaxKind.NonNullExpression,
                expression: {
                    nodeType: cs.SyntaxKind.NullLiteral
                } as cs.NullLiteral
            } as cs.NonNullExpression;
        }
        return prop;
    }
}
