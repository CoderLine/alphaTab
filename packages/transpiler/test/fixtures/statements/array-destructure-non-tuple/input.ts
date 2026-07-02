/**
 * Verifies that tuple-typed array destructuring still works correctly
 * after the non-tuple lowering guard was added.
 *
 * @public
 */
export class ArrayDestructureTuple {
    public swap(pair: [number, number]): [number, number] {
        const [a, b] = pair;
        return [b, a];
    }
}
