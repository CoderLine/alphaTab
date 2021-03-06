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
            cs.isMemberAccessExpression(expr.parent) &&
            expr.parent.tsSymbol &&
            this.isSymbolPartial(expr.parent.tsSymbol)
        ) {
            className += 'Partials';
        }
        return className;
    }

    protected toCoreTypeName(s: string) {
        if(s === 'String') {
            return 'CoreString';
        }
        if(s === 'Map') {
            return 'Map<*, *>'
        }
        return s;
    }

    private isSymbolPartial(tsSymbol: ts.Symbol): boolean {
        if (!tsSymbol.valueDeclaration) {
            return false;
        }

        return !!ts.getJSDocTags(tsSymbol.valueDeclaration).find(t => t.tagName.text === 'partial');
    }

    protected isClassElementOverride(classType: ts.Type, classElement: ts.ClassElement) {
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
                    if (this.hasClassMember(type, classElement.name!.getText())) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    public isValueTypeNotNullSmartCast(expression: ts.Expression): boolean | undefined {
        return undefined;
    }
}
