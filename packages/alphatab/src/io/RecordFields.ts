/**
 * The keys of the generated fields of one serialized class, indexed by field id.
 * @internal
 */
export class RecordFields {
    /**
     * The key of every field, at the index of its id.
     */
    public readonly names: string[];
    private _ids: Map<string, number> | null = null;

    public constructor(names: string[]) {
        this.names = names;
    }

    /**
     * The id of the field with the given key, or -1.
     */
    public idOf(name: string): number {
        let ids = this._ids;
        if (ids === null) {
            ids = new Map<string, number>();
            for (let i = 0; i < this.names.length; i++) {
                ids.set(this.names[i], i);
            }
            this._ids = ids;
        }
        return ids.get(name) ?? -1;
    }
}
