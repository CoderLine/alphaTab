import path from 'node:path';
import ts from 'typescript';
import { fileNameToWrapperClassName, makeTypeName } from './casing';
import GlobalTypeCache from './GlobalTypeCache';
import * as cs from './ir/Ir';
import { findTagWithComment, getTagComment, hasTag, JsDocTag } from './jsDocTags';
import SmartCastResolver from './SmartCastResolver';
import SymbolRegistry from './SymbolRegistry';
import type { TargetStrategy } from './TargetStrategy';
import TypeResolver from './TypeResolver';
import { AlphaTabCore, TsBuiltin } from './typeRegistry';

/**
 * Shared state container for both C# and Kotlin emission. Holds program
 * state (symbol caches, diagnostics, file list, program/checker
 * references) plus orchestration helpers; per-target decisions are
 * delegated to an injected `TargetStrategy`. The 15 hooks declared by
 * the interface are routed through `this.strategy.foo(...)`; the
 * methods below are thin pass-through delegations so existing
 * `this.context.toMethodNameCase(...)` call sites in the transformers
 * and printers continue to work unchanged.
 *
 * Member groups (per docs/emitter-context-split-analysis.md §3):
 *  - Context glue (typeChecker, program, smartCast, typeResolver,
 *    globals, symbols, strategy, sourceFiles).
 *  - Symbol registry — extracted to `SymbolRegistry`
 *    (`context.symbols.register`, `.resolve`, `.iterateRegisteredTypes`,
 *    `.isMarkedVirtual`, `.keyOf`, `.isConst`, `.markConst`,
 *    `.getSymbolForDeclaration`, `.markOverride`).
 *  - Diagnostics (`_diagnostics`, `addDiagnostic`,
 *    `addTsNodeDiagnostics`, `addNodeDiagnostics`, `findTsSourceFile`,
 *    `diagnostics` getter, `hasErrors`).
 *  - Type-classification predicates — pure functions of `ts.Type` /
 *    `ts.Symbol`, no target branching. Tagged in their JSDoc with
 *    "Type classification:". Members: `getType`, `isMethodSymbol`,
 *    `isPropertySymbol`, `isGlobalVariable`, `isIterable`,
 *    `isFunctionType`, `isValueType`, `isValueTypeExpression`,
 *    `isEnum`, `isNullableType`, `isStaticSymbol`,
 *    `isSymbolArrayTupleInstance`, `isRecord`, `isDiscriminatedUnion`,
 *    `isInternal`, plus `isTypeAssignable` / `isBooleanType` retained
 *    for `SmartCastResolver`.
 *  - Override / virtual tracking (`markOverride`,
 *    `getOverriddenMembers`, `collectOverriddenMembersByName`).
 *  - Naming pass-throughs (`to{Method,Property,Namespace,Type}NameCase`).
 *  - IR construction helpers (`makeTypeName`, `makeArrayTupleType`,
 *    `createArrayListType`, `createMapType`, `createBasicFunctionType`).
 */
export default class EmitterContextBase {
    private _diagnostics: ts.Diagnostic[] = [];
    private _program: ts.Program;
    public typeChecker: ts.TypeChecker;

    /**
     * Per-program symbol bookkeeping is delegated to a dedicated
     * registry: IR-node lookup by TS symbol, virtual-symbol tracking,
     * and `const`-field tagging. Callers go through
     * `context.symbols.foo(...)`.
     */
    public readonly symbols: SymbolRegistry;

    /**
     * Smart-cast analysis is delegated to a dedicated resolver.
     * Callers go through `context.smartCast.isUnknown(...)` etc.
     */
    public readonly smartCast: SmartCastResolver = new SmartCastResolver(this);

    /**
     * Type-resolution cascade (the 6-strategy `getTypeFromTsType`
     * pipeline) is delegated to a dedicated resolver. The cascade is
     * pure type lookup — `tsType` in, IR `TypeNode` out — and lives on
     * its own class to keep this context focused on state (symbol
     * cache, diagnostics, program/checker references, registered
     * files). Callers go through `context.typeResolver.foo(...)`.
     */
    public readonly typeResolver: TypeResolver = new TypeResolver(this);

    /**
     * Lazily-cached symbol-identity lookups of the TS checker's
     * well-known global types (`Promise`, `PromiseLike`, `Iterable`,
     * `Iterator`, `Generator`, `ArrayLike`, plus `number`). The
     * replacement for the `symbol.name === 'X'` string-matching
     * audited in §2.1 of `docs/type-resolution-rethink.md`. Inert
     * infrastructure landed in Session 1; consumers migrate in
     * Session 2.
     */
    public readonly globals: GlobalTypeCache;

    /**
     * Per-target customisation hooks. Injected via the strategy factory
     * passed to the constructor; constructed *after* the context exists
     * so the strategy can apply constructor-time configuration on shared
     * helpers (e.g. `KotlinTargetStrategy` flips
     * `ctx.smartCast.valueTypeNotNullEnabled`) and keep a typed reference
     * for any subclass downcast it owns (`KotlinTargetStrategy.getClassName`
     * reaches `KotlinEmitterContext.partialSuffixExpressions`).
     *
     * Per the B14.11 audit no strategy method calls back into the
     * context at runtime for shared helpers — pure naming helpers
     * (`toPascalCase`, `toIdentifier`, `makeTypeName`) live in
     * `./casing`, and per-target override-lookup tweaks are surfaced as
     * the plain-data flag `overrideLookupAllowsInterfaces` consumed by
     * `markOverride` directly. The hooks declared by `TargetStrategy`
     * route through this field.
     */
    public readonly strategy: TargetStrategy;

    public sourceFiles: cs.SourceFile[] = [];

    public get compilerOptions(): ts.CompilerOptions {
        return this._program.getCompilerOptions();
    }
    /** Diagnostics: readonly view of the per-program diagnostic buffer (see Diagnostics region below). */
    public get diagnostics(): readonly ts.Diagnostic[] {
        return this._diagnostics;
    }
    /** Diagnostics: set to `true` the first time an `Error`-category diagnostic is added (see Diagnostics region below). */
    public hasErrors: boolean = false;

    /** Type classification: convenience wrap around `typeChecker.getTypeAtLocation`. */
    public getType(n: ts.Node): ts.Type {
        return this.typeChecker.getTypeAtLocation(n);
    }

    public toMethodNameCase(text: string): string {
        return this.strategy.toMethodNameCase(text);
    }

    public toPropertyNameCase(text: string): string {
        return this.strategy.toPropertyNameCase(text);
    }

    public toNamespaceNameCase(text: string): string {
        return this.strategy.toNamespaceNameCase(text);
    }

    public toTypeNameCase(text: string): string {
        return this.strategy.toTypeNameCase(text);
    }

    /** Type classification: TS-flag check for `Method`. */
    public isMethodSymbol(tsSymbol: ts.Symbol) {
        return (tsSymbol.flags & ts.SymbolFlags.Method) !== 0;
    }

    /** Type classification: TS-flag check for property/accessor, plus the global-variable carve-out. */
    public isPropertySymbol(tsSymbol: ts.Symbol) {
        if (
            (tsSymbol.flags & (ts.SymbolFlags.Property | ts.SymbolFlags.GetAccessor | ts.SymbolFlags.SetAccessor)) !==
            0
        ) {
            return true;
        }

        // globals
        if ((tsSymbol.flags & ts.SymbolFlags.FunctionScopedVariable) !== 0 && this.isGlobalVariable(tsSymbol)) {
            return true;
        }

        return false;
    }

    /** Type classification: structural assignability check, anchoring `SmartCastResolver`. */
    public isTypeAssignable(targetType: ts.Type, contextualTypeNullable: ts.Type, actualType: ts.Type) {
        if (
            contextualTypeNullable.flags === ts.TypeFlags.Any ||
            contextualTypeNullable.flags === ts.TypeFlags.Unknown
        ) {
            return true;
        }
        if (targetType.flags === ts.TypeFlags.Any || targetType.flags === ts.TypeFlags.Unknown) {
            return true;
        }
        if (actualType.isClassOrInterface()) {
            return this.typeChecker.isTypeAssignableTo(actualType, targetType);
        }
        return false;
    }

    /**
     * Resolve a TS symbol attached to a CS node to its emitted qualified name.
     *
     * Five-stage cascade:
     *  1. Lookup in the per-program symbol cache populated by registerSymbol().
     *  2. Map well-known TS type symbols (Error/Iterable/etc.) to target runtime names.
     *  3. Map registered class/interface/enum-shaped symbols to their core-namespaced name.
     *  4. Map function symbols, including test functions and local declarations.
     *  5. Map global variables / known module references to alphaTab.core.Globals.
     *  6. Fall through to external-module resolution.
     *
     * Returns undefined when no rule applies, which signals to the caller
     * that the printer should fall back to the raw identifier text.
     */
    public getSymbolName(expr: cs.Node): string | undefined {
        if (!expr.tsSymbol) {
            return undefined;
        }
        const tsSymbol = expr.tsSymbol;

        const cached = this._resolveCachedSymbol(tsSymbol, expr);
        if (cached !== undefined) {
            return cached;
        }

        if (this._isTypeShapedSymbol(tsSymbol)) {
            return this._resolveTypeShapedSymbolName(tsSymbol);
        }

        if (tsSymbol.flags & ts.SymbolFlags.Function) {
            return this._resolveFunctionSymbolName(tsSymbol, expr);
        }

        if (this._isGlobalLikeSymbol(tsSymbol)) {
            return this._resolveGlobalVariableName(tsSymbol, expr);
        }

        const externalModule = this.resolveExternalModuleOfType(tsSymbol);
        if (externalModule) {
            return externalModule + this.toTypeNameCase(tsSymbol.name);
        }
        return undefined;
    }

    /** Lookup the symbol in the registered-symbol cache; class/iface/enum returns their full qualified name. */
    private _resolveCachedSymbol(tsSymbol: ts.Symbol, expr: cs.Node): string | undefined {
        const csSymbol = this.symbols.resolve(tsSymbol);
        if (!csSymbol) {
            return undefined;
        }
        switch (csSymbol.nodeType) {
            case cs.SyntaxKind.ClassDeclaration:
            case cs.SyntaxKind.InterfaceDeclaration:
            case cs.SyntaxKind.EnumDeclaration:
                return this.getFullName(csSymbol as cs.NamedTypeDeclaration, expr);
        }
        // Members of the synthetic `<FileName>Globals` wrapper need to be
        // qualified at the call site (unless the call site lives inside the
        // wrapper itself). The wrapper is a static class.
        const enclosingClass = this._enclosingClassOfCsNode(csSymbol);
        if (
            enclosingClass &&
            enclosingClass.isStatic === true &&
            !this._enclosingClassIsWrapper(expr, enclosingClass.name)
        ) {
            return `${enclosingClass.name}.${csSymbol.name}`;
        }
        return csSymbol.name;
    }

    /** Walk parent pointers upward to find the cs.ClassDeclaration directly containing this member. */
    private _enclosingClassOfCsNode(node: cs.Node): cs.ClassDeclaration | undefined {
        let current: cs.Node | null = node.parent ?? null;
        while (current) {
            if (cs.isClassDeclaration(current)) {
                return current;
            }
            current = current.parent ?? null;
        }
        return undefined;
    }

    /** Class / interface / enum shape (TS flags), regardless of whether the symbol is cached. */
    private _isTypeShapedSymbol(tsSymbol: ts.Symbol): boolean {
        return !!(
            tsSymbol.flags & ts.SymbolFlags.Class ||
            tsSymbol.flags & ts.SymbolFlags.Interface ||
            tsSymbol.flags & ts.SymbolFlags.ConstEnum ||
            tsSymbol.flags & ts.SymbolFlags.RegularEnum
        );
    }

    /** Built-in TS types (Error, Iterable, ...) map to runtime equivalents; everything else uses the core namespace. */
    private _resolveTypeShapedSymbolName(tsSymbol: ts.Symbol): string {
        switch (tsSymbol.name) {
            case TsBuiltin.Error:
                return this.makeExceptionType();
            case TsBuiltin.Iterable:
                return this.makeIterableType();
            case TsBuiltin.Iterator:
                return this.makeIteratorType();
            case TsBuiltin.Generator:
                return this.makeGeneratorType();
            case TsBuiltin.Disposable:
                return TsBuiltin.Disposable;
        }
        return this.buildCoreNamespace(tsSymbol) + this.toCoreTypeName(tsSymbol.name);
    }

    /**
     * Functions: test functions live under alphaTab.test.Globals, the
     * alphaTab.core entry file routes through alphaTab.core.Globals, every
     * other user file routes through a per-file `<FileName>Globals` wrapper
     * class. References from inside the wrapper itself stay unqualified.
     */
    private _resolveFunctionSymbolName(tsSymbol: ts.Symbol, expr: cs.Node): string {
        if (this.isTestFunction(tsSymbol)) {
            return `${this.toNamespaceNameCase('alphaTab.test')}.Globals.${this.toMethodNameCase(tsSymbol.name)}`;
        }

        // Local functions (declared inside a body) keep their raw name and
        // are emitted bare; only top-level FunctionDeclarations get routed
        // through the per-file wrapper class.
        if (!this._isTopLevelDeclaration(tsSymbol)) {
            return tsSymbol.name;
        }

        const memberName = this.toMethodNameCase(tsSymbol.name);
        const wrapperPrefix = this._resolveTopLevelWrapperName(tsSymbol, expr);
        if (wrapperPrefix === null) {
            return memberName;
        }
        return `${wrapperPrefix}.${memberName}`;
    }

    /** True when the symbol's declaration sits directly at SourceFile scope. */
    private _isTopLevelDeclaration(tsSymbol: ts.Symbol): boolean {
        const decl = tsSymbol.valueDeclaration;
        if (!decl) {
            return false;
        }
        // Function declaration directly at module level.
        if (
            ts.isFunctionDeclaration(decl) &&
            decl.parent &&
            (ts.isSourceFile(decl.parent) ||
                // declare global { ... }
                (ts.isModuleBlock(decl.parent) &&
                    decl.parent.parent &&
                    ts.isDeclarationStatement(decl.parent.parent) &&
                    decl.parent.parent.name?.text === 'global'))
        ) {
            return true;
        }
        // Variable declaration at module level: parent chain is
        // VariableDeclaration → VariableDeclarationList → VariableStatement → SourceFile.
        if (
            ts.isVariableDeclaration(decl) &&
            decl.parent?.kind === ts.SyntaxKind.VariableDeclarationList &&
            decl.parent.parent?.kind === ts.SyntaxKind.VariableStatement &&
            decl.parent.parent.parent?.kind === ts.SyntaxKind.SourceFile
        ) {
            return true;
        }
        return false;
    }

    /**
     * Resolve the qualified `Namespace.WrapperClass` prefix for a top-level
     * symbol, or `null` when the symbol can be referenced unqualified
     * because the call site lives inside the same wrapper class.
     *
     * Returns the alphaTab.core legacy prefix when the declaration sits in
     * the core entry file; otherwise derives the wrapper namespace and
     * class name from the declaration's source-file path.
     */
    private _resolveTopLevelWrapperName(tsSymbol: ts.Symbol, expr: cs.Node): string | null {
        const declFile = tsSymbol.valueDeclaration?.getSourceFile();
        if (!declFile) {
            // No declaration info available — fall back to legacy core path.
            return `${this.toNamespaceNameCase(AlphaTabCore.coreNamespace)}.Globals`;
        }

        if (
            path.basename(declFile.fileName).toLowerCase() === AlphaTabCore.coreEntryFile ||
            declFile.fileName.includes('node_modules')
        ) {
            return `${this.toNamespaceNameCase(AlphaTabCore.coreNamespace)}.Globals`;
        }

        const wrapperClassName = fileNameToWrapperClassName(declFile.fileName);

        // Same-file: bare reference is correct only when the call site's
        // enclosing IR class IS the wrapper itself.
        if (expr.tsNode && expr.tsNode.getSourceFile() === declFile) {
            if (this._enclosingClassIsWrapper(expr, wrapperClassName)) {
                return null;
            }
            // Same file but different class — qualified with just the
            // wrapper name (same namespace, so no prefix needed).
            return wrapperClassName;
        }

        const ns = this.deriveNamespaceForFile(declFile.fileName);
        return ns ? `${ns}.${wrapperClassName}` : wrapperClassName;
    }

    /** True when walking `expr.parent` upward reaches the wrapper class. */
    private _enclosingClassIsWrapper(expr: cs.Node, wrapperClassName: string): boolean {
        let current: cs.Node | null = expr.parent ?? null;
        while (current) {
            if (cs.isClassDeclaration(current)) {
                return current.isStatic === true && current.name === wrapperClassName;
            }
            current = current.parent ?? null;
        }
        return false;
    }

    /**
     * Derives the target namespace for a TS source file using the same
     * algorithm as `AstTransformer.transform()`: strip `src/` or `test/`
     * prefix, fold remaining folders into the `alphaTab.*` namespace.
     */
    public deriveNamespaceForFile(fileName: string): string {
        const configFile = this.compilerOptions.configFilePath as string | undefined;
        if (!configFile) {
            return this.toNamespaceNameCase('alphaTab');
        }
        const folders = path.dirname(path.relative(path.dirname(configFile), path.resolve(fileName))).split(path.sep);
        if (folders.length > 0 && (folders[0] === 'src' || folders[0] === 'test')) {
            folders.shift();
        }
        const namespaceFolders = folders.filter(f => f !== '' && f !== '.');
        return (
            this.toNamespaceNameCase('alphaTab') + namespaceFolders.map(f => `.${this.toNamespaceNameCase(f)}`).join('')
        );
    }

    /**
     * Variable counterpart of `_resolveFunctionSymbolName`: routes the
     * cross-file global through its per-file `<FileName>Globals` wrapper
     * (or `alphaTab.core.Globals` for the legacy core entry file). Returns
     * the bare property name when the call site is inside the wrapper
     * class itself.
     */
    private _resolveGlobalVariableName(tsSymbol: ts.Symbol, expr: cs.Node): string {
        const memberName = this.toPropertyNameCase(tsSymbol.name);
        // Module-like symbols (e.g. globalThis) don't have a wrapper file —
        // keep routing them through alphaTab.core.Globals.
        if (
            tsSymbol.flags & ts.SymbolFlags.NamespaceModule ||
            !tsSymbol.valueDeclaration ||
            !this.isGlobalVariable(tsSymbol)
        ) {
            return `${this.toNamespaceNameCase(AlphaTabCore.coreNamespace)}.Globals.${memberName}`;
        }
        const wrapperPrefix = this._resolveTopLevelWrapperName(tsSymbol, expr);
        if (wrapperPrefix === null) {
            return memberName;
        }
        return `${wrapperPrefix}.${memberName}`;
    }

    /** Globally-scoped variables or module references that emit via alphaTab.core.Globals. */
    private _isGlobalLikeSymbol(tsSymbol: ts.Symbol): boolean {
        return (
            !!(tsSymbol.flags & ts.SymbolFlags.FunctionScopedVariable && this.isGlobalVariable(tsSymbol)) ||
            !!(tsSymbol.flags & ts.SymbolFlags.NamespaceModule && this.isKnownModule(tsSymbol))
        );
    }
    private isTestFunction(tsSymbol: ts.Symbol): boolean {
        return tsSymbol.valueDeclaration?.getSourceFile().fileName.indexOf('jasmine') !== -1;
    }
    private isKnownModule(tsSymbol: ts.Symbol): boolean {
        switch (tsSymbol.name) {
            case 'globalThis':
                return true;
            default:
                return false;
        }
    }
    /** Type classification: top-level `var`/`let`/`const` declared at source-file scope. */
    public isGlobalVariable(symbol: ts.Symbol) {
        if ((symbol.flags & ts.SymbolFlags.FunctionScopedVariable) === 0 || !symbol.valueDeclaration) {
            return false;
        }

        if (
            symbol.valueDeclaration.parent.kind === ts.SyntaxKind.VariableDeclarationList &&
            symbol.valueDeclaration.parent.parent.kind === ts.SyntaxKind.VariableStatement &&
            symbol.valueDeclaration.parent.parent.parent.kind === ts.SyntaxKind.SourceFile
        ) {
            return true;
        }

        return false;
    }

    public getFullName(type: cs.NamedTypeDeclaration, expr?: cs.Node): string {
        if (!type.parent) {
            return '';
        }
        switch (type.parent.nodeType) {
            case cs.SyntaxKind.ClassDeclaration:
            case cs.SyntaxKind.InterfaceDeclaration:
            case cs.SyntaxKind.EnumDeclaration:
                return `${this.getFullName(type.parent as cs.NamedTypeDeclaration)}.${this.getClassName(type, expr)}`;
            case cs.SyntaxKind.NamespaceDeclaration:
                return `${(type.parent as cs.NamespaceDeclaration).namespace}.${this.getClassName(type, expr)}`;
        }
        return '';
    }

    public getClassName(type: cs.NamedTypeDeclaration, expr?: cs.Node): string {
        return this.strategy.getClassName(type, expr);
    }

    // #region Diagnostics
    //
    // Diagnostic emission and bookkeeping. Per
    // docs/emitter-context-split-analysis.md §3.2, this group is fully
    // target-agnostic: both pipelines (C# and Kotlin) emit through these
    // helpers and neither branches on `strategy.targetTag`. Members below
    // collaborate with `_diagnostics` / `diagnostics` getter / `hasErrors`
    // declared near the top of the class.

    /**
     * Diagnostic for an IR node. If the node carries a `tsNode` back-link
     * the message is anchored to that TS source location via
     * `addTsNodeDiagnostics`; otherwise the diagnostic is location-less
     * (`code: 1`, `file: undefined`).
     *
     * The IR namespace is named `cs` for historical reasons but the
     * `cs.Node` type is the shared IR for both targets — this helper is
     * called from C# and Kotlin printers/transformers alike. The legacy
     * spelling `addNodeDiagnostics` survived from when the IR was
     * C#-only; the method was renamed in Backlog-14 B14.6.
     */
    public addNodeDiagnostics(node: cs.Node, message: string, category: ts.DiagnosticCategory) {
        if (node.tsNode) {
            this.addTsNodeDiagnostics(node.tsNode, message, category);
        } else {
            this.addDiagnostic({
                category: category,
                code: 1,
                file: undefined,
                messageText: message,
                start: undefined,
                length: undefined
            });
        }
    }

    /**
     * Diagnostic for a TS source node. Walks up to the containing
     * `SourceFile` to populate the `file`/`start`/`length` triple
     * required by the TS compiler diagnostic shape (`code: 4000`).
     */
    public addTsNodeDiagnostics(node: ts.Node, message: string, category: ts.DiagnosticCategory) {
        const file = this.findTsSourceFile(node);
        const start = node.getStart(file);
        const end = node.getEnd();
        this.addDiagnostic({
            category: category,
            code: 4000,
            file: file,
            messageText: message,
            start: start,
            length: end - start
        });
    }

    /** Diagnostics helper: walk parent chain to the enclosing `ts.SourceFile`. */
    private findTsSourceFile(tsNode: ts.Node): ts.SourceFile {
        if (ts.isSourceFile(tsNode)) {
            return tsNode;
        }
        return this.findTsSourceFile(tsNode.parent);
    }
    // #endregion Diagnostics

    public constructor(
        program: ts.Program,
        public readonly srcOutDir: string,
        public readonly testOutDir: string,
        strategyFactory: (ctx: EmitterContextBase) => TargetStrategy
    ) {
        this._program = program;
        this.typeChecker = program.getTypeChecker();
        this.globals = new GlobalTypeCache(this.typeChecker, program);
        this.symbols = new SymbolRegistry(this.typeChecker, node =>
            this.addNodeDiagnostics(node, 'Could not register symbol', ts.DiagnosticCategory.Error)
        );
        // Strategy is constructed last so the factory receives a fully
        // initialised context. The strategy stores a back-reference to
        // the context; this also avoids a half-initialised window where
        // `this.strategy` could be observed as undefined.
        this.strategy = strategyFactory(this);
    }

    /**
     * Diagnostics: append a fully-formed `ts.Diagnostic`. Flips
     * `hasErrors` when the category is `Error`. The other diagnostic
     * helpers (`addNodeDiagnostics`, `addTsNodeDiagnostics`) construct
     * the diagnostic shape and funnel through this method.
     */
    public addDiagnostic(diagnostics: ts.Diagnostic) {
        this._diagnostics.push(diagnostics);
        if (diagnostics.category === ts.DiagnosticCategory.Error) {
            this.hasErrors = true;
        }
    }

    public addSourceFile(sourceFile: cs.SourceFile) {
        this.sourceFiles.push(sourceFile);
    }

    /**
     * Resolve a `LazyTypeRef` (or pass-through already-resolved
     * `TypeNode`) in place. The first call on a `LazyTypeRef` runs
     * the `getTypeFromTsType` cascade, merges the resolved node's
     * properties onto `node` (preserving the "no rewiring needed"
     * invariant: every existing slot/array/parent reference stays
     * valid), and stores a self-reference in `node.resolved` so
     * subsequent calls short-circuit. Returns `null` only if the
     * cascade fails to produce a concrete type.
     *
     * `resolveLazyTypeRef` is the name used by the `createLazyTypeRef`
     * closure; `resolveType` is the spelling used inside the resolver
     * cascade when walking type-argument arrays. Both go through the
     * same body.
     */
    public resolveType(node: cs.LazyTypeRef): cs.TypeNode | null {
        return this.resolveLazyTypeRef(node);
    }

    public resolveLazyTypeRef(node: cs.LazyTypeRef): cs.TypeNode | null {
        if (node.resolved) {
            return node.resolved;
        }

        if (node.nodeType !== cs.SyntaxKind.LazyTypeRef) {
            return node;
        }

        if (!node.tsNode) {
            throw new Error('Node must be set for all types');
        }

        const resolved = this.typeResolver.getTypeFromTsType(
            node,
            node.tsType,
            node.tsSymbol,
            node.typeArguments,
            node.tsNode
        );

        if (resolved) {
            const wasNullable = node.isNullable;
            for (const prop of Object.getOwnPropertyNames(node)) {
                delete (node as any)[prop];
            }
            for (const prop of Object.getOwnPropertyNames(resolved)) {
                (node as any)[prop] = (resolved as any)[prop];
            }
            if (wasNullable) {
                (node as cs.TypeNode).isNullable = true;
            }
            // Self-reference: subsequent reads short-circuit.
            (node as any).resolved = node;
            return node;
        }

        return null;
    }

    /** Type classification: TS-boolean / global `Boolean` symbol. Used by `SmartCastResolver`. */
    public isBooleanType(type: ts.Type) {
        if (!type) {
            return false;
        }
        return (type.symbol && type.symbol.name === 'Boolean') || type === this.typeChecker.getBooleanType();
    }

    /** Type classification: `@record` JSDoc tag or type-alias-of-type-literal shape. */
    public isRecord(d: ts.Declaration) {
        return hasTag(d, JsDocTag.record) || (ts.isTypeAliasDeclaration(d) && ts.isTypeLiteralNode(d.type));
    }

    /** Type classification: `@discriminated` JSDoc tag (Kotlin sealed-class emission). */
    public isDiscriminatedUnion(node: ts.Declaration) {
        return hasTag(node, JsDocTag.discriminated);
    }

    public resolveExternalModuleOfType(tsSymbol: ts.Symbol): string | undefined {
        // External-module name mapping is performed by an explicit symbol-name
        // switch below. A more principled approach would walk the import
        // declaration that brought the symbol into the current module and apply
        // a configurable mapping table, but the TypeScript compiler API does not
        // expose a clean way to recover the originating import for a resolved
        // symbol; the manual switch is therefore intentional, not a placeholder.

        switch (tsSymbol.name) {
            case 'AlphaSkiaCanvas':
            case 'AlphaSkiaImage':
            case 'AlphaSkiaTextAlign':
            case 'AlphaSkiaTextBaseline':
            case 'AlphaSkiaTypeface':
            case 'AlphaSkiaTextStyle':
            case 'AlphaSkiaTextMetrics':
                return `${this.alphaSkiaModule()}.`;
        }

        return undefined;
    }

    public alphaSkiaModule(): string {
        return this.strategy.alphaSkiaModule();
    }

    public createArrayListType(_tsSymbol: ts.Symbol, node: cs.Node, arrayElementType: cs.TypeNode): cs.TypeNode {
        return {
            nodeType: cs.SyntaxKind.ArrayTypeNode,
            parent: node.parent,
            tsNode: node.tsNode,
            elementType: arrayElementType
        } as cs.ArrayTypeNode;
    }

    public createMapType(
        _symbol: ts.Symbol,
        node: cs.Node,
        mapKeyType: cs.TypeNode | null,
        mapValueType: cs.TypeNode | null
    ): cs.TypeNode {
        return {
            nodeType: cs.SyntaxKind.MapTypeNode,
            parent: node.parent,
            tsNode: node.tsNode,
            keyType: mapKeyType,
            valueType: mapValueType,
            valueIsValueType: this.isPrimitiveOrEnumType(mapValueType),
            keyIsValueType: this.isPrimitiveOrEnumType(mapKeyType)
        } as cs.MapTypeNode;
    }

    public isPrimitiveOrEnumType(mapValueType: cs.TypeNode | null): boolean {
        if (mapValueType) {
            switch (mapValueType.nodeType) {
                case cs.SyntaxKind.PrimitiveTypeNode:
                    switch ((mapValueType as cs.PrimitiveTypeNode).type) {
                        case cs.PrimitiveType.Bool:
                        case cs.PrimitiveType.Int:
                        case cs.PrimitiveType.Double:
                            return true;
                    }
                    break;
                case cs.SyntaxKind.TypeReference:
                    const ref = (mapValueType as cs.TypeReference).reference;
                    if (typeof ref !== 'string') {
                        switch (ref.nodeType) {
                            case cs.SyntaxKind.EnumDeclaration:
                                return true;
                            case cs.SyntaxKind.TypeParameterDeclaration:
                                if ((ref as cs.TypeParameterDeclaration).constraint) {
                                    return this.isPrimitiveOrEnumType((ref as cs.TypeParameterDeclaration).constraint!);
                                }
                                return false;
                        }
                    }
                    break;
                case cs.SyntaxKind.LazyTypeRef:
                    // Conservative default: at construction time the lazy ref
                    // may not be resolvable yet (sibling source files have not
                    // yet registered their type declarations). Treating it as
                    // a reference type here keeps the Map<> spelling; if the
                    // resolved value-type semantics differ they are recomputed
                    // at print time when all symbols are available.
                    return false;
            }
        }
        return false;
    }

    public createBasicFunctionType(node: cs.Node, returnType: cs.TypeNode, parameterTypes: cs.TypeNode[]): cs.TypeNode {
        return {
            nodeType: cs.SyntaxKind.FunctionTypeNode,
            parent: node.parent,
            tsNode: node.tsNode,
            parameterTypes: parameterTypes,
            returnType: returnType
        } as cs.FunctionTypeNode;
    }

    public makeArrayTupleType(parent: cs.Node, typeArguments: readonly ts.Type[]): cs.ArrayTupleNode {
        const ref = {
            parent,
            nodeType: cs.SyntaxKind.ArrayTupleNode
        } as cs.ArrayTupleNode;

        ref.types = typeArguments.map(x => this.typeResolver.getTypeFromTsType(ref, x)!);

        return ref;
    }

    public makeExceptionType(): string {
        return this.strategy.makeExceptionType();
    }

    public makeIterableType(): string {
        return this.strategy.makeIterableType();
    }

    public makeIteratorType(): string {
        return this.strategy.makeIteratorType();
    }

    public makeGeneratorType(): string {
        return this.strategy.makeGeneratorType();
    }

    public makeTypeName(tsName: string): string {
        return makeTypeName(
            tsName,
            s => this.toTypeNameCase(s),
            s => this.toNamespaceNameCase(s)
        );
    }

    public buildCoreNamespace(aliasSymbol?: ts.Symbol) {
        let suffix = '';

        if (aliasSymbol) {
            if (aliasSymbol.name === TsBuiltin.Map) {
                return `${this.toNamespaceNameCase('alphaTab.collections') + suffix}.`;
            }

            if (aliasSymbol.name === TsBuiltin.Error) {
                return '';
            }

            if (aliasSymbol.declarations) {
                for (const decl of aliasSymbol.declarations) {
                    let fileName = path.basename(decl.getSourceFile().fileName).toLowerCase();
                    if (fileName.startsWith('lib.') && fileName.endsWith('.d.ts')) {
                        fileName = fileName.substring(4, fileName.length - 5);
                        if (fileName.length) {
                            suffix = fileName.split('.').map(s => {
                                if (s.match(/webworker/i)) {
                                    return `.${this.toNamespaceNameCase('ecmaScript')}`;
                                }
                                if (s.match(/esnext/)) {
                                    return `.${this.toNamespaceNameCase('ecmaScript')}`;
                                }
                                if (s.match(/es[0-9]{4}/)) {
                                    return `.${this.toNamespaceNameCase('ecmaScript')}`;
                                }
                                if (s.match(/es[0-9]{1}/)) {
                                    return `.${this.toNamespaceNameCase('ecmaScript')}`;
                                }
                                return `.${this.toNamespaceNameCase(s)}`;
                            })[0];
                        }
                    }
                }
            }
        }

        return `${this.toNamespaceNameCase(AlphaTabCore.coreNamespace) + suffix}.`;
    }
    public toCoreTypeName(s: string): string {
        return this.strategy.toCoreTypeName(s);
    }

    public getNameFromSymbol(symbol: ts.Symbol): string {
        return this.strategy.getNameFromSymbol(symbol);
    }

    /** Type classification: is the type (or any non-null/undefined union member) an `Iterable` shape per `globals.isIterable`. */
    public isIterable(type: ts.Type) {
        if (type.isUnion()) {
            for (const t of type.types) {
                if ((t.flags & ts.TypeFlags.Null) !== 0) {
                    // nullable
                } else if ((t.flags & ts.TypeFlags.Undefined) !== 0) {
                    // optional
                } else if (this.isIterable(t)) {
                    return true;
                }
            }

            return false;
        }

        if (this.globals.isIterable(type)) {
            return true;
        }

        return false;
    }

    /** Type classification: union contains `null` or `undefined` (Kotlin nullability gate). */
    public isNullableType(declaredType: ts.Type): boolean {
        return (
            declaredType.isUnion() &&
            !!declaredType.types.find(t => t.flags & ts.TypeFlags.Null || t.flags & ts.TypeFlags.Undefined)
        );
    }

    /** Type classification: symbol's declarations include a function-type node (callable shape). */
    public isFunctionType(contextualType: ts.Type): boolean {
        if (!contextualType.symbol || !contextualType.symbol.declarations) {
            return false;
        }
        for (const declaration of contextualType.symbol.declarations) {
            if (ts.isFunctionTypeNode(declaration)) {
                return true;
            }
        }

        return false;
    }

    public markOverride(classElement: ts.ClassElement | ts.TypeElement): (ts.ClassElement | ts.TypeElement)[] {
        let parent: ts.Node = classElement;
        while (parent.kind !== ts.SyntaxKind.ClassDeclaration) {
            if (parent.parent) {
                parent = parent.parent;
            } else {
                return [];
            }
        }

        const classDecl = parent as ts.ClassDeclaration;
        // Per-target override-lookup tweak (Kotlin allows interface
        // members; C# does not). The strategy supplies the boolean as
        // plain data so the walk can run on the context directly.
        const overridden = this.getOverriddenMembers(
            classDecl,
            classElement,
            false,
            this.strategy.overrideLookupAllowsInterfaces
        );
        if (overridden.length > 0) {
            const member =
                this.typeChecker.getSymbolAtLocation(classElement) ??
                this.typeChecker.getSymbolAtLocation(classElement.name!);
            this.symbols.markOverride(member, overridden);
        }

        return overridden;
    }

    /**
     * Flexible 4-arg override lookup retained on the context for the
     * transformer's interface-member walk (CSharpAstTransformer.ts:1757
     * passes `allowInterfaces: true`). The 2-arg variant on the
     * `TargetStrategy` interface picks the target-specific defaults
     * (C# excludes interfaces; Kotlin includes them).
     */
    public getOverriddenMembers(
        classType: ts.ClassDeclaration | ts.InterfaceDeclaration,
        classElement: ts.ClassElement | ts.TypeElement,
        includeOwnMembers: boolean = false,
        allowInterfaces: boolean = false
    ): (ts.ClassElement | ts.TypeElement)[] {
        const overriddenItems: (ts.ClassElement | ts.TypeElement)[] = [];
        this.collectOverriddenMembersByName(
            overriddenItems,
            classType,
            classElement.name!.getText(),
            includeOwnMembers,
            allowInterfaces
        );
        return overriddenItems;
    }

    public collectOverriddenMembersByName(
        overriddenItems: (ts.ClassElement | ts.TypeElement)[],
        classType: ts.ClassDeclaration | ts.InterfaceDeclaration,
        memberName: string,
        includeOwnMembers: boolean = false,
        allowInterfaces: boolean = false
    ) {
        const member = classType.members.find(m => m.name?.getText() === memberName);
        if (includeOwnMembers && member) {
            overriddenItems.push(member);
        }

        if (classType.heritageClauses) {
            for (const implementsClause of classType.heritageClauses) {
                for (const typeSyntax of implementsClause.types) {
                    const declarations = this.typeChecker.getTypeFromTypeNode(typeSyntax)?.symbol.declarations;
                    if (declarations) {
                        for (const decl of declarations) {
                            if (ts.isClassDeclaration(decl) || (allowInterfaces && ts.isInterfaceDeclaration(decl))) {
                                this.collectOverriddenMembersByName(overriddenItems, decl, memberName, true, true);
                            }
                        }
                    }
                }
            }
        }
    }

    /** Type classification: a non-null `expr!` whose declared TS type is a value type (after `getNonNullableType`). */
    public isValueTypeExpression(expression: ts.NonNullExpression) {
        let tsType: ts.Type;
        if (ts.isIdentifier(expression.expression)) {
            const symbol = this.typeChecker.getSymbolAtLocation(expression.expression);
            if (symbol?.valueDeclaration) {
                tsType = this.typeChecker.getTypeAtLocation(symbol.valueDeclaration);
            } else {
                tsType = this.typeChecker.getTypeAtLocation(expression);
            }
        } else {
            tsType = this.typeChecker.getTypeAtLocation(expression);
        }

        tsType = this.typeChecker.getNonNullableType(tsType);

        return this.isValueType(tsType);
    }

    /** Type classification: number/boolean primitive (including literals) or enum. */
    public isValueType(tsType: ts.Type) {
        // primitives
        if ((tsType.flags & ts.TypeFlags.Number) !== 0 || (tsType.flags & ts.TypeFlags.NumberLiteral) !== 0) {
            return true;
        }
        if ((tsType.flags & ts.TypeFlags.Boolean) !== 0 || (tsType.flags & ts.TypeFlags.BooleanLiteral) !== 0) {
            return true;
        }

        return this.isEnum(tsType);
    }

    /** Type classification: TS-flag check for `Enum` / `EnumMember`, including unions of literal enum members. */
    public isEnum(tsType: ts.Type) {
        // enums
        if (tsType.symbol && tsType.symbol.flags & ts.SymbolFlags.Enum) {
            return true;
        }
        if (tsType.symbol && tsType.symbol.flags & ts.SymbolFlags.EnumMember) {
            return true;
        }
        if (tsType.flags & ts.TypeFlags.EnumLiteral) {
            return true;
        }

        // enums disguised as union
        if (tsType.isUnion() && (tsType as ts.UnionType).types.length > 0) {
            let isEnum = true;
            for (const t of (tsType as ts.UnionType).types) {
                if (
                    !t.symbol ||
                    (!(t.symbol.flags & ts.SymbolFlags.Enum) && !(t.symbol.flags & ts.SymbolFlags.EnumMember))
                ) {
                    isEnum = false;
                    break;
                }
            }
            if (isEnum) {
                return true;
            }
        }

        return false;
    }

    /** Type classification: `@internal` JSDoc tag (visibility hint, see `JsDocTag.internal`). */
    public isInternal(node: ts.Node) {
        return hasTag(node, JsDocTag.internal);
    }

    public getDelegatedName(tsSymbol: ts.Symbol | undefined): string | null {
        if (!tsSymbol || !tsSymbol.declarations) {
            return null;
        }

        for (const declaration of tsSymbol.declarations) {
            const delegation = findTagWithComment(
                declaration,
                JsDocTag.delegated,
                c => c !== undefined && c.indexOf(this.targetTag) >= 0
            );
            if (delegation) {
                return getTagComment(delegation)!.substring(this.targetTag.length + 1);
            }
        }

        return null;
    }

    public get targetTag(): string {
        return this.strategy.targetTag;
    }

    /** Type classification: enum-member or any declaration carrying the `static` modifier. */
    public isStaticSymbol(tsSymbol: ts.Symbol) {
        return (
            (tsSymbol.flags & ts.SymbolFlags.EnumMember) !== 0 ||
            !!tsSymbol.declarations?.find(
                d =>
                    'modifiers' in d &&
                    d.modifiers &&
                    !!(d.modifiers as ts.NodeArray<ts.Modifier>).find(m => m.kind === ts.SyntaxKind.StaticKeyword)
            )
        );
    }

    public getDefaultUsings(): string[] {
        return this.strategy.getDefaultUsings();
    }

    public buildMethodName(propertyName: ts.PropertyName) {
        let methodName: string = '';
        if (ts.isIdentifier(propertyName)) {
            methodName = propertyName.text;
        } else if (ts.isComputedPropertyName(propertyName)) {
            if (ts.isPropertyAccessExpression(propertyName.expression)) {
                const symbol = this.symbols.getSymbolForDeclaration(propertyName.expression);
                if (symbol) {
                    methodName = this.getNameFromSymbol(symbol);
                }
            } else if (ts.isStringLiteral(propertyName)) {
                methodName = (propertyName as ts.StringLiteral).text;
            } else {
                methodName = `<invalid method name ${propertyName.getText()}>`;
                this.addTsNodeDiagnostics(propertyName, 'Unsupported method name syntax', ts.DiagnosticCategory.Error);
            }
        } else if (ts.isStringLiteral(propertyName)) {
            methodName = propertyName.text;
        } else if (ts.isPrivateIdentifier(propertyName)) {
            methodName = propertyName.text.substring(1);
        }

        if (!methodName) {
            methodName = `<invalid method name ${propertyName.getText()}>`;
            this.addTsNodeDiagnostics(propertyName, 'Unsupported method name syntax', ts.DiagnosticCategory.Error);
        }

        return this.toMethodNameCase(methodName);
    }

    /** Type classification: expression resolves (directly, via alias, or via union) to an `ArrayTuple` instance. */
    public isSymbolArrayTupleInstance(expression: ts.Expression) {
        const symbol = this.typeChecker.getSymbolAtLocation(expression);
        let type: ts.Type;
        if (symbol) {
            type = this.typeChecker.getTypeOfSymbolAtLocation(symbol!, expression);
            if (this.typeChecker.isTupleType(type)) {
                return true;
            }

            type = this.typeChecker.getTypeOfSymbol(symbol!);
            if (this.typeChecker.isTupleType(type)) {
                return true;
            }

            if (type.aliasSymbol) {
                const alias = type.aliasSymbol;
                type = this.typeChecker.getTypeOfSymbol(alias);
                if (this.typeChecker.isTupleType(type)) {
                    return true;
                }

                type = this.typeChecker.getDeclaredTypeOfSymbol(alias);
                if (this.typeChecker.isTupleType(type)) {
                    return true;
                }

                if (type.isUnion()) {
                    let tupleTypes = 0;
                    for (const t of type.types) {
                        if (this.typeChecker.isTupleType(t)) {
                            tupleTypes++;
                        } else if (t === this.typeChecker.getNullType()) {
                            tupleTypes++; // nullable tuple
                        }
                    }

                    if (tupleTypes === type.types.length) {
                        return true;
                    }
                }
            }
        }

        type = this.typeChecker.getTypeAtLocation(expression);
        if (this.typeChecker.isTupleType(type)) {
            return true;
        }

        return false;
    }
}
