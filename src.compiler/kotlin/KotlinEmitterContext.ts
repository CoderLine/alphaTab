import * as cs from '../csharp/CSharpAst';
import * as ts from 'typescript';
import CSharpEmitterContext from '../csharp/CSharpEmitterContext';

export default class KotlinEmitterContext extends CSharpEmitterContext {
    public constructor(program: ts.Program) {
        super(program);
        this.noPascalCase = true;
    }

    protected getClassName(type: cs.NamedTypeDeclaration, expr?: cs.Node) {
        let className = super.getClassName(type, expr);
        // partial member access
        if (
            expr?.parent &&
            expr.parent.nodeType === cs.SyntaxKind.MemberAccessExpression &&
            expr.parent.tsSymbol &&
            this.isSymbolPartial(expr.parent.tsSymbol)
        ) {
            className += 'Partials';
        }
        return className;
    }

    private isSymbolPartial(tsSymbol: ts.Symbol): boolean {
        if (!tsSymbol.valueDeclaration) {
            return false;
        }

        return !!ts.getJSDocTags(tsSymbol.valueDeclaration).find(t => t.tagName.text === 'partial');
    }

    protected isClassElementOverride(classType: ts.InterfaceType, classElement: ts.ClassElement) {
        if (this.hasAnyBaseTypeClassMember(classType, classElement.name!.getText(), true)) {
            return true;
        }

        if (
            ts.isClassDeclaration(classType.symbol.valueDeclaration) &&
            classType.symbol.valueDeclaration.heritageClauses
        ) {
            const implementsClause = classType.symbol.valueDeclaration.heritageClauses?.find(
                c => c.token === ts.SyntaxKind.ImplementsKeyword
            );

            if (implementsClause) {
                for (const typeSyntax of implementsClause.types) {
                    const type = this.typeChecker.getTypeFromTypeNode(typeSyntax);
                    if (type.isClassOrInterface()) {
                        if (this.hasClassMember(type, classElement.name!.getText())) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }
}
