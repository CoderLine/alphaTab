/**
 * Covers top-level functions: one @public, one @internal, called from a
 * class method in the same file (must qualify) and from another helper
 * (must emit bare, since both live in the same wrapper class).
 *
 * @public
 */
export function helper(x: number): number {
    return x * 2;
}

/**
 * @internal
 */
export function combine(a: number, b: number): number {
    // Same-file call from inside the wrapper itself — must emit bare.
    return helper(a) + helper(b);
}

/**
 * @public
 */
export class Consumer {
    public run(value: number): number {
        // Same-file call from a different class — must emit qualified.
        return helper(value);
    }
}
