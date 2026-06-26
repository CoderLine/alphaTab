/**
 * Covers generic delegate type aliases used as parameter types.
 * Exercises that type arguments are threaded through to the emitted
 * delegate reference (e.g. Predicate<T> -> Predicate<T>, not Predicate).
 *
 * @public
 */
export type Predicate<T> = (value: T) => boolean;

/**
 * @public
 */
export class GenericDelegate {
    public check<T>(value: T, pred: Predicate<T>): boolean {
        return pred(value);
    }
}
