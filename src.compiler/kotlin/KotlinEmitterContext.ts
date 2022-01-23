import * as cs from '../csharp/CSharpAst';
import * as ts from 'typescript';
import CSharpEmitterContext from '../csharp/CSharpEmitterContext';

export default class KotlinEmitterContext extends CSharpEmitterContext {
    public constructor(program: ts.Program) {
        super(program);
        this.noPascalCase = true;
    }

    protected override getClassName(type: cs.NamedTypeDeclaration, expr?: cs.Node) {
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

    protected override toCoreTypeName(s: string) {
        if(s === 'String') {
            return 'CoreString';
        }
        if(s === 'Map') {
            return 'Map<*, *>'
        }
        return s;
    }

    public override getDefaultUsings(): string[] {
        return [
            this.toPascalCase('alphaTab') + '.' + this.toPascalCase('core')
        ];
    }

    public override makeExceptionType(): cs.TypeReferenceType {
        return this.makeTypeName('kotlin.Throwable')
    }

    private isSymbolPartial(tsSymbol: ts.Symbol): boolean {
        if (!tsSymbol.valueDeclaration) {
            return false;
        }

        return !!ts.getJSDocTags(tsSymbol.valueDeclaration).find(t => t.tagName.text === 'partial');
    }


    protected override getOverriddenMembers(classType: ts.InterfaceType, classElement: ts.ClassElement): ts.Symbol[] {
        const symbols: ts.Symbol[] = [];
        this.collectOverriddenMembersByName(symbols, classType, classElement.name!.getText(), false, true);
        return symbols;
    }

    protected override collectOverriddenMembersByName(symbols: ts.Symbol[], classType: ts.InterfaceType, memberName: string, includeOwnMembers: boolean = false, allowInterfaces: boolean = false) {
        super.collectOverriddenMembersByName(symbols, classType, memberName, includeOwnMembers, allowInterfaces);

        if (
            classType.symbol.valueDeclaration && 
            ts.isClassDeclaration(classType.symbol.valueDeclaration) &&
            classType.symbol.valueDeclaration.heritageClauses
        ) {
            const implementsClause = classType.symbol.valueDeclaration.heritageClauses?.find(
                c => c.token === ts.SyntaxKind.ImplementsKeyword
            );

            if (implementsClause) {
                for (const typeSyntax of implementsClause.types) {
                    const type = this.typeChecker.getTypeFromTypeNode(typeSyntax);
                    super.collectOverriddenMembersByName(symbols, type as ts.InterfaceType, memberName, true, allowInterfaces);
                }
            }
        }

        return false;
    }

    public override isValueTypeNotNullSmartCast(expression: ts.Expression): boolean | undefined {
        return undefined;
    }
}
