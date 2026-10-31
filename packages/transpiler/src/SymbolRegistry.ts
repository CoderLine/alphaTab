import ts from 'typescript';
import * as cs from './ir/Ir';

type SymbolKey = string;

/**
 * Per-program symbol bookkeeping extracted from `EmitterContextBase`.
 *
 * The registry owns three caches keyed by a stable string identity
 * (`keyOf(symbol)`):
 *  - the IR node for each registered TS symbol (populated by `register`,
 *    consulted by `resolve` and by the type-name cascade in
 *    `EmitterContextBase.getSymbolName`),
 *  - the set of symbols marked virtual / overridden by `markOverride`,
 *  - the set of symbols emitted as `const` fields (`markConst` /
 *    `isConst`).
 *
 * The registry also exposes the TS-API thin helper
 * `getSymbolForDeclaration` that drives `register` (and is re-used by
 * several call sites in the transformer when attaching `tsSymbol` to a
 * freshly-built IR node).
 *
 * Composed onto `EmitterContextBase` as `context.symbols`, mirroring
 * the pattern of `SmartCastResolver` (`context.smartCast`),
 * `TypeResolver` (`context.typeResolver`), and `GlobalTypeCache`
 * (`context.globals`).
 */
export default class SymbolRegistry {
    private readonly _typeChecker: ts.TypeChecker;
    private readonly _onRegisterFailure: (node: cs.NamedElement & cs.Node) => void;
    private readonly symbolLookup: Map<SymbolKey, cs.NamedElement & cs.Node> = new Map();
    private readonly virtualSymbols: Map<SymbolKey, boolean> = new Map();
    private readonly symbolConst: Map<SymbolKey, boolean> = new Map();

    /**
     * `onRegisterFailure` is invoked when `register` cannot derive a TS
     * symbol for the node. Wired by the context to its diagnostic
     * pipeline so the registry stays free of any back-reference to the
     * surrounding context (the anti-pattern Backlog-3 fought to remove).
     */
    public constructor(typeChecker: ts.TypeChecker, onRegisterFailure: (node: cs.NamedElement & cs.Node) => void) {
        this._typeChecker = typeChecker;
        this._onRegisterFailure = onRegisterFailure;
    }

    /**
     * Stable string key identifying a TS symbol within this program.
     * Aliases are resolved to their target symbol first; the key is
     * derived from the symbol name plus the declaration's
     * file-name/position to disambiguate distinct declarations that
     * share a name. Anonymous symbols (`__foo`) collapse to `__`.
     */
    public keyOf(symbol: ts.Symbol | undefined): SymbolKey {
        if (!symbol) {
            return '';
        }

        if (symbol.flags & ts.SymbolFlags.Alias) {
            symbol = this._typeChecker.getAliasedSymbol(symbol);
        }

        const declaration = symbol.valueDeclaration
            ? symbol.valueDeclaration
            : symbol.declarations && symbol.declarations.length > 0
              ? symbol.declarations[0]
              : undefined;

        let name = symbol.name;
        if (name.startsWith('__')) {
            name = '__';
        }

        if (declaration) {
            return `${name}_${declaration.getSourceFile().fileName}_${declaration.pos}`;
        }
        return name;
    }

    /**
     * Resolve the TS symbol attached to an arbitrary TS node, falling
     * back to the node's `name` child if the direct lookup misses. Used
     * by `register` and by transformer call sites that need to attach a
     * `tsSymbol` to a freshly-built IR node.
     */
    public getSymbolForDeclaration(node: ts.Node): ts.Symbol | undefined {
        let symbol = this._typeChecker.getSymbolAtLocation(node);
        if (!symbol) {
            const name = (node as any).name;
            if (name) {
                symbol = this._typeChecker.getSymbolAtLocation(name);
            }
        }
        return symbol;
    }

    /**
     * Register an IR node under its TS symbol's key so future lookups
     * by symbol (`resolve`) or by name (`EmitterContextBase.getSymbolName`)
     * can recover the emitted declaration. Invokes the constructor-
     * supplied failure callback (typically an error-diagnostic) when no
     * symbol can be derived.
     */
    public register(node: cs.NamedElement & cs.Node): void {
        const symbol = node.tsSymbol ?? this.getSymbolForDeclaration(node.tsNode!);
        if (symbol) {
            const symbolKey = this.keyOf(symbol);
            this.symbolLookup.set(symbolKey, node);
        } else {
            this._onRegisterFailure(node);
        }
    }

    /** Look up the IR node previously registered for `symbol`, if any. */
    public resolve(symbol: ts.Symbol): (cs.NamedElement & cs.Node) | undefined {
        const symbolKey = this.keyOf(symbol);
        return this.symbolLookup.get(symbolKey);
    }

    /**
     * Iterate every registered top-level type declaration. Exposed so
     * whole-program passes (e.g. `RewriteVisibilitiesPass`) can walk
     * the symbol table without reaching into private state.
     */
    public iterateRegisteredTypes(): Iterable<cs.NamedTypeDeclaration> {
        const lookup = this.symbolLookup;
        return (function* () {
            for (const node of lookup.values()) {
                switch (node.nodeType) {
                    case cs.SyntaxKind.ClassDeclaration:
                    case cs.SyntaxKind.EnumDeclaration:
                    case cs.SyntaxKind.InterfaceDeclaration:
                    case cs.SyntaxKind.DelegateDeclaration:
                        yield node as cs.NamedTypeDeclaration;
                        break;
                }
            }
        })();
    }

    /**
     * Mark `member` and every member it overrides as virtual. The
     * caller has already resolved the overridden-member set via the
     * per-target strategy; this method only flips the virtual bit on
     * each participating symbol.
     */
    public markOverride(
        member: ts.Symbol | undefined,
        overridden: readonly (ts.ClassElement | ts.TypeElement)[]
    ): void {
        this.virtualSymbols.set(this.keyOf(member), true);
        for (const s of overridden) {
            const overriddenMember =
                this._typeChecker.getSymbolAtLocation(s) ?? this._typeChecker.getSymbolAtLocation(s.name!);
            this.virtualSymbols.set(this.keyOf(overriddenMember), true);
        }
    }

    /** True if `symbol` was previously marked virtual via `markOverride`. */
    public isMarkedVirtual(symbol: ts.Symbol | undefined): boolean {
        return this.virtualSymbols.has(this.keyOf(symbol));
    }

    /** True if the field's TS symbol was tagged for `const` emission. */
    public isConst(declaration: cs.FieldDeclaration): boolean {
        const symbolKey = this.keyOf(declaration.tsSymbol!);
        return this.symbolConst.has(symbolKey);
    }

    /** Tag `symbol` to be emitted as a `const` field. */
    public markConst(symbol: ts.Symbol): void {
        const symbolKey = this.keyOf(symbol);
        this.symbolConst.set(symbolKey, true);
    }
}
