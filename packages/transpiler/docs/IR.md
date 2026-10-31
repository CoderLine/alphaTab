# Transpiler IR

The intermediate representation (IR) is the data structure the transpiler operates on between parsing TypeScript and emitting C# or Kotlin source.

The canonical definitions live in [`Ir.ts`](Ir.ts). Both the C# and Kotlin targets consume the same IR; per-target differences manifest only in:

- the printer (`CSharpAstPrinter` / `KotlinAstPrinter`),
- the per-target strategy hooks declared by [`../src/csharp/TargetStrategy.ts`](../csharp/TargetStrategy.ts).

Import the IR via `import * as cs from '../src/ir/Ir'`. The `cs` alias is historical (the C# target was implemented first); the namespace is the canonical IR shared by all targets.

## Pipeline

The IR moves through three named stages in every emit:

```
TypeScript source
       │
       ▼
1. AstTransformer  ── per-file walk, produces a raw IR SourceFile per TS root
       │
       ▼
2. PassPipeline    ── named whole-program passes mutate the IR in place
       │             (resolve-types, rewrite-visibilities, ...)
       ▼
3. AstPrinter      ── per-file walk, emits .cs/.kt text
```

The transformer is the only stage allowed to allocate new `tsSymbol`-backed nodes from TypeScript. Passes mutate existing nodes (set flags, replace expressions, propagate up the inheritance graph). The printer is read-only over the IR.

## Invariants

The following invariants must hold whenever the IR enters the printer stage:

1. **No `UnresolvedTypeNode`.** Every `TypeNode` reachable from any `SourceFile` must be a concrete kind (`PrimitiveTypeNode`, `ArrayTypeNode`, `MapTypeNode`, `ArrayTupleNode`, `FunctionTypeNode`, `TypeReference`, or a `NamedTypeDeclaration`). The `resolve-types` pass enforces this; retiring `UnresolvedTypeNode` entirely is a planned follow-up.
2. **Every node has a `parent`.** With one documented exception: see "Paren wrapping" below.
3. **Override propagation has run.** After `rewrite-visibilities`, every method or property that overrides a virtual base must have either `isOverride: true` (set by the transformer) or, after the pass, `isVirtual: true` if it is itself an override target. The pass also sets `hasVirtualMembersOrSubClasses` on enclosing types.
4. **Naming conventions applied.** All identifier strings on member-access nodes have already been routed through the target's `toMethodNameCase` / `toPropertyNameCase`; the printer does not re-case.
5. **Smart-cast lowering applied.** The transformer wraps any expression that requires a runtime type narrowing through `SmartCastResolver`. Printers do no type inference of their own.

## Syntax and runtime support reference

A full catalogue of supported constructs, partial support, gaps, and runtime built-in mappings lives in [`SYNTAX.md`](SYNTAX.md). [`LIMITATIONS.md`](LIMITATIONS.md) redirects there.

## Paren wrapping exception

`paren(parent, inner, tsNode)` in [`../csharp/CSharpAstBuilder.ts`](../csharp/CSharpAstBuilder.ts) does **not** rewire `inner.parent`. Several transformer paths (smart-cast walk-up, the `_coerceIntegerBitOp` `nextParent` chain) rely on the inner expression's parent still pointing at its original context to make routing decisions. Code that wraps an expression in parens and then expects to walk up the tree from the inner expression must be aware of this.

## Per-target extension points

The [`TargetStrategy`](../csharp/TargetStrategy.ts) interface enumerates every place the IR's emitted shape can differ between targets:

- naming conventions (4 cases),
- core type name rewriting (`toCoreTypeName`),
- runtime type aliases (`make{Exception,Iterable,Iterator,Generator}Type`),
- module / namespace mapping (`getDefaultUsings`),
- symbol name rewrites (`getNameFromSymbol`, `getClassName`),
- inheritance lookup (`getOverriddenMembers`),
- identifier / module tag (`targetTag`, `alphaSkiaModule`).

Both `CSharpEmitterContext` and `KotlinEmitterContext` implement this interface today (inheritance-based); a planned follow-up converts the relationship to composition (`context` accepts a `TargetStrategy` field).

## Adding a new pass

1. Create a class implementing [`IrPass`](../src/passes/IrPass.ts) under `../src/passes/`.
2. Add it to the pass list of the relevant emitter (`CSharpEmitter.ts` or `KotlinEmitter.ts`).
3. Add a fixture under `test/fixtures/` that exercises the pass's behaviour.
4. Run `npm test` to confirm snapshots still match (byte-identical output is the default; if the pass intentionally changes output, regenerate snapshots with `UPDATE_SNAPSHOTS=1` and document the change).
