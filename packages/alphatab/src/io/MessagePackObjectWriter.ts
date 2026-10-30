/** @target web */
import { AlphaTabError, AlphaTabErrorType } from '@coderline/alphatab/AlphaTabError';
import type { IObjectWriter } from '@coderline/alphatab/io/IObjectWriter';

/**
 * The application-specific extension type (MessagePack spec, "ext format family") used for `undefined`,
 * written as `fixext 1` with one zero data byte.
 * @target web
 * @internal
 */
export const messagePackUndefinedExtType = 0;

/**
 * Writes the object model as MessagePack (https://github.com/msgpack/msgpack/blob/master/spec.md): records as
 * maps keyed by field id (positive fixint or uint 8) and by string for entries written with {@link prop},
 * maps as maps with string keys, arrays, integers in the 32-bit ranges as the smallest int format, other
 * numbers as float 32 when lossless and float 64 otherwise, strings as UTF-8 str, `Uint8Array` as bin and
 * `undefined` as the extension type {@link messagePackUndefinedExtType}.
 * Records and maps always use the `map 16` header (or `map 32` above 65535 entries) because their entry count
 * is only known at their end; the spec allows this, it only recommends the shortest header.
 * @target web
 * @internal
 */
export class MessagePackObjectWriter implements IObjectWriter {
    private _buffer: Uint8Array;
    private _view: DataView;
    private _position: number = 0;
    private _depth: number = 0;
    /**
     * The header position of the current map, or -1 within arrays and at the top level.
     */
    private _header: number = -1;
    /**
     * The entries written into the current map, or the elements still expected in the current array.
     */
    private _count: number = 0;
    private _parentHeaders: number[] = [];
    private _parentCounts: number[] = [];

    public constructor(initialCapacity: number = 65536) {
        this._buffer = new Uint8Array(initialCapacity);
        this._view = new DataView(this._buffer.buffer);
    }

    /**
     * The written value. Its buffer is owned by the caller and can be transferred.
     */
    public toUint8Array(): Uint8Array {
        if (this._depth !== 0) {
            throw new AlphaTabError(AlphaTabErrorType.General, 'MessagePack value is not complete');
        }
        return this._buffer.subarray(0, this._position);
    }

    private _ensure(bytes: number) {
        const required = this._position + bytes;
        if (required <= this._buffer.length) {
            return;
        }
        const grown = new Uint8Array(Math.max(required, this._buffer.length * 2));
        grown.set(this._buffer.subarray(0, this._position));
        this._buffer = grown;
        this._view = new DataView(grown.buffer);
    }

    private _push(header: number, count: number) {
        this._parentHeaders.push(this._header);
        this._parentCounts.push(this._count);
        this._header = header;
        this._count = count;
        this._depth++;
    }

    private _pop() {
        this._header = this._parentHeaders.pop()!;
        this._count = this._parentCounts.pop()!;
        this._depth--;
    }

    private _startMap() {
        this._value();
        this._ensure(3);
        this._push(this._position, 0);
        this._buffer[this._position] = 0xde;
        this._position += 3;
    }

    private _endMap() {
        const header = this._header;
        const count = this._count;
        this._pop();
        if (count <= 0xffff) {
            this._view.setUint16(header + 1, count);
            return;
        }
        // map 32: two more header bytes
        this._ensure(2);
        this._buffer.copyWithin(header + 5, header + 3, this._position);
        this._position += 2;
        this._buffer[header] = 0xdf;
        this._view.setUint32(header + 1, count);
    }

    public startObject(): void {
        this._startMap();
    }

    public endObject(): void {
        this._endMap();
    }

    public startMap(): void {
        this._startMap();
    }

    public endMap(): void {
        this._endMap();
    }

    public startArray(length: number): void {
        this._value();
        this._ensure(5);
        if (length <= 15) {
            this._buffer[this._position++] = 0x90 | length;
        } else if (length <= 0xffff) {
            this._buffer[this._position] = 0xdc;
            this._view.setUint16(this._position + 1, length);
            this._position += 3;
        } else {
            this._buffer[this._position] = 0xdd;
            this._view.setUint32(this._position + 1, length);
            this._position += 5;
        }
        this._push(-1, length);
    }

    public endArray(): void {
        const remaining = this._count;
        this._pop();
        if (remaining !== 0) {
            throw new AlphaTabError(AlphaTabErrorType.General, 'MessagePack array length does not match');
        }
    }

    public prop(name: string): void {
        this._count++;
        this._writeString(name);
    }

    public field(id: number, _name: string): void {
        this._count++;
        this._ensure(2);
        if (id <= 0x7f) {
            this._buffer[this._position++] = id;
        } else {
            this._buffer[this._position] = 0xcc;
            this._buffer[this._position + 1] = id;
            this._position += 2;
        }
    }

    /**
     * Counts a value written into an array.
     */
    private _value() {
        if (this._header === -1) {
            this._count--;
        }
    }

    public writeNumber(v: number): void {
        if (typeof v !== 'number') {
            this.writeValue(v);
            return;
        }
        this._value();
        this._ensure(9);
        const buffer = this._buffer;
        const p = this._position;
        if (Number.isInteger(v) && (v !== 0 || 1 / v > 0) && v >= -2147483648 && v <= 4294967295) {
            if (v >= 0) {
                if (v <= 0x7f) {
                    buffer[p] = v;
                    this._position = p + 1;
                } else if (v <= 0xff) {
                    buffer[p] = 0xcc;
                    buffer[p + 1] = v;
                    this._position = p + 2;
                } else if (v <= 0xffff) {
                    buffer[p] = 0xcd;
                    this._view.setUint16(p + 1, v);
                    this._position = p + 3;
                } else {
                    buffer[p] = 0xce;
                    this._view.setUint32(p + 1, v);
                    this._position = p + 5;
                }
            } else if (v >= -32) {
                buffer[p] = v & 0xff;
                this._position = p + 1;
            } else if (v >= -128) {
                buffer[p] = 0xd0;
                this._view.setInt8(p + 1, v);
                this._position = p + 2;
            } else if (v >= -32768) {
                buffer[p] = 0xd1;
                this._view.setInt16(p + 1, v);
                this._position = p + 3;
            } else {
                buffer[p] = 0xd2;
                this._view.setInt32(p + 1, v);
                this._position = p + 5;
            }
        } else if (Math.fround(v) === v || v !== v) {
            buffer[p] = 0xca;
            this._view.setFloat32(p + 1, v);
            this._position = p + 5;
        } else {
            buffer[p] = 0xcb;
            this._view.setFloat64(p + 1, v);
            this._position = p + 9;
        }
    }

    public writeBoolean(v: boolean): void {
        if (typeof v !== 'boolean') {
            this.writeValue(v);
            return;
        }
        this._value();
        this._ensure(1);
        this._buffer[this._position++] = v ? 0xc3 : 0xc2;
    }

    public writeString(v: string): void {
        if (typeof v !== 'string') {
            this.writeValue(v);
            return;
        }
        this._value();
        this._writeString(v);
    }

    private _writeString(s: string) {
        const length = s.length;
        this._ensure(5 + length * 3);
        const buffer = this._buffer;
        const p = this._position;
        if (length <= 31) {
            // optimistic: short ASCII strings (all keys) are copied in one pass
            let i = 0;
            let c = 0;
            while (i < length && (c = s.charCodeAt(i)) < 0x80) {
                buffer[p + 1 + i] = c;
                i++;
            }
            if (i === length) {
                buffer[p] = 0xa0 | length;
                this._position = p + 1 + length;
                return;
            }
        }
        let byteLength = length;
        for (let i = 0; i < length; i++) {
            if (s.charCodeAt(i) >= 0x80) {
                byteLength = MessagePackObjectWriter._utf8Length(s, i);
                break;
            }
        }
        let h = p;
        if (byteLength <= 31) {
            buffer[h++] = 0xa0 | byteLength;
        } else if (byteLength <= 0xff) {
            buffer[h++] = 0xd9;
            buffer[h++] = byteLength;
        } else if (byteLength <= 0xffff) {
            buffer[h] = 0xda;
            this._view.setUint16(h + 1, byteLength);
            h += 3;
        } else {
            buffer[h] = 0xdb;
            this._view.setUint32(h + 1, byteLength);
            h += 5;
        }
        if (byteLength === length) {
            for (let i = 0; i < length; i++) {
                buffer[h++] = s.charCodeAt(i);
            }
            this._position = h;
        } else {
            this._position = h;
            this._writeUtf8(s);
        }
    }

    /**
     * The UTF-8 length of the string, with the characters before `start` known to be ASCII.
     */
    private static _utf8Length(s: string, start: number): number {
        let bytes = start;
        for (let i = start; i < s.length; i++) {
            const c = s.charCodeAt(i);
            if (c < 0x80) {
                bytes++;
            } else if (c < 0x800) {
                bytes += 2;
            } else if (c >= 0xd800 && c <= 0xdbff && i + 1 < s.length) {
                const low = s.charCodeAt(i + 1);
                if (low >= 0xdc00 && low <= 0xdfff) {
                    i++;
                    bytes += 4;
                } else {
                    bytes += 3;
                }
            } else {
                bytes += 3;
            }
        }
        return bytes;
    }

    private _writeUtf8(s: string) {
        const buffer = this._buffer;
        let p = this._position;
        for (let i = 0; i < s.length; i++) {
            let c = s.charCodeAt(i);
            if (c < 0x80) {
                buffer[p++] = c;
            } else if (c < 0x800) {
                buffer[p++] = 0xc0 | (c >> 6);
                buffer[p++] = 0x80 | (c & 0x3f);
            } else {
                if (c >= 0xd800 && c <= 0xdbff && i + 1 < s.length) {
                    const low = s.charCodeAt(i + 1);
                    if (low >= 0xdc00 && low <= 0xdfff) {
                        i++;
                        c = 0x10000 + ((c - 0xd800) << 10) + (low - 0xdc00);
                        buffer[p++] = 0xf0 | (c >> 18);
                        buffer[p++] = 0x80 | ((c >> 12) & 0x3f);
                        buffer[p++] = 0x80 | ((c >> 6) & 0x3f);
                        buffer[p++] = 0x80 | (c & 0x3f);
                        continue;
                    }
                }
                if (c >= 0xd800 && c <= 0xdfff) {
                    // lone surrogate, as TextEncoder does
                    c = 0xfffd;
                }
                buffer[p++] = 0xe0 | (c >> 12);
                buffer[p++] = 0x80 | ((c >> 6) & 0x3f);
                buffer[p++] = 0x80 | (c & 0x3f);
            }
        }
        this._position = p;
    }

    public writeNull(): void {
        this._value();
        this._ensure(1);
        this._buffer[this._position++] = 0xc0;
    }

    public writeUndefined(): void {
        this._value();
        this._ensure(3);
        this._buffer[this._position++] = 0xd4;
        this._buffer[this._position++] = messagePackUndefinedExtType;
        this._buffer[this._position++] = 0;
    }

    public writeValue(v: unknown): void {
        switch (typeof v) {
            case 'number':
                this.writeNumber(v);
                return;
            case 'boolean':
                this.writeBoolean(v);
                return;
            case 'string':
                this.writeString(v);
                return;
            case 'undefined':
                this.writeUndefined();
                return;
            case 'object':
                if (v === null) {
                    this.writeNull();
                } else if (Array.isArray(v)) {
                    this.startArray(v.length);
                    for (const i of v) {
                        this.writeValue(i);
                    }
                    this.endArray();
                } else if (v instanceof Map) {
                    this.startMap();
                    for (const [k, i] of v) {
                        this.prop(String(k));
                        this.writeValue(i);
                    }
                    this.endMap();
                } else if (v instanceof Uint8Array) {
                    this._value();
                    this._ensure(5 + v.length);
                    const p = this._position;
                    if (v.length <= 0xff) {
                        this._buffer[p] = 0xc4;
                        this._buffer[p + 1] = v.length;
                        this._position = p + 2;
                    } else if (v.length <= 0xffff) {
                        this._buffer[p] = 0xc5;
                        this._view.setUint16(p + 1, v.length);
                        this._position = p + 3;
                    } else {
                        this._buffer[p] = 0xc6;
                        this._view.setUint32(p + 1, v.length);
                        this._position = p + 5;
                    }
                    this._buffer.set(v, this._position);
                    this._position += v.length;
                } else if (ArrayBuffer.isView(v)) {
                    throw new AlphaTabError(AlphaTabErrorType.General, 'Only Uint8Array can be written as MessagePack');
                } else {
                    this.startObject();
                    const o = v as Record<string, unknown>;
                    for (const k in o) {
                        this.prop(k);
                        this.writeValue(o[k]);
                    }
                    this.endObject();
                }
                return;
        }
        throw new AlphaTabError(AlphaTabErrorType.General, `Cannot write a value of type ${typeof v} as MessagePack`);
    }
}
