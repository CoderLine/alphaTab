/**
 * Covers an array literal of nulls only, whose element type is inferred as null.
 *
 * @public
 */
export class ArrayOfNulls {
    private static _same<T>(value: T): T {
        return value;
    }

    public create(): unknown {
        return ArrayOfNulls._same([null, null]);
    }
}
