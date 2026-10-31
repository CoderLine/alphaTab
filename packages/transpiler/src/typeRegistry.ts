/**
 * Central registry of well-known TypeScript built-in symbol names and
 * alphaTab core module identifiers used by the transpiler.
 *
 * The transformer/context/printer all match on these names today; centralizing
 * them here lets us:
 *
 *  - find every site that depends on a given well-known type with a single
 *    grep on a symbol export,
 *  - replace string matching with stronger symbol-identity checks in later
 *    refactors without hunting through 30+ literals,
 *  - document the contract between the alphaTab core runtime (TS `it.d.ts`
 *    style declarations + handwritten C#/Kotlin runtime classes) and the
 *    transpiler.
 *
 * Adding a new entry: pick the *minimal* string the transpiler actually
 * compares against (e.g. the TS symbol name, not the C#/Kotlin emitted name).
 * Per-target naming is the responsibility of the EmitterContext.
 */

/**
 * TypeScript built-in (lib.*.d.ts) types that the transpiler special-cases.
 * Match against `symbol.name` exactly as the TS checker reports it.
 */
export const TsBuiltin = {
    Promise: 'Promise',
    Map: 'Map',
    Set: 'Set',
    Array: 'Array',
    Iterable: 'Iterable',
    Iterator: 'Iterator',
    Generator: 'Generator',
    Record: 'Record',
    Error: 'Error',
    Disposable: 'Disposable'
} as const;

/**
 * alphaTab core runtime identifiers. These reference modules and types that
 * exist in the alphaTab TS source AND in the handwritten C#/Kotlin support
 * libraries; the transpiler injects calls/references to them during emit.
 */
export const AlphaTabCore = {
    /** Root namespace segment of the alphaTab library. */
    rootModule: 'alphaTab',
    /** Core sub-namespace; concatenated with `.` for qualified names. */
    coreNamespace: 'alphaTab.core',
    /** Filename (basename, lower-cased) of the TS file that holds top-level core globals. */
    coreEntryFile: 'alphatab.core.ts',
    /** Fully-qualified TypeHelper used for boolean/numeric coercions and the `in`/`is` helpers. */
    typeHelper: 'alphaTab.core.TypeHelper',
    /** Marker interface used by record-shaped classes during emit. */
    recordInterface: 'alphaTab.core.IRecord',
    /** Concrete runtime class for TS Record<K,V> object literals. */
    recordType: 'alphaTab.core.ecmaScript.Record',
    /** Tuple types in Kotlin emission. */
    arrayTuple: 'alphaTab.core.ArrayTuple',
    arrayTupleInterface: 'alphaTab.core.IArrayTuple'
} as const;
