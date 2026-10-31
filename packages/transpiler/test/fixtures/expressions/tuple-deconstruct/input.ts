/**
 * Covers tuple destructure ASSIGNMENT (not declaration).
 * `[a, b] = [b, a]` should reassign both locals.
 *
 * @public
 */
export class TupleDeconstruct {
    public swap(): [number, number] {
        let a = 1;
        let b = 2;
        [a, b] = [b, a];
        return [a, b];
    }
}
