import type ts from 'typescript';
import { makeTypeName, toIdentifier, toPascalCase } from '../casing';
import type EmitterContextBase from '../EmitterContextBase';
import type * as cs from '../ir/Ir';
import type { TargetStrategy } from '../TargetStrategy';
import { AlphaTabCore, TsBuiltin } from '../typeRegistry';

/**
 * C# implementation of the per-target customisation surface declared by
 * `TargetStrategy`. Each method body mirrors the original C# behaviour
 * that previously lived directly on `EmitterContextBase` (formerly the
 * misnamed `CSharpEmitterContext`).
 *
 * **Back-references.** After Backlog-14 B14.11 this strategy is fully
 * self-contained: no method calls back into `EmitterContextBase` at
 * runtime. The constructor still accepts a context reference so it
 * matches the `(ctx) => TargetStrategy` factory signature shared with
 * `KotlinTargetStrategy` (which uses its argument for a constructor-time
 * side-effect on `ctx.smartCast`); the C# variant simply ignores it.
 * Per-target override-lookup tweaks are surfaced as plain data
 * (`overrideLookupAllowsInterfaces`) and consumed by
 * `EmitterContextBase.markOverride` directly. Pure naming helpers
 * (`toPascalCase`, `toIdentifier`, `makeTypeName`) come from `../casing`.
 *
 * Hook groups (mirroring the interface):
 *  - Identity / module routing: `targetTag`, `alphaSkiaModule`
 *  - Naming conventions:        `to{Method,Property,Namespace,Type}NameCase`
 *  - Core type name rewriting:  `toCoreTypeName`
 *  - Runtime type aliases:      `make{Exception,Iterable,Iterator,Generator}Type`
 *  - Module / namespace mapping: `getDefaultUsings`
 *  - Symbol name rewrites:      `getClassName`, `getNameFromSymbol`
 *  - Inheritance / overrides:   `overrideLookupAllowsInterfaces` (data)
 */
export default class CSharpTargetStrategy implements TargetStrategy {
    // biome-ignore lint/complexity/noUselessConstructor: parameter matches the shared `(ctx) => TargetStrategy` factory contract; C# needs no back-reference but the signature must accept one.
    public constructor(_ctx: EmitterContextBase) {}

    public readonly targetTag: string = 'csharp';

    public alphaSkiaModule(): string {
        return 'AlphaTab.Platform.Skia.AlphaSkiaBridge';
    }

    public toMethodNameCase(text: string): string {
        return toPascalCase(toIdentifier(text));
    }

    public toPropertyNameCase(text: string): string {
        return toPascalCase(toIdentifier(text));
    }

    public toNamespaceNameCase(text: string): string {
        return toPascalCase(text);
    }

    public toTypeNameCase(text: string): string {
        return toPascalCase(text);
    }

    public toCoreTypeName(s: string): string {
        if (s === TsBuiltin.Map) {
            return 'IMap';
        }
        return s;
    }

    public makeExceptionType(): string {
        // global alias
        return this.makeTypeName(TsBuiltin.Error);
    }

    public makeIterableType(): string {
        return this.makeTypeName('System.Collections.Generic.IEnumerable');
    }

    public makeIteratorType(): string {
        return this.makeTypeName('System.Collections.Generic.IEnumerator');
    }

    public makeGeneratorType(): string {
        return this.makeTypeName('System.Collections.Generic.IEnumerator');
    }

    private makeTypeName(tsName: string): string {
        return makeTypeName(
            tsName,
            s => this.toTypeNameCase(s),
            s => this.toNamespaceNameCase(s)
        );
    }

    public getDefaultUsings(): string[] {
        return [
            this.toNamespaceNameCase('system'),
            `${this.toNamespaceNameCase(AlphaTabCore.rootModule)}.${this.toNamespaceNameCase('core')}`
        ];
    }

    public getClassName(type: cs.NamedTypeDeclaration, _expr?: cs.Node): string {
        return type.name;
    }

    public getNameFromSymbol(symbol: ts.Symbol): string {
        const parent = 'parent' in symbol ? (symbol.parent as ts.Symbol) : undefined;

        if (symbol.name === 'dispose' && (!parent || parent.name === 'SymbolConstructor')) {
            return symbol.name;
        }

        if (symbol.name === 'iterator' && (!parent || parent.name === 'SymbolConstructor')) {
            return this.toMethodNameCase('getEnumerator');
        }

        return '';
    }

    /** C#: override-lookup walks classes only (no interfaces). */
    public readonly overrideLookupAllowsInterfaces = false;
}
