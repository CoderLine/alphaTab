/**
 * Idiomatic JS returns ad-hoc object shapes from helper methods, typed
 * via an inline type literal. The transpiler cannot map an anonymous
 * `{ x: number; y: number }` signature onto the target languages —
 * callers must extract a named `@record` interface or a concrete class.
 *
 * @public
 */
export class AnonObject {
    public make(): { x: number; y: number } {
        return { x: 1, y: 2 };
    }
}
