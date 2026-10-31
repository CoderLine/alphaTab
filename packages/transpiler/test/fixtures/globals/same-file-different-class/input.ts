/**
 * T1.1 coverage: a top-level `helper()` is invoked from inside a class
 * declared in the same source file. Because the calling class is NOT the
 * wrapper class, the call must emit `InputGlobals.Helper(...)` qualified.
 *
 * @public
 */
export function helper(value: number): number {
    return value + 1;
}

/**
 * @public
 */
export class Sibling {
    public bump(x: number): number {
        return helper(x);
    }
}
