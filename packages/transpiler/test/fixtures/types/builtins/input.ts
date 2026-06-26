/**
 * Covers TS built-in types whose mapping lives in the typeRegistry:
 * Promise -> Task / Deferred, Map -> IMap, Array<T> -> IList<T>,
 * Iterable -> IEnumerable. Set is excluded here because it would
 * require runtime Set support which differs per target.
 * @public
 */
export class Builtins {
    public list: number[] = [];
    public lookup: Map<string, number> = new Map();
    public asArray: Array<string> = [];

    public iter(): Iterable<number> {
        return this.list;
    }

    public async fetchValue(): Promise<number> {
        return 42;
    }

    public count(): number {
        return this.list.length;
    }
}
