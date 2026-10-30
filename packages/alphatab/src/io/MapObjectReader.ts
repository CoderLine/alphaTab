import type { IObjectReader } from '@coderline/alphatab/io/IObjectReader';
import { JsonHelper } from '@coderline/alphatab/io/JsonHelper';
import type { RecordFields } from '@coderline/alphatab/io/RecordFields';

/**
 * Reads a tree of `Map<string, unknown>` and arrays, on web also plain objects (e.g. from `JSON.parse`).
 * Values are returned as they are stored, without conversions or checks.
 * @internal
 */
export class MapObjectReader implements IObjectReader {
    private _value: unknown;
    private _handler: ((name: string, r: IObjectReader) => boolean) | null = null;
    private _recordHandler: ((id: number, name: string, r: IObjectReader) => boolean) | null = null;
    private _recordFields: RecordFields | null = null;
    // one callback for all maps and records, the handler of the container being read is in _handler or _recordHandler
    private readonly _entry: (v: unknown, k: string) => void;
    private readonly _recordEntry: (v: unknown, k: string) => void;

    public constructor(value: unknown) {
        this._value = value;
        this._entry = (v, k) => {
            this._value = v;
            this._handler!(k, this);
        };
        this._recordEntry = (v, k) => {
            this._value = v;
            const fields = this._recordFields;
            this._recordHandler!(fields !== null ? fields.idOf(k) : -1, k, this);
        };
    }

    public isNullish(): boolean {
        return this._value === null || this._value === undefined;
    }

    public readNumber(): number {
        return this._value as number;
    }

    public readBoolean(): boolean {
        return this._value as boolean;
    }

    public readString(): string {
        return this._value as string;
    }

    public readValue(): unknown {
        return this._value;
    }

    public readObject(handler: (name: string, r: IObjectReader) => boolean): void {
        /*@target web*/
        if (this._readPlainObject(handler)) {
            return;
        }
        const parent = this._handler;
        this._handler = handler;
        JsonHelper.forEach(this._value, this._entry);
        this._handler = parent;
    }

    /**
     * Plain objects (JSON.parse, structured clones): the for-in with the keyed load in one function is much
     * faster than the callback of JsonHelper.forEach.
     * @target web
     */
    private _readPlainObject(handler: (name: string, r: IObjectReader) => boolean): boolean {
        const v = this._value;
        if (v instanceof Map || typeof v !== 'object' || v === null) {
            return false;
        }
        for (const k in v) {
            this._value = (v as Record<string, unknown>)[k];
            handler(k, this);
        }
        return true;
    }

    public readRecord(
        fields: RecordFields | null,
        handler: (id: number, name: string, r: IObjectReader) => boolean
    ): void {
        /*@target web*/
        if (this._readPlainRecord(fields, handler)) {
            return;
        }
        const parent = this._recordHandler;
        const parentFields = this._recordFields;
        this._recordHandler = handler;
        this._recordFields = fields;
        JsonHelper.forEach(this._value, this._recordEntry);
        this._recordHandler = parent;
        this._recordFields = parentFields;
    }

    /**
     * @target web
     */
    private _readPlainRecord(
        fields: RecordFields | null,
        handler: (id: number, name: string, r: IObjectReader) => boolean
    ): boolean {
        const v = this._value;
        if (v instanceof Map || typeof v !== 'object' || v === null) {
            return false;
        }
        for (const k in v) {
            this._value = (v as Record<string, unknown>)[k];
            handler(fields !== null ? fields.idOf(k) : -1, k, this);
        }
        return true;
    }

    public readArray(handler: (r: IObjectReader) => void): void {
        for (const v of this._value as Iterable<unknown>) {
            this._value = v;
            handler(this);
        }
    }

    public skip(): void {
        // values are random access, nothing to advance
    }
}
