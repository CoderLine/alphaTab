/**
 * Covers tuple type annotations and tuple literal returns.
 *
 * @public
 */
export class TupleTypes {
    public pair(): [number, string] {
        return [42, 'answer'];
    }

    public coords(): [number, number] {
        return [1, 2];
    }
}
