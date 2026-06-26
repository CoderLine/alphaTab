# Transpiler syntax and runtime support reference

Cross-check this document before writing TypeScript that will be transpiled to C# and/or Kotlin.

**Status values:** `✅ yes` · `⚠️ partial` · `❌ no`

---

## Top-level declarations

| Construct | Status | Notes |
|-----------|--------|-------|
| `class` (concrete, abstract) | ✅ yes | Fields, methods, constructors, `extends`, `implements`; generic type parameters with optional constraints |
| `interface` | ✅ yes | Extends multiple interfaces; generic type parameters |
| `enum` (numeric) | ✅ yes | Members may have explicit numeric initialisers |
| `enum` (string-initialised members) | ❌ no | Transformer passes string initialisers through unguarded → invalid C#/Kotlin. Use numeric enums only. |
| `type` alias — function shape | ✅ yes | Emitted as a delegate |
| `type` alias — `T \| null` / `T \| undefined` | ✅ yes | Emitted as nullable `T` |
| `type` alias — `@discriminated` union | ✅ yes | Base interface + one class per member with discriminator field |
| `type` alias — union of distinct non-null types | ⚠️ partial | Collapses to `object` with warning. Workaround: common base class/interface or `@discriminated`. |
| `type` alias — intersection (`T & U`) | ⚠️ partial | `T & {}` (NonNullable) works; multiple distinct operands → `object` |
| `type` alias — inline type literal (`{ a: number }`) | ❌ no | `Unsupported internal type of kind TypeLiteral`. Workaround: named class/interface. |
| `import` declaration | ✅ yes | Consumed for symbol resolution; not emitted |
| `export default class/interface/enum` | ✅ yes | Becomes the namespace member; `@public` JsDoc overrides visibility |
| Named export in the same file | ✅ yes | Added as sibling in the same namespace |
| Global variable declaration | ❌ no | `Global statements in modules are not yet supported`. Workaround: wrap in a static class. |
| Global function declaration | ❌ no | Same error as global variable. Workaround: static method on a class. |
| Namespace / module merging | ❌ no | Workaround: flat file-per-class layout |

---

## Class members

| Construct | Status | Notes |
|-----------|--------|-------|
| Property (`public`/`protected`/`private`, `readonly`, `static`, initialiser) | ✅ yes | `readonly` honoured; `static readonly` → `const` candidate |
| Property accessor pair (`get` + `set`) | ✅ yes | C# property / Kotlin `var` |
| Get-only accessor | ✅ yes | C# computed property / Kotlin `val` |
| Method (`public`/`protected`/`private`, `static`, `abstract`, `override`) | ✅ yes | Generic type parameters supported |
| Constructor | ✅ yes | Parameters with optional defaults; calls `super()` |
| `async` method | ✅ yes | `Task<T>` / Kotlin `suspend fun` |
| Generator method (`function*` / `yield`) | ✅ yes | `IEnumerator<T>` / Kotlin `Iterator<T>` |
| Generator `TReturn` type parameter | ⚠️ partial | `yield` works; return type collapses to `IEnumerator<TYield>` |
| `@partial` tag | ✅ yes | `partial class` in C# / `Partials` companion in Kotlin |
| `@target csharp` / `@target kotlin` / `/*@target web*/` | ✅ yes | Conditionally skips emit on the non-matching target |
| `@delegated` tag | ✅ yes | Member body delegated to a per-target hand-written partial |
| `@lateinit` tag (Kotlin only) | ✅ yes | Property emitted as `lateinit var` |

---

## Statements

| Construct | Status | Notes |
|-----------|--------|-------|
| Block `{ }` | ✅ yes | |
| `var` declaration | ✅ yes | Maps to mutable binding |
| `let` declaration | ✅ yes | Maps to mutable binding |
| `const` declaration | ✅ yes | Maps to mutable binding; does not produce a `readonly` member |
| Array destructuring in variable declaration | ✅ yes | `const [a, b] = expr` → tuple deconstruct |
| Object destructuring in variable declaration | ❌ no | Workaround: temporary variable + explicit property access |
| Rest/spread destructuring | ❌ no | Workaround: manual decomposition. Spread in call args (`...args`) is supported. |
| `if` / `else` | ✅ yes | |
| `do…while` loop | ✅ yes | |
| `while` loop | ✅ yes | |
| `for` loop (C-style) | ✅ yes | |
| `for…of` loop | ✅ yes | Arrays and iterables; initialiser may be a new variable or existing variable |
| `for…of` with destructuring initialiser | ❌ no | Workaround: destructure manually inside the loop body |
| `for…in` loop | ✅ yes | Over object keys; emitted as `foreach` over keys |
| `switch` / `case` / `default` | ✅ yes | Implicit fallthrough preserved (may require explicit `goto case` in C#) |
| `break` (unlabelled) | ✅ yes | |
| `continue` (unlabelled) | ✅ yes | |
| `break <label>` | ❌ no | Workaround: boolean flag or extracted function |
| `continue <label>` | ❌ no | Workaround: boolean flag or extracted function |
| Labelled statement | ❌ no | Workaround: boolean flag or extracted function |
| `return` | ✅ yes | |
| `throw` | ✅ yes | |
| `try` / `catch` / `finally` | ✅ yes | |
| `with` statement | ❌ no | Workaround: explicit property access |
| `debugger` statement | ✅ yes | Silently dropped |
| Empty statement | ✅ yes | Silently dropped |
| Local function declaration inside a method | ✅ yes | Emitted as a local lambda |

---

## Expressions

| Construct | Status | Notes |
|-----------|--------|-------|
| Numeric literal (int, float, `0x`/`0b`/`0o`) | ✅ yes | |
| `bigint` literal (`123n`) | ✅ yes | Emitted as `long` cast |
| String literal | ✅ yes | |
| Template literal (interpolated string) | ✅ yes | |
| Tagged template expression | ❌ no | Workaround: regular function call |
| Boolean literal | ✅ yes | |
| `null` | ✅ yes | |
| `this` | ✅ yes | |
| `super` | ✅ yes | |
| Identifier | ✅ yes | |
| Parenthesised expression | ✅ yes | |
| Unary prefix (`!`, `~`, `-`, `+`) | ✅ yes | |
| Prefix increment / decrement (`++x`, `--x`) | ✅ yes | |
| Postfix increment / decrement (`x++`, `x--`) | ✅ yes | |
| Binary arithmetic (`+`, `-`, `*`, `/`, `%`) | ✅ yes | `number + string` coerces via `toInvariantString` |
| Bitwise operators (`&`, `\|`, `^`, `~`) | ✅ yes | Integer-range wrapping applied |
| Shift operators (`<<`, `>>`, `>>>`) | ✅ yes | `>>>` maps to `>>` |
| Logical AND (`&&`) | ✅ yes | |
| Logical OR (`\|\|`) | ✅ yes | |
| Nullish coalescing (`??`) | ✅ yes | |
| Compound assignment (all TS compound ops incl. `??=`, `\|\|=`, `&&=`) | ✅ yes | Bitwise compound ops decomposed into full expression |
| Comparison (`<`, `<=`, `>`, `>=`) | ✅ yes | |
| Equality (`==`, `===`) | ✅ yes | Both map to `==` |
| Inequality (`!=`, `!==`) | ✅ yes | Both map to `!=` |
| `instanceof` | ✅ yes | Emitted as `is` expression |
| `in` | ✅ yes | Emitted as `TypeHelper.In` |
| Conditional (`? :`) | ✅ yes | |
| Assignment (`=`) | ✅ yes | |
| Property access (`a.b`) | ✅ yes | |
| Optional chaining property access (`a?.b`) | ✅ yes | `?.` / null-conditional in both targets |
| Optional chaining index access (`a?.[i]`) | ✅ yes | |
| Optional chaining call (`a?.()`) | ✅ yes | |
| Non-null assertion (`a!`) | ✅ yes | Stripped at IR level; no runtime effect |
| `as` cast / `<Type>` type assertion | ✅ yes | Emitted as cast expression |
| Element / index access (`a[i]`) | ✅ yes | Array/TypedArray indices cast to `int` |
| Dynamic tuple index access (`tuple[expr]`) | ⚠️ partial | Numeric literal index → member access; non-literal index → error |
| Call expression | ✅ yes | |
| Optional-chain call | ✅ yes | |
| `new` expression | ✅ yes | Typed-array and collection constructors specially handled |
| Arrow function (`=>`) | ✅ yes | Block or expression body |
| Function expression | ✅ yes | Named or anonymous |
| Array literal `[…]` | ✅ yes | Emitted as list/array creation; tuple context detected |
| Object literal | ✅ yes | Object initialiser; `@record` promotes to `IRecord` class |
| `set` accessor on object literal | ❌ no | Error: `Set accessor declarations in object literals not supported` |
| Array destructuring assignment (`[a, b] = expr`) | ✅ yes | Tuple deconstruct assignment |
| Object destructuring assignment | ❌ no | Workaround: temporary variable + explicit property access |
| Nested / rest tuple deconstruction | ❌ no | Error: `Unsupported tuple destruction` |
| Spread in call args (`...args`) | ✅ yes | |
| `yield` | ✅ yes | |
| `yield*` | ✅ yes | |
| `await` | ✅ yes | |
| `typeof` | ✅ yes | Emitted as `typeof(T)` |
| `delete` | ❌ no | Workaround: assign `null`/`undefined` or use `Map.delete` |
| `void` | ❌ no | Workaround: drop the expression or restructure |
| Class expression (`const C = class { … }`) | ❌ no | Workaround: named class declaration |
| JSX / JsxExpression | ❌ no | Transpiler targets C#/Kotlin only |

---

## Runtime library support

alphaTab ships hand-written C# and Kotlin implementations of a **subset** of the ECMAScript standard library. There is no API parity guarantee — only the methods alphaTab itself uses are implemented. The notes column lists what is available; anything not mentioned is absent.

| TypeScript type | Status | Supported API |
|----------------|--------|---------------|
| `Array<T>` / `T[]` | ⚠️ partial | Construction, index read/write, `length`, `push`, `pop`, `splice`, `slice`, `indexOf`, `lastIndexOf`, `sort`, `reverse`, `join`, `forEach`, `filter`, `map`, `find`, `findIndex`, `some`, `every`, `fill`; static `Array.from()`, `Array.isArray()` |
| `Map<K, V>` | ⚠️ partial | `size`, `has()`, `get()`, `set()`, `delete()`, `clear()`, `keys()`, `values()`, `entries()` |
| `Set<T>` | ⚠️ partial | `size`, `add()`, `has()`, `delete()`, `clear()`, `forEach()` |
| `Promise<T>` / `async`/`await` | ✅ yes | Full `async`/`await` mapping; `Promise.resolve()`, `Promise.race()` |
| `PromiseLike<T>` | ⚠️ partial | Filtered out of union types; not usable as a standalone return type |
| `Iterable<T>` | ✅ yes | Type mapping only (`IEnumerable<T>` / Kotlin `Iterable<T>`) |
| `Iterator<T>` | ✅ yes | Type mapping only (`IEnumerator<T>` / Kotlin `Iterator<T>`) |
| `Generator<T>` | ✅ yes | Type mapping only (`IEnumerator<T>` / Kotlin `Iterator<T>`) |
| `ArrayLike<T>` | ⚠️ partial | Used for type narrowing only; no dedicated emit type |
| `ReadonlyArray<T>` | ⚠️ partial | Mapped to mutable `Array<T>`; type-checker accepts it |
| `ReadonlyMap<K, V>` | ⚠️ partial | Mapped to mutable `Map<K,V>`; type-checker accepts it |
| `ReadonlySet<T>` | ⚠️ partial | Mapped to mutable `Set<T>`; type-checker accepts it |
| `Uint8Array` | ⚠️ partial | Index read/write, `length`, `buffer`, `byteOffset`, `byteLength`, `subarray()`, `set()`, `fill()` |
| `Uint16Array` | ⚠️ partial | Same as `Uint8Array` |
| `Uint32Array` | ⚠️ partial | Same as `Uint8Array` |
| `Int8Array` | ❌ no | No runtime class |
| `Int16Array` | ⚠️ partial | Same as `Uint8Array` |
| `Int32Array` | ⚠️ partial | Same as `Uint8Array` |
| `Float32Array` | ⚠️ partial | Same as `Uint8Array` |
| `Float64Array` | ⚠️ partial | Same as `Uint8Array` |
| `ArrayBuffer` | ⚠️ partial | `byteLength` only |
| `DataView` | ⚠️ partial | `getInt16()`, `getFloat32()` only |
| `Error` | ⚠️ partial | Construction + `message`; maps to `Exception` / `Throwable` |
| `RegExp` | ⚠️ partial | `exec()`, `replace()`, `split()`; flags supported. No `test()`, no named groups |
| `Math` | ✅ yes | All standard static methods and constants |
| `Number` | ⚠️ partial | `isNaN()`, `parseInt()`, `parseFloat()`, `MAX_SAFE_INTEGER`, `MIN_SAFE_INTEGER`, `POSITIVE_INFINITY`, `NaN`. No instance methods (`toFixed`, etc.) |
| `String` (static) | ⚠️ partial | `String.fromCharCode()`, `String.fromCodePoint()`. Instance string methods are native to the target language, not wrapped |
| `JSON` | ⚠️ partial | `stringify()` for strings only. No `parse()` |
| `Date` | ⚠️ partial | `Date.now()` only |
| `TextEncoder` | ⚠️ partial | `encode()` only |
| `TextDecoder` | ⚠️ partial | `decode()` only |
| `MessageEvent` | ⚠️ partial | Construction + `data` property |
| `bigint` | ✅ yes | Maps to `long` / `Long`; `BigInt(x)` cast helper |
| Tuple `[T1, T2, …]` | ✅ yes | Construction and indexed member access |
| `Symbol` (runtime values) | ❌ no | `Symbol.iterator` / `Symbol.dispose` rewired to target method names; arbitrary symbol values not supported |
| `WeakMap<K, V>` | ❌ no | No runtime class |
| `WeakSet<T>` | ❌ no | No runtime class |
| `WeakRef<T>` | ❌ no | No runtime class |
| `FinalizationRegistry` | ❌ no | |
| `Proxy` | ❌ no | |
| `Reflect` | ❌ no | |
| `SharedArrayBuffer` | ❌ no | |
| `Atomics` | ❌ no | |
| `Intl.*` | ❌ no | |
| `fetch` | ❌ no | Target is native C#/Kotlin, not browser |
| `XMLHttpRequest` | ❌ no | |
| DOM types | ❌ no | |
| `setTimeout` | ❌ no | |
| `setInterval` | ❌ no | |
| `clearTimeout` | ❌ no | |
| `clearInterval` | ❌ no | |
| `console.*` | ⚠️ partial | `Logger` calls routed; raw `console.*` has no mapping |
| `Partial<T>` | ❌ no | Resolves to inline type the IR cannot represent |
| `Required<T>` | ❌ no | |
| `Pick<T, K>` | ❌ no | |
| `Omit<T, K>` | ❌ no | |
| Mapped types | ❌ no | |

---

## Test fixture coverage

| Fixture | What it covers |
|---------|----------------|
| `test/fixtures/_smoke/` | Minimal class with a template-string method; full emit pipeline smoke test |
| `test/fixtures/classes/getters-setters/` | `get`/`set` pair, get-only accessor, ternary in setter body |
| `test/fixtures/expressions/binary/` | Integer bit-ops with wrapping, compound bit-op assignment, arithmetic, string+number concat, `in`, `instanceof` |
| `test/fixtures/types/builtins/` | `Array<T>`, `number[]`, `Map<K,V>`, `Iterable<T>`, `async`/`Promise<T>`, `length` property |
| `test/fixtures/types/nullable-and-union/` | `T \| null`, `T \| undefined`, `??`, `!`, optional chaining `?.`, literal union |
| `test/fixtures/types/primitives/` | All primitive type mappings (`bool`, `string`, `number` as `double`/`int` via `@target int`, `void`, `object`) |
