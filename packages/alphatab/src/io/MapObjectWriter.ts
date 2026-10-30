import type { IObjectWriter } from '@coderline/alphatab/io/IObjectWriter';

/**
 * Builds a tree of `Map<string, unknown>` (records and maps) and arrays. Values written with
 * {@link IObjectWriter.writeValue} are stored by reference.
 * @internal
 */
export class MapObjectWriter implements IObjectWriter {
    private _map: Map<string, unknown> | null = null;
    private _array: unknown[] | null = null;
    private _parentMaps: (Map<string, unknown> | null)[] = [];
    private _parentArrays: (unknown[] | null)[] = [];
    private _key: string = '';

    /**
     * The written top-level value.
     */
    public result: unknown = null;

    private _add(v: unknown) {
        if (this._map !== null) {
            this._map.set(this._key, v);
        } else if (this._array !== null) {
            this._array.push(v);
        } else {
            this.result = v;
        }
    }

    private _push(map: Map<string, unknown> | null, array: unknown[] | null) {
        this._parentMaps.push(this._map);
        this._parentArrays.push(this._array);
        this._map = map;
        this._array = array;
    }

    private _pop() {
        this._map = this._parentMaps.pop() ?? null;
        this._array = this._parentArrays.pop() ?? null;
    }

    public startObject(): void {
        const m = new Map<string, unknown>();
        this._add(m);
        this._push(m, null);
    }

    public endObject(): void {
        this._pop();
    }

    public startMap(): void {
        this.startObject();
    }

    public endMap(): void {
        this._pop();
    }

    public startArray(_length: number): void {
        const a: unknown[] = [];
        this._add(a);
        this._push(null, a);
    }

    public endArray(): void {
        this._pop();
    }

    public prop(name: string): void {
        this._key = name;
    }

    public field(_id: number, name: string): void {
        this._key = name;
    }

    public writeNumber(v: number): void {
        this._add(v);
    }

    public writeBoolean(v: boolean): void {
        this._add(v);
    }

    public writeString(v: string): void {
        this._add(v);
    }

    public writeNull(): void {
        this._add(null);
    }

    public writeUndefined(): void {
        this._add(undefined);
    }

    public writeValue(v: unknown): void {
        this._add(v);
    }
}
