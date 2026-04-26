import * as ts from 'typescript';
import * as cs from '../csharp/CSharpAst';
import CSharpEmitterContext from '../csharp/CSharpEmitterContext';

export default class KotlinEmitterContext extends CSharpEmitterContext {
    public override get targetTag(): string {
        return 'kotlin';
    }

    protected override alphaSkiaModule(): string {
        return 'alphaTab.platform.skia';
    }

    protected override getClassName(type: cs.NamedTypeDeclaration, expr?: cs.Node) {
        let className = super.getClassName(type, expr);
        // partial member access
        if (
            expr?.parent &&
            cs.isMemberAccessExpression(expr.parent) &&
            expr.parent.tsSymbol &&
            this._isSymbolPartial(expr.parent.tsSymbol)
        ) {
            className += 'Partials';
        }
        return className;
    }

    protected override toCoreTypeName(s: string) {
        if (s === 'String') {
            return 'CoreString';
        }
        if (s === 'Map') {
            return 'Map<*, *>';
        }
        return s;
    }

    public override getDefaultUsings(): string[] {
        return [`${this.toNamespaceNameCase('alphaTab')}.${this.toNamespaceNameCase('core')}`];
    }

    public override makeExceptionType(): string {
        return this.makeTypeName('kotlin.Throwable');
    }

    private _isSymbolPartial(tsSymbol: ts.Symbol): boolean {
        if (!tsSymbol.valueDeclaration) {
            return false;
        }

        return !!ts.getJSDocTags(tsSymbol.valueDeclaration).find(t => t.tagName.text === 'partial');
    }

    public override getOverriddenMembers(
        classType: ts.ClassDeclaration | ts.InterfaceDeclaration,
        classElement: ts.ClassElement
    ): (ts.ClassElement | ts.TypeElement)[] {
        const overriddenItems: (ts.ClassElement | ts.TypeElement)[] = [];
        super.collectOverriddenMembersByName(overriddenItems, classType, classElement.name!.getText(), false, true);
        return overriddenItems;
    }

    public override isValueTypeNotNullSmartCast(_expression: ts.Expression): boolean | undefined {
        return undefined;
    }

    public override getNameFromSymbol(symbol: ts.Symbol): string {
        const parent = 'parent' in symbol ? (symbol.parent as ts.Symbol) : undefined;

        if (symbol.name === 'dispose' && (!parent || parent.name === 'SymbolConstructor')) {
            return 'close';
        }

        if (symbol.name === 'iterator' && (!parent || parent.name === 'SymbolConstructor')) {
            return this.toMethodNameCase('iterator');
        }

        return '';
    }

    public override makeIterableType(): string {
        return this.makeTypeName('kotlin.collections.Iterable');
    }

    public override makeGeneratorType(): string {
        return this.makeTypeName('kotlin.collections.Iterator');
    }

    public override makeIteratorType(): string {
        return this.makeTypeName('kotlin.collections.Iterator');
    }

    public override toMethodNameCase(text: string): string {
        return this.toIdentifier(text);
    }

    public override toPropertyNameCase(text: string): string {
        return this.toIdentifier(text);
    }

    public override toNamespaceNameCase(text: string): string {
        return text;
    }

    public override toTypeNameCase(text: string): string {
        return this.toPascalCase(text);
    }
}
