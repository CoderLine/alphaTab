/**
 * @public
 */
export class Iter {
    private items: number[] = [];

    public iter(): Iterable<number> {
        return this.items;
    }

    public iterator(): Iterator<number> {
        return this.items[Symbol.iterator]();
    }
}
