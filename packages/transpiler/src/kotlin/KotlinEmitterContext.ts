import * as ts from 'typescript';
import * as cs from '../csharp/CSharpAst';
import CSharpEmitterContext from '../csharp/CSharpEmitterContext';

export default class KotlinEmitterContext extends CSharpEmitterContext {
    public constructor(program: ts.Program, srcOutDir: string, testOutDir: string) {
        super(program, srcOutDir, testOutDir);
        this.noPascalCase = true;
    }

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
        return [`${this.toPascalCase('alphaTab')}.${this.toPascalCase('core')}`];
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

    public getOverriddenMembers(
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

    protected isCsValueType(mapValueType: cs.TypeNode | null): boolean {
        if (mapValueType?.nodeType === cs.SyntaxKind.ArrayTupleNode) {
            return false;
        }
        return super.isCsValueType(mapValueType);
    }

    public override getNameFromSymbol(symbol: ts.Symbol): string {
        const parent = 'parent' in symbol ? (symbol.parent as ts.Symbol) : undefined;

        if (symbol.name === 'dispose' && (!parent || parent.name === 'SymbolConstructor')) {
            return 'close';
        }

        if (symbol.name === 'iterator' && (!parent || parent.name === 'SymbolConstructor')) {
            return this.toMethodName('iterator');
        }

        return '';
    }

    public override makeIterableType(): string {
        return this.makeTypeName('kotlin.collections.Iterable');
    }

    public override makeGeneratorType(): string {
        return this.makeTypeName('kotlin.collections.Iterator');
    }

    public makeIteratorType(): string {
        return this.makeTypeName('kotlin.collections.Iterator');
    }
}
