import type ts from 'typescript';
import type * as cs from './ir/Ir';

/**
 * Per-target customization points consumed by EmitterContextBase.
 *
 * A strategy object is injected into the context constructor via a
 * factory `(ctx) => TargetStrategy`. Implementations: `CSharpTargetStrategy`
 * (the canonical C# behaviour) and `KotlinTargetStrategy`.
 *
 * **Back-reference contract.** After Backlog-14 (B14.1–B14.11) the
 * strategies are largely self-contained:
 *
 *  - Pure target-agnostic helpers (`toPascalCase`, `toIdentifier`,
 *    `makeTypeName`) live in `./casing` and are imported directly.
 *  - Target-specific extension state (e.g. Kotlin's
 *    `partialSuffixExpressions`) lives on the matching context
 *    subclass and is reached via a typed downcast inside the strategy
 *    that knows it (`getClassName` in `KotlinTargetStrategy`).
 *  - Constructor-time configuration of context helpers (e.g. Kotlin
 *    flipping `smartCast.valueTypeNotNullEnabled`) is applied as a
 *    side-effect at construction.
 *
 * After this audit no strategy method calls back into the context at
 * call time; the `_ctx` field exists only so the constructor can
 * apply those side-effects and so target-specific downcasts have a
 * starting reference. Per-target override-lookup tweaks are surfaced
 * as plain data on this interface (`overrideLookupAllowsInterfaces`),
 * so `EmitterContextBase.markOverride` can drive the lookup itself
 * without re-entering the strategy.
 *
 * Method groups:
 *
 *  - Identity / module routing: targetTag, alphaSkiaModule
 *  - Naming conventions:        to{Method,Property,Namespace,Type}NameCase
 *  - Core type name rewriting:  toCoreTypeName
 *  - Runtime type aliases:      makeExceptionType, makeIterableType,
 *                               makeIteratorType, makeGeneratorType
 *  - Module / namespace mapping: getDefaultUsings
 *  - Symbol name rewrites:      getNameFromSymbol, getClassName
 *  - Inheritance / overrides:   overrideLookupAllowsInterfaces (data,
 *                               consumed by `EmitterContextBase.markOverride`)
 */
export interface TargetStrategy {
    readonly targetTag: string;

    alphaSkiaModule(): string;

    toMethodNameCase(text: string): string;
    toPropertyNameCase(text: string): string;
    toNamespaceNameCase(text: string): string;
    toTypeNameCase(text: string): string;

    toCoreTypeName(s: string): string;

    makeExceptionType(): string;
    makeIterableType(): string;
    makeIteratorType(): string;
    makeGeneratorType(): string;

    getDefaultUsings(): string[];

    getClassName(type: cs.NamedTypeDeclaration, expr?: cs.Node): string;
    getNameFromSymbol(symbol: ts.Symbol): string;

    /**
     * When `true`, the override-lookup walk under
     * `EmitterContextBase.markOverride` follows interface members in
     * addition to class members (Kotlin: yes, C# attribute-style: no).
     */
    readonly overrideLookupAllowsInterfaces: boolean;
}
