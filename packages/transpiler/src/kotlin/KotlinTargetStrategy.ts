import type * as ts from 'typescript';
import { makeTypeName, toIdentifier, toPascalCase } from '../casing';
import type EmitterContextBase from '../EmitterContextBase';
import type * as cs from '../ir/Ir';
import type { TargetStrategy } from '../TargetStrategy';
import { AlphaTabCore, TsBuiltin } from '../typeRegistry';
import type KotlinEmitterContext from './KotlinEmitterContext';

/**
 * Kotlin implementation of the per-target customisation surface declared
 * by `TargetStrategy`. Mirrors `CSharpTargetStrategy`.
 *
 * **Back-references.** After Backlog-14 B14.11 the only remaining
 * runtime back-reference is `getClassName`'s typed downcast to
 * `KotlinEmitterContext` for the `partialSuffixExpressions` set (a
 * Kotlin-only IR-side decision recorded by `PartialsPass`). The
 * constructor additionally toggles `ctx.smartCast.valueTypeNotNullEnabled`
 * once at construction — Kotlin's null-safe operators make that
 * smart-cast redundant, and it would always over-narrow under Kotlin's
 * null safety. Both points are load-bearing: the downcast accesses
 * subclass-private state, and the smart-cast toggle is one-shot
 * configuration of a shared helper. Per-target override-lookup tweaks
 * are surfaced as plain data (`overrideLookupAllowsInterfaces`)
 * consumed by `EmitterContextBase.markOverride` directly. Pure naming
 * helpers (`toPascalCase`, `toIdentifier`, `makeTypeName`) come from
 * `../casing`.
 */
export default class KotlinTargetStrategy implements TargetStrategy {
    private readonly _ctx: EmitterContextBase;

    public constructor(ctx: EmitterContextBase) {
        this._ctx = ctx;
        // Kotlin's null-safe operators make the value-type-not-null smart
        // cast redundant; disable the predicate so it always reports `undefined`.
        ctx.smartCast.valueTypeNotNullEnabled = false;
    }

    public readonly targetTag: string = 'kotlin';

    public alphaSkiaModule(): string {
        return 'alphaTab.platform.skia';
    }

    public toMethodNameCase(text: string): string {
        return toIdentifier(text);
    }

    public toPropertyNameCase(text: string): string {
        return toIdentifier(text);
    }

    public toNamespaceNameCase(text: string): string {
        return text;
    }

    public toTypeNameCase(text: string): string {
        return toPascalCase(text);
    }

    public toCoreTypeName(s: string): string {
        if (s === 'String') {
            return 'CoreString';
        }
        if (s === TsBuiltin.Map) {
            return 'Map<*, *>';
        }
        return s;
    }

    public makeExceptionType(): string {
        return this.makeTypeName('kotlin.Throwable');
    }

    public makeIterableType(): string {
        return this.makeTypeName('kotlin.collections.Iterable');
    }

    public makeIteratorType(): string {
        return this.makeTypeName('kotlin.collections.Iterator');
    }

    public makeGeneratorType(): string {
        return this.makeTypeName('kotlin.collections.Iterator');
    }

    private makeTypeName(tsName: string): string {
        return makeTypeName(
            tsName,
            s => this.toTypeNameCase(s),
            s => this.toNamespaceNameCase(s)
        );
    }

    public getDefaultUsings(): string[] {
        return [`${this.toNamespaceNameCase(AlphaTabCore.rootModule)}.${this.toNamespaceNameCase('core')}`];
    }

    public getClassName(type: cs.NamedTypeDeclaration, expr?: cs.Node): string {
        let className = type.name;
        // partial member access: `PartialsPass` records the IR
        // expression nodes that need the suffix. The decision is no
        // longer recomputed here at print time. The strategy is wired
        // to a `KotlinEmitterContext` by `KotlinEmitter.createEmit`;
        // the cast is safe by configuration.
        const kotlinContext = this._ctx as KotlinEmitterContext;
        if (expr && kotlinContext.partialSuffixExpressions.has(expr)) {
            className += 'Partials';
        }
        return className;
    }

    public getNameFromSymbol(symbol: ts.Symbol): string {
        const parent = 'parent' in symbol ? (symbol.parent as ts.Symbol) : undefined;

        if (symbol.name === 'dispose' && (!parent || parent.name === 'SymbolConstructor')) {
            return 'close';
        }

        if (symbol.name === 'iterator' && (!parent || parent.name === 'SymbolConstructor')) {
            return this.toMethodNameCase('iterator');
        }

        return '';
    }

    /** Kotlin: override-lookup walks interface members in addition to classes. */
    public readonly overrideLookupAllowsInterfaces = true;
}
