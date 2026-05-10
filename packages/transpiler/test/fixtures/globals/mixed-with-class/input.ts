/**
 * Default-exported class alongside top-level helpers. Both should emit
 * side-by-side: the class as itself, the helpers inside `InputGlobals`.
 *
 * @public
 */
export default class Calculator {
    public add(a: number, b: number): number {
        return clamp(a + b);
    }
}

/**
 * @public
 */
export function clamp(n: number): number {
    if (n < 0) {
        return 0;
    }
    return n;
}
