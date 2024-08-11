import * as ts from 'typescript';
import * as cs from '../csharp/CSharpAst';
import * as path from 'path';
import CSharpEmitterContext from '../csharp/CSharpEmitterContext';
import CSharpAstTransformer from '../csharp/CSharpAstTransformer';

export default class KotlinAstTransformer extends CSharpAstTransformer {
    public constructor(typeScript: ts.SourceFile, context: CSharpEmitterContext) {
        super(typeScript, context);
        this._testClassAttribute = '';
        this._testMethodAttribute = 'Test';
    }

    public override get extension(): string {
        return '.kt';
    }

    public override get targetTag(): string {
        return 'kotlin';
    }

    private _paramReferences: Map<string, cs.Identifier[]>[] = [];
    private _paramsWithAssignment: Set<string>[] = [];

    private getMethodLocalParameterName(name: string) {
        return 'param' + name;
    }

    protected override buildFileName(fileName: string, context: CSharpEmitterContext): string {
        let parts = this.removeExtension(fileName).split(path.sep);
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

        const preUnwrapped = pre && cs.isCastExpression(pre)
            ? (pre.expression as cs.PrefixUnaryExpression)
            : (pre as cs.PrefixUnaryExpression);

        if (preUnwrapped) {
            switch (preUnwrapped.operator) {
                case '++':
                case '--':
                    const op = this._context.typeChecker.getSymbolAtLocation(expression.operand);
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
                    const op = this._context.typeChecker.getSymbolAtLocation(expression.operand);
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
            const left = this._context.typeChecker.getSymbolAtLocation(expression.left);
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
            this._currentClassElement?.name &&
            ts.isIdentifier(this._currentClassElement.name) &&
            this._currentClassElement.name.text === 'equals' &&
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
        let localParams: cs.VariableStatement[] = [];

        let currentAssignments = this._paramsWithAssignment[this._paramsWithAssignment.length - 1];
        let currentScope = this._paramReferences[this._paramReferences.length - 1];
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

            let declaration = {
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
        if (invocation && cs.isInvocationExpression(invocation)) {
            const returnType = this._context.typeChecker.getTypeAtLocation(expression);
            const method = this._context.typeChecker.getSymbolAtLocation(expression.expression);

            if (returnType?.symbol?.name === "Promise" 
                && (method as any)?.parent?.name !== 'Promise'
                && !ts.isAwaitExpression(expression.parent)) {
                const suspendToDeferred = {
                    nodeType: cs.SyntaxKind.InvocationExpression,
                } as cs.InvocationExpression;

                suspendToDeferred.expression = this.makeMemberAccess(
                    suspendToDeferred,
                    this._context.makeTypeName('alphaTab.core.TypeHelper'),
                    this._context.toMethodName('suspendToDeferred')
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

    protected override getSymbolName(
        parentSymbol: ts.Symbol,
        symbol: ts.Symbol,
        expression: cs.Expression
    ): string | null {
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

            let expr = this.visitExpression(call, expression.expression);
            if (!expr) {
                return null;
            }
            call.arguments.push(expr);

            return call;
        } else if (this.isCastFromEnumToNumber(expression)) {
            const methodAccess = {
                nodeType: cs.SyntaxKind.MemberAccessExpression,
                parent: parent,
                expression: null!,
                member: 'toDouble',
                tsNode: expression
            } as cs.MemberAccessExpression;

            let expr = this.visitExpression(methodAccess, expression.expression);
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
        } else {
            return super.visitAsExpression(parent, expression);
        }
    }

    private isCastFromEnumToNumber(expression: ts.AsExpression) {
        let targetType = this._context.typeChecker.getTypeFromTypeNode(expression.type);
        let nonNullable = this._context.typeChecker.getNonNullableType(targetType);
        if (nonNullable.flags === ts.TypeFlags.Number) {
            let sourceType = this._context.typeChecker.getNonNullableType(this._context.getType(expression.expression));
            return sourceType.flags & ts.TypeFlags.Enum || sourceType.flags & ts.TypeFlags.EnumLiteral;
        }
        return false;
    }
    private isCastToEnum(expression: ts.AsExpression) {
        let targetType = this._context.typeChecker.getTypeFromTypeNode(expression.type);
        return targetType.flags & ts.TypeFlags.Enum || targetType.flags & ts.TypeFlags.EnumLiteral;
    }

    protected override createMapEntry(parent: cs.Node, expression: ts.ArrayLiteralExpression): cs.Expression {
        const csExpr = {
            parent: parent,
            tsNode: expression,
            nodeType: cs.SyntaxKind.InvocationExpression,
            arguments: [],
            expression: {} as cs.Expression
        } as cs.InvocationExpression;

        const type: cs.TypeReference = {
            nodeType: cs.SyntaxKind.TypeReference,
            parent: csExpr,
            reference: '',
            isAsync: false,
            tsNode: expression
        };

        type.reference = 'MapEntry';
        if (expression.elements.length === 2) {
            const keyType = this._context.getType(expression.elements[0]);
            let keyTypeContainerName = this.getContainerTypeName(keyType);

            const valueType = this._context.getType(expression.elements[1]);
            let valueTypeContainerName = this.getContainerTypeName(valueType);

            if (!keyTypeContainerName) {
                type.typeArguments = type.typeArguments ?? [];
                type.typeArguments.push({
                    nodeType: cs.SyntaxKind.TypeReference,
                    isAsync: false,
                    parent: type,
                    reference: this.createUnresolvedTypeNode(type, expression.elements[0], keyType)
                } as cs.TypeReference);
            }

            if (!valueTypeContainerName) {
                type.typeArguments = type.typeArguments ?? [];
                type.typeArguments.push({
                    nodeType: cs.SyntaxKind.TypeReference,
                    isAsync: false,
                    parent: type,
                    reference: this.createUnresolvedTypeNode(type, expression.elements[1], valueType)
                } as cs.TypeReference);
            }

            if (keyTypeContainerName || valueTypeContainerName) {
                keyTypeContainerName = keyTypeContainerName || 'Object';
                valueTypeContainerName = valueTypeContainerName || 'Object';
                type.reference = keyTypeContainerName + valueTypeContainerName + type.reference;
            }
        }

        type.reference = this._context.makeTypeName(`alphaTab.collections.${type.reference}`);
        csExpr.expression = type;

        expression.elements.forEach(e => {
            const ex = this.visitExpression(csExpr, e);
            if (ex) {
                csExpr.arguments.push(ex);
            }
        });

        return csExpr;
    }

    override visitTestClass(d: ts.CallExpression): void {
        this._csharpFile.usings.push({
            nodeType: cs.SyntaxKind.UsingDeclaration,
            namespaceOrTypeName: 'kotlinx.coroutines.test',
            parent: this._csharpFile
        } as cs.UsingDeclaration);
        super.visitTestClass(d);
    }

    private getContainerTypeName(tsType: ts.Type): string | null {
        if (this._context.isNullableType(tsType)) {
            return null;
        }
        if (
            (tsType.flags & ts.TypeFlags.Enum) !== 0 ||
            (tsType.flags & ts.TypeFlags.EnumLike) !== 0 ||
            (tsType.flags & ts.TypeFlags.EnumLiteral) !== 0
        ) {
            return null;
        }
        if ((tsType.flags & ts.TypeFlags.Number) !== 0 || (tsType.flags & ts.TypeFlags.NumberLiteral) !== 0) {
            return 'Double';
        }
        if ((tsType.flags & ts.TypeFlags.Boolean) !== 0 || (tsType.flags & ts.TypeFlags.BooleanLiteral) !== 0) {
            return 'Boolean';
        }
        return null;
    }
}