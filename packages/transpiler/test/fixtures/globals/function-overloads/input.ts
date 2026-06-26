/**
 * Top-level function with overload signatures plus one implementation.
 * Only the implementation should land in the wrapper; the signatures are
 * skipped silently.
 *
 * @public
 */
export function describe(x: number): string;
export function describe(x: string): string;
/**
 * @public
 */
export function describe(x: number | string): string {
    return `value: ${x}`;
}
