/**
 * @public
 */
export class ArrayDestructuringNonTuple {
    public head(items: number[]): number {
        const [first] = items;
        return first;
    }
}
