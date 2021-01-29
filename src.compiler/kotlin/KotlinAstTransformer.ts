import * as ts from 'typescript';
import * as cs from '../csharp/CSharpAst';
import * as path from 'path';
import CSharpEmitterContext from '../csharp/CSharpEmitterContext';
import CSharpAstTransformer from '../csharp/CSharpAstTransformer';

export default class KotlinAstTransformer extends CSharpAstTransformer {
    public constructor(typeScript: ts.SourceFile, context: CSharpEmitterContext) {
        super(typeScript, context);
    }

    private getMethodLocalParameterName(name: string) {
        return "param" + name;
    }

    protected getIdentifierName(identifier: cs.Identifier, expression: ts.Identifier): string {
        if (identifier.tsSymbol &&
            identifier.tsSymbol.valueDeclaration &&
            ts.isParameter(identifier.tsSymbol.valueDeclaration) &&
            !this.isSuperCall(expression.parent)) {
            return this.getMethodLocalParameterName(super.getIdentifierName(identifier, expression));
        }
        return super.getIdentifierName(identifier, expression);
    }

    private isSuperCall(parent: ts.Node): boolean {
        return ts.isCallExpression(parent) && parent.expression.kind === ts.SyntaxKind.SuperKeyword;
    }

    private injectParametersAsLocal(parameters: cs.ParameterDeclaration[], block: cs.Block) {
        let localParams: cs.VariableStatement[] = [];

        for (const p of parameters) {

            const variableStatement = {
                nodeType: cs.SyntaxKind.VariableStatement,
                parent: block,
                tsNode: p.tsNode,
                declarationList: {} as cs.VariableDeclarationList
            } as cs.VariableStatement;

            variableStatement.declarationList = {
                nodeType: cs.SyntaxKind.VariableDeclarationList,
                parent: variableStatement,
                tsNode: p.tsNode,
                declarations: []
            } as cs.VariableDeclarationList;


            let declaration = {
                nodeType: cs.SyntaxKind.VariableDeclaration,
                parent: variableStatement.declarationList,
                tsNode: p.tsNode,
                name: this.getMethodLocalParameterName(p.name),
                type: null!,
                initializer: {
                    tsNode: p.tsNode,
                    nodeType: cs.SyntaxKind.Identifier,
                    text: p.name
                } as cs.Identifier
            } as cs.VariableDeclaration;

            declaration.type = this.createVarTypeNode(declaration, p.tsNode!);
            declaration.initializer!.parent = declaration;

            variableStatement.declarationList.declarations.push(declaration);

            localParams.push(variableStatement);
        }

        block.statements.unshift(...localParams);
    }

    protected visitConstructorDeclaration(parent: cs.ClassDeclaration, classElement: ts.ConstructorDeclaration) {
        const constr = super.visitConstructorDeclaration(parent, classElement);
        
        if (constr.body?.nodeType === cs.SyntaxKind.Block) {
            this.injectParametersAsLocal(constr.parameters, constr.body as cs.Block);
        }

        return constr;
    }

    protected visitMethodDeclaration(
        parent: cs.ClassDeclaration | cs.InterfaceDeclaration,
        classElement: ts.MethodDeclaration
    ) {
        const method = super.visitMethodDeclaration(parent, classElement);

        if (method.body?.nodeType === cs.SyntaxKind.Block) {
            this.injectParametersAsLocal(method.parameters, method.body as cs.Block);
        }

        return method;
    }

    protected visitTemplateExpression(parent: cs.Node, expression: ts.TemplateExpression): cs.Expression {
        const text = expression.getText();
        return {
            parent: parent,
            nodeType: cs.SyntaxKind.StringLiteral,
            tsNode: expression,
            text: text.substring(1, text.length - 1)
        } as cs.StringLiteral
    }

    protected getSymbolName(parentSymbol: ts.Symbol, symbol: ts.Symbol,
        expression: cs.Expression): string | null {
        switch (parentSymbol.name) {
            case 'Array':
                switch (symbol.name) {
                    case 'length':
                        // new Array<string>(other.length)
                        if (expression.parent?.nodeType === cs.SyntaxKind.NewExpression &&
                            (expression.parent.tsNode as ts.NewExpression).arguments?.length === 1 &&
                            ((expression.parent as cs.NewExpression).type as cs.UnresolvedTypeNode).tsType?.symbol?.name === 'ArrayConstructor') {
                            return 'size';
                        }

                        return 'size.toDouble()';
                    case 'push':
                        return 'add';
                    case 'indexOf':
                        return 'indexOfInDouble';
                }
                break;
            case 'String':
                switch (symbol.name) {
                    case 'length':
                        if (expression.parent?.nodeType === cs.SyntaxKind.ReturnStatement) {
                            return 'length.toDouble()';
                        }

                        return 'length';
                }
                break;
        }
        return null;
    }
}
