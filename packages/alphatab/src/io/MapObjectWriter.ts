import type { IObjectWriter } from '@coderline/alphatab/io/IObjectWriter';
import type { RecordFields } from '@coderline/alphatab/io/RecordFields';

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
    private _fields: RecordFields | null = null;
    private _parentFields: (RecordFields | null)[] = [];
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

    public startObject(fields: RecordFields): void {
        this._parentFields.push(this._fields);
        this._fields = fields;
        this.startMap();
    }

    public endObject(): void {
        this._fields = this._parentFields.pop() ?? null;
        this._pop();
    }

    public startMap(): void {
        const m = new Map<string, unknown>();
        this._add(m);
        this._push(m, null);
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

    public field(id: number): void {
        this._key = this._fields!.names[id];
    }

    public numberField(id: number, v: number): void {
        this.field(id);
        this.writeNumber(v);
    }

    public booleanField(id: number, v: boolean): void {
        this.field(id);
        this.writeBoolean(v);
    }

    public stringField(id: number, v: string): void {
        this.field(id);
        this.writeString(v);
    }

    public valueField(id: number, v: unknown): void {
        this.field(id);
        this.writeValue(v);
    }

    public arrayField(id: number, length: number): void {
        this.field(id);
        this.startArray(length);
    }

    public mapField(id: number): void {
        this.field(id);
        this.startMap();
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
