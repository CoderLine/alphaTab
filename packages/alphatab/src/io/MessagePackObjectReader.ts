/** @target web */
import { AlphaTabError, AlphaTabErrorType } from '@coderline/alphatab/AlphaTabError';
import type { IObjectReader } from '@coderline/alphatab/io/IObjectReader';
import { messagePackUndefinedExtType } from '@coderline/alphatab/io/MessagePackObjectWriter';

/**
 * Reads MessagePack as written by {@link MessagePackObjectWriter}. Integer keys of maps are passed as field ids
 * by {@link IObjectReader.readRecord}, so records must be read by the generator output that wrote them. Typed
 * reads of a value with another format return the value as {@link IObjectReader.readValue} does. Maps are read as `Map<string, unknown>` by
 * {@link IObjectReader.readValue} (non-string keys converted with `String`), bin as a copied `Uint8Array`.
 * Extension types other than {@link messagePackUndefinedExtType} are not supported.
 * @target web
 * @internal
 */
export class MessagePackObjectReader implements IObjectReader {
    private static readonly _keyCacheSize = 2048;

    private readonly _buffer: Uint8Array;
    private readonly _view: DataView;
    /**
     * The position of the current value's first byte.
     */
    private _position: number = 0;
    private _consumed: boolean = false;
    private readonly _keyCache: (string | null)[] = [];
    private _keyCount: number = 0;
    private _decoder: TextDecoder | null = null;

    public constructor(data: Uint8Array) {
        this._buffer = data;
        this._view = new DataView(data.buffer, data.byteOffset, data.byteLength);
        for (let i = 0; i < MessagePackObjectReader._keyCacheSize; i++) {
            this._keyCache.push(null);
        }
    }

    private _error(message: string): AlphaTabError {
        return new AlphaTabError(
            AlphaTabErrorType.Format,
            `Invalid MessagePack at offset ${this._position}: ${message}`
        );
    }

    private _consume(size: number) {
        this._position += size;
        if (this._position > this._buffer.length) {
            throw this._error('unexpected end of data');
        }
        this._consumed = true;
    }

    public isNullish(): boolean {
        const b = this._buffer[this._position];
        return b === 0xc0 || (b === 0xd4 && this._buffer[this._position + 1] === messagePackUndefinedExtType);
    }

    public readNumber(): number {
        const p = this._position;
        const b = this._buffer[p];
        if (b <= 0x7f) {
            this._consume(1);
            return b;
        }
        if (b >= 0xe0) {
            this._consume(1);
            return b - 0x100;
        }
        let v: number;
        switch (b) {
            case 0xcc:
                v = this._buffer[p + 1];
                this._consume(2);
                return v;
            case 0xcd:
                v = this._view.getUint16(p + 1);
                this._consume(3);
                return v;
            case 0xce:
                v = this._view.getUint32(p + 1);
                this._consume(5);
                return v;
            case 0xcf:
                v = Number(this._view.getBigUint64(p + 1));
                this._consume(9);
                return v;
            case 0xd0:
                v = this._view.getInt8(p + 1);
                this._consume(2);
                return v;
            case 0xd1:
                v = this._view.getInt16(p + 1);
                this._consume(3);
                return v;
            case 0xd2:
                v = this._view.getInt32(p + 1);
                this._consume(5);
                return v;
            case 0xd3:
                v = Number(this._view.getBigInt64(p + 1));
                this._consume(9);
                return v;
            case 0xca:
                v = this._view.getFloat32(p + 1);
                this._consume(5);
                return v;
            case 0xcb:
                v = this._view.getFloat64(p + 1);
                this._consume(9);
                return v;
        }
        return this.readValue() as number;
    }

    public readBoolean(): boolean {
        const b = this._buffer[this._position];
        if (b === 0xc2 || b === 0xc3) {
            this._consume(1);
            return b === 0xc3;
        }
        return this.readValue() as boolean;
    }

    public readString(): string {
        const p = this._position;
        const b = this._buffer[p];
        let start: number;
        let length: number;
        if (b >= 0xa0 && b <= 0xbf) {
            start = p + 1;
            length = b & 0x1f;
        } else if (b === 0xd9) {
            start = p + 2;
            length = this._buffer[p + 1];
        } else if (b === 0xda) {
            start = p + 3;
            length = this._view.getUint16(p + 1);
        } else if (b === 0xdb) {
            start = p + 5;
            length = this._view.getUint32(p + 1);
        } else {
            return this.readValue() as string;
        }
        this._consume(start - p + length);
        return this._decode(start, length);
    }

    /**
     * The entry count of a map or array header at the current position, advancing behind the header, or -1
     * (not advancing) for other values.
     */
    private _containerHeader(map: boolean): number {
        const p = this._position;
        const b = this._buffer[p];
        let count: number;
        if (map ? b >= 0x80 && b <= 0x8f : b >= 0x90 && b <= 0x9f) {
            count = b & 0x0f;
            this._consume(1);
        } else if (b === (map ? 0xde : 0xdc)) {
            count = this._view.getUint16(p + 1);
            this._consume(3);
        } else if (b === (map ? 0xdf : 0xdd)) {
            count = this._view.getUint32(p + 1);
            this._consume(5);
        } else {
            return -1;
        }
        return count;
    }

    public readValue(): unknown {
        const p = this._position;
        if (p >= this._buffer.length) {
            throw this._error('unexpected end of data');
        }
        const b = this._buffer[p];
        if (b <= 0x7f || b >= 0xe0 || (b >= 0xca && b <= 0xd3)) {
            return this.readNumber();
        }
        if ((b >= 0xa0 && b <= 0xbf) || (b >= 0xd9 && b <= 0xdb)) {
            return this.readString();
        }
        if ((b >= 0x80 && b <= 0x8f) || b === 0xde || b === 0xdf) {
            const m = new Map<string, unknown>();
            this.readObject((k, r) => {
                m.set(k, r.readValue());
                return true;
            });
            return m;
        }
        if ((b >= 0x90 && b <= 0x9f) || b === 0xdc || b === 0xdd) {
            const a: unknown[] = [];
            this.readArray(r => {
                a.push(r.readValue());
            });
            return a;
        }
        switch (b) {
            case 0xc0:
                this._consume(1);
                return null;
            case 0xc2:
            case 0xc3:
                return this.readBoolean();
            case 0xc4:
            case 0xc5:
            case 0xc6: {
                const header = b === 0xc4 ? 2 : b === 0xc5 ? 3 : 5;
                const length =
                    b === 0xc4
                        ? this._buffer[p + 1]
                        : b === 0xc5
                          ? this._view.getUint16(p + 1)
                          : this._view.getUint32(p + 1);
                this._consume(header + length);
                return this._buffer.slice(p + header, p + header + length);
            }
            case 0xd4:
                if (this._buffer[p + 1] === messagePackUndefinedExtType) {
                    this._consume(3);
                    return undefined;
                }
                break;
        }
        throw this._error(`unsupported format 0x${b.toString(16)}`);
    }

    public skip(): void {
        let pending = 1;
        const buffer = this._buffer;
        while (pending > 0) {
            pending--;
            const p = this._position;
            if (p >= buffer.length) {
                throw this._error('unexpected end of data');
            }
            const b = buffer[p];
            if (b <= 0x7f || b >= 0xe0 || b === 0xc0 || b === 0xc2 || b === 0xc3) {
                this._consume(1);
            } else if (b >= 0x80 && b <= 0x8f) {
                pending += 2 * (b & 0x0f);
                this._consume(1);
            } else if (b >= 0x90 && b <= 0x9f) {
                pending += b & 0x0f;
                this._consume(1);
            } else if (b >= 0xa0 && b <= 0xbf) {
                this._consume(1 + (b & 0x1f));
            } else {
                switch (b) {
                    case 0xcc:
                    case 0xd0:
                        this._consume(2);
                        break;
                    case 0xcd:
                    case 0xd1:
                        this._consume(3);
                        break;
                    case 0xce:
                    case 0xd2:
                    case 0xca:
                        this._consume(5);
                        break;
                    case 0xcf:
                    case 0xd3:
                    case 0xcb:
                        this._consume(9);
                        break;
                    case 0xc4:
                    case 0xd9:
                        this._consume(2 + buffer[p + 1]);
                        break;
                    case 0xc5:
                    case 0xda:
                        this._consume(3 + this._view.getUint16(p + 1));
                        break;
                    case 0xc6:
                    case 0xdb:
                        this._consume(5 + this._view.getUint32(p + 1));
                        break;
                    case 0xc7:
                        this._consume(3 + buffer[p + 1]);
                        break;
                    case 0xc8:
                        this._consume(4 + this._view.getUint16(p + 1));
                        break;
                    case 0xc9:
                        this._consume(6 + this._view.getUint32(p + 1));
                        break;
                    case 0xd4:
                        this._consume(3);
                        break;
                    case 0xd5:
                        this._consume(4);
                        break;
                    case 0xd6:
                        this._consume(6);
                        break;
                    case 0xd7:
                        this._consume(10);
                        break;
                    case 0xd8:
                        this._consume(18);
                        break;
                    case 0xdc:
                        pending += this._view.getUint16(p + 1);
                        this._consume(3);
                        break;
                    case 0xdd:
                        pending += this._view.getUint32(p + 1);
                        this._consume(5);
                        break;
                    case 0xde:
                        pending += 2 * this._view.getUint16(p + 1);
                        this._consume(3);
                        break;
                    case 0xdf:
                        pending += 2 * this._view.getUint32(p + 1);
                        this._consume(5);
                        break;
                    default:
                        throw this._error(`unsupported format 0x${b.toString(16)}`);
                }
            }
        }
    }

    public readObject(handler: (name: string, r: IObjectReader) => boolean): void {
        const count = this._containerHeader(true);
        if (count < 0) {
            this.skip();
            return;
        }
        for (let i = 0; i < count; i++) {
            const key = this._readKey();
            this._consumed = false;
            handler(key, this);
            if (!this._consumed) {
                this.skip();
            }
        }
        this._consumed = true;
    }

    public readRecord(handler: (id: number, name: string, r: IObjectReader) => boolean): void {
        const count = this._containerHeader(true);
        if (count < 0) {
            this.skip();
            return;
        }
        const buffer = this._buffer;
        for (let i = 0; i < count; i++) {
            const p = this._position;
            const b = buffer[p];
            let id = -1;
            if (b <= 0x7f) {
                id = b;
                this._position = p + 1;
            } else if (b === 0xcc) {
                if (p + 2 > buffer.length) {
                    throw this._error('unexpected end of data');
                }
                id = buffer[p + 1];
                this._position = p + 2;
            }
            const name = id >= 0 ? '' : this._readKey();
            this._consumed = false;
            handler(id, name, this);
            if (!this._consumed) {
                this.skip();
            }
        }
        this._consumed = true;
    }

    public readArray(handler: (r: IObjectReader) => void): void {
        const count = this._containerHeader(false);
        if (count < 0) {
            this.skip();
            return;
        }
        for (let i = 0; i < count; i++) {
            this._consumed = false;
            handler(this);
            if (!this._consumed) {
                this.skip();
            }
        }
        this._consumed = true;
    }

    /**
     * Keys repeat across the records of a score: each distinct key is decoded once and kept internalized, so
     * the generated property switches compare them by reference.
     */
    private _readKey(): string {
        const buffer = this._buffer;
        const p = this._position;
        const b = buffer[p];
        let start: number;
        let keyLength: number;
        if (b >= 0xa0 && b <= 0xbf) {
            start = p + 1;
            keyLength = b & 0x1f;
        } else if (b === 0xd9) {
            start = p + 2;
            keyLength = buffer[p + 1];
        } else {
            const key = this.readValue();
            return typeof key === 'string' ? key : String(key);
        }
        const end = start + keyLength;
        if (end > buffer.length) {
            throw this._error('unexpected end of data');
        }
        this._position = end;

        let hash = 0;
        for (let i = start; i < end; i++) {
            hash = (Math.imul(hash, 31) + buffer[i]) | 0;
        }
        const cache = this._keyCache;
        const mask = MessagePackObjectReader._keyCacheSize - 1;
        // open addressing with linear probing, entries are never evicted
        let slot = (hash ^ keyLength) & mask;
        for (let probe = 0; probe < MessagePackObjectReader._keyCacheSize; probe++) {
            const cached = cache[slot];
            if (cached === null) {
                if (this._keyCount * 4 >= MessagePackObjectReader._keyCacheSize * 3) {
                    // full: all further distinct keys are decoded on every use
                    return this._decode(start, keyLength);
                }
                const key = MessagePackObjectReader._internalize(this._decode(start, keyLength));
                cache[slot] = key;
                this._keyCount++;
                return key;
            }
            if (cached.length === keyLength) {
                let i = 0;
                while (i < keyLength && cached.charCodeAt(i) === buffer[start + i]) {
                    i++;
                }
                if (i === keyLength) {
                    return cached;
                }
            }
            slot = (slot + 1) & mask;
        }
        return this._decode(start, keyLength);
    }

    private static _internalize(s: string): string {
        const o: Record<string, number> = {};
        o[s] = 0;
        return Object.keys(o)[0];
    }

    private _decode(start: number, length: number): string {
        const buffer = this._buffer;
        if (length <= 64) {
            let ascii = true;
            for (let i = 0; i < length; i++) {
                if (buffer[start + i] >= 0x80) {
                    ascii = false;
                    break;
                }
            }
            if (ascii) {
                return String.fromCharCode.apply(null, buffer.subarray(start, start + length) as unknown as number[]);
            }
        }
        this._decoder ??= new TextDecoder();
        return this._decoder.decode(buffer.subarray(start, start + length));
    }
}
