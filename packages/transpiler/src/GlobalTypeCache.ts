import ts from 'typescript';

/**
 * TS-internal checker surface for global built-in type lookups.
 *
 * The `getGlobal*Type` family is part of the checker's *internal* API
 * — it is not declared on the public `ts.TypeChecker`. Rather than
 * fall back to `as any` (which is what the type-resolution rethink is
 * moving away from), we narrow the cast through this typed shim. Each
 * method is marked optional so that a future TS release that drops or
 * renames the entry yields `undefined` instead of a runtime crash.
 *
 * The `false` argument tells the checker not to report a diagnostic
 * if the global is missing (e.g. when the lib files don't declare it).
 *
 * Note: in the alphaTab checker configuration these accessors all
 * return `undefined` (the audit finding from S2.C5). They are kept as
 * the preferred-path because they are the documented internal API, but
 * the cache transparently falls back to `resolveName` against a source
 * file when they yield nothing — that path *does* work here.
 */
interface InternalChecker {
    getGlobalPromiseType?(reportErrors: boolean): ts.Type | undefined;
    getGlobalPromiseLikeType?(reportErrors: boolean): ts.Type | undefined;
    getGlobalIterableType?(reportErrors: boolean): ts.Type | undefined;
    getGlobalIteratorType?(reportErrors: boolean): ts.Type | undefined;
    getGlobalGeneratorType?(reportErrors: boolean): ts.Type | undefined;
    getGlobalArrayLikeType?(reportErrors: boolean): ts.Type | undefined;
    resolveName?(
        name: string,
        location: ts.Node | undefined,
        meaning: ts.SymbolFlags,
        excludeGlobals: boolean
    ): ts.Symbol | undefined;
}

/**
 * Sentinel for "looked up, not found". Distinct from `undefined`
 * (= "not yet looked up") so we don't re-invoke the checker on every
 * call after a miss.
 */
const MISSING: unique symbol = Symbol('GlobalTypeCache.MISSING');

type Slot = ts.Type | typeof MISSING | undefined;

/**
 * Lazily-cached lookups of the TypeScript checker's well-known
 * global types (`Promise<T>`, `PromiseLike<T>`, `Iterable<T>`,
 * `Iterator<T>`, `Generator<T>`, `ArrayLike<T>`, `number`), plus an
 * `isReferenceToType` helper for "is this `ts.Type` a TypeReference
 * targeting one of those globals?" checks.
 *
 * This is the symbol-identity replacement for the `symbol.name === 'X'`
 * string matching audited in §2.1 of `docs/type-resolution-rethink.md`.
 * Session 1 lands the cache inert; consumers migrate in Session 2.
 */
export default class GlobalTypeCache {
    private readonly _checker: ts.TypeChecker;
    private readonly _program: ts.Program;
    private _lookupLocation: ts.SourceFile | undefined;

    private _promise: Slot;
    private _promiseLike: Slot;
    private _iterable: Slot;
    private _iterator: Slot;
    private _generator: Slot;
    private _arrayLike: Slot;
    private _number: Slot;

    public constructor(checker: ts.TypeChecker, program: ts.Program) {
        this._checker = checker;
        this._program = program;
    }

    private _internal(): InternalChecker {
        return this._checker as unknown as InternalChecker;
    }

    private static _materialise(slot: Slot): ts.Type | undefined {
        return slot === MISSING ? undefined : slot;
    }

    /**
     * Pick any non-declaration source file from the program to use as
     * the lookup location for `resolveName`. The choice is arbitrary
     * (`resolveName` walks the global scope chain from any source
     * file) but a real file must exist for the call to succeed. Cached
     * after the first lookup so we don't re-scan `getSourceFiles()`.
     */
    private _location(): ts.SourceFile | undefined {
        if (this._lookupLocation === undefined) {
            this._lookupLocation =
                this._program.getSourceFiles().find(f => !f.isDeclarationFile) ?? this._program.getSourceFiles()[0];
        }
        return this._lookupLocation;
    }

    /**
     * Resolve a global type by name via `resolveName`. The
     * `getGlobal*Type` accessors return `undefined` in this checker
     * configuration even though the symbols exist; `resolveName` works
     * where they don't. This is also the documented public-API
     * workaround in §7.3 of `docs/type-resolution-rethink.md`.
     */
    private _resolveGlobalByName(name: string): ts.Type | undefined {
        const location = this._location();
        if (!location) {
            return undefined;
        }
        const sym = this._internal().resolveName?.(name, location, ts.SymbolFlags.Type, false);
        if (!sym) {
            return undefined;
        }
        return this._checker.getDeclaredTypeOfSymbol(sym);
    }

    public get promiseType(): ts.Type | undefined {
        if (this._promise === undefined) {
            this._promise =
                this._internal().getGlobalPromiseType?.(false) ?? this._resolveGlobalByName('Promise') ?? MISSING;
        }
        return GlobalTypeCache._materialise(this._promise);
    }

    public get promiseLikeType(): ts.Type | undefined {
        if (this._promiseLike === undefined) {
            this._promiseLike =
                this._internal().getGlobalPromiseLikeType?.(false) ??
                this._resolveGlobalByName('PromiseLike') ??
                MISSING;
        }
        return GlobalTypeCache._materialise(this._promiseLike);
    }

    public get iterableType(): ts.Type | undefined {
        if (this._iterable === undefined) {
            this._iterable =
                this._internal().getGlobalIterableType?.(false) ?? this._resolveGlobalByName('Iterable') ?? MISSING;
        }
        return GlobalTypeCache._materialise(this._iterable);
    }

    public get iteratorType(): ts.Type | undefined {
        if (this._iterator === undefined) {
            this._iterator =
                this._internal().getGlobalIteratorType?.(false) ?? this._resolveGlobalByName('Iterator') ?? MISSING;
        }
        return GlobalTypeCache._materialise(this._iterator);
    }

    public get generatorType(): ts.Type | undefined {
        if (this._generator === undefined) {
            this._generator =
                this._internal().getGlobalGeneratorType?.(false) ?? this._resolveGlobalByName('Generator') ?? MISSING;
        }
        return GlobalTypeCache._materialise(this._generator);
    }

    public get arrayLikeType(): ts.Type | undefined {
        if (this._arrayLike === undefined) {
            this._arrayLike =
                this._internal().getGlobalArrayLikeType?.(false) ?? this._resolveGlobalByName('ArrayLike') ?? MISSING;
        }
        return GlobalTypeCache._materialise(this._arrayLike);
    }

    /**
     * The checker's intrinsic `number` type. Public on the
     * `ts.TypeChecker` surface since TS 4.3, but cached here for
     * parity with the global lookups so all built-in-type access
     * flows through one place.
     */
    public get numberType(): ts.Type | undefined {
        if (this._number === undefined) {
            this._number = this._checker.getNumberType() ?? MISSING;
        }
        return GlobalTypeCache._materialise(this._number);
    }

    /**
     * Returns true iff `type` is a `TypeReference` whose `target` is
     * the cached `target` global. Returns false if `target` is
     * undefined (lib doesn't declare the global) or `type` is not
     * even an object-typed reference.
     */
    public isReferenceToType(type: ts.Type, target: ts.Type | undefined): boolean {
        if (!target) {
            return false;
        }
        if ((type.flags & ts.TypeFlags.Object) === 0) {
            return false;
        }
        const ref = type as ts.TypeReference;
        return (ref.objectFlags & ts.ObjectFlags.Reference) !== 0 && ref.target === target;
    }

    /**
     * Named convenience helpers. Each delegates to `isReferenceToType`
     * against the corresponding cached global. They exist so consumer
     * sites read as `globals.isPromise(t)` rather than the longer
     * `globals.isReferenceToType(t, globals.promiseType)`.
     */
    public isPromise(type: ts.Type): boolean {
        return this.isReferenceToType(type, this.promiseType);
    }

    public isPromiseLike(type: ts.Type): boolean {
        return this.isReferenceToType(type, this.promiseLikeType);
    }

    public isIterable(type: ts.Type): boolean {
        return this.isReferenceToType(type, this.iterableType);
    }

    public isIterator(type: ts.Type): boolean {
        return this.isReferenceToType(type, this.iteratorType);
    }

    public isGenerator(type: ts.Type): boolean {
        return this.isReferenceToType(type, this.generatorType);
    }

    public isArrayLike(type: ts.Type): boolean {
        return this.isReferenceToType(type, this.arrayLikeType);
    }
}
