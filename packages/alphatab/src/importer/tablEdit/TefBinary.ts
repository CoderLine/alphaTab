import { FormatError } from '@coderline/alphatab/FormatError';
import { IOHelper } from '@coderline/alphatab/io/IOHelper';
import { OverflowError } from '@coderline/alphatab/io/IReadable';

/**
 * Bounds-checked little-endian access to the bytes of a TablEdit file.
 * @internal
 */
export class TefBinary {
    public readonly bytes: Uint8Array;

    public constructor(bytes: Uint8Array) {
        this.bytes = bytes;
    }

    public get length(): number {
        return this.bytes.length;
    }

    private _requireRange(offset: number, length: number): void {
        if (offset < 0 || offset + length > this.bytes.length) {
            throw new FormatError(`TablEdit data at ${offset} (${length} bytes) is outside of the file`);
        }
    }

    public u8(offset: number): number {
        this._requireRange(offset, 1);
        return this.bytes[offset];
    }

    public s8(offset: number): number {
        const v = this.u8(offset);
        return v > 127 ? v - 256 : v;
    }

    public u16(offset: number): number {
        this._requireRange(offset, 2);
        return this.bytes[offset] | (this.bytes[offset + 1] << 8);
    }

    public s16(offset: number): number {
        const v = this.u16(offset);
        return v > 32767 ? v - 65536 : v;
    }

    public u32(offset: number): number {
        this._requireRange(offset, 4);
        const b = this.bytes;
        return (b[offset] | (b[offset + 1] << 8) | (b[offset + 2] << 16)) + b[offset + 3] * 16777216;
    }

    /**
     * Reads a text with a 16-bit length prefix, without trailing NUL bytes.
     */
    public readString(offset: number, maxLength: number): string {
        const length = this.u16(offset);
        TefBinary.ensureLoopBoundary(length, maxLength, 'string length');
        this._requireRange(offset + 2, length);
        let end = offset + 2 + length;
        while (end > offset + 2 && this.bytes[end - 1] === 0) {
            end--;
        }
        return TefBinary._decode(this.bytes.subarray(offset + 2, end));
    }

    /**
     * Reads a NUL-terminated text of at most the given length.
     */
    public readCString(offset: number, maxLength: number): string {
        this._requireRange(offset, maxLength);
        let end = offset;
        while (end < offset + maxLength && this.bytes[end] !== 0) {
            end++;
        }
        return TefBinary._decode(this.bytes.subarray(offset, end));
    }

    /**
     * Texts are UTF-8, but older files may still carry Windows-1252 text.
     */
    private static _decode(data: Uint8Array): string {
        return IOHelper.toString(data, TefBinary._isValidUtf8(data) ? 'utf-8' : 'windows-1252');
    }

    private static _isValidUtf8(data: Uint8Array): boolean {
        let i = 0;
        while (i < data.length) {
            const b = data[i];
            let follow = 0;
            if (b < 0x80) {
                follow = 0;
            } else if (b >= 0xc2 && b <= 0xdf) {
                follow = 1;
            } else if (b >= 0xe0 && b <= 0xef) {
                follow = 2;
            } else if (b >= 0xf0 && b <= 0xf4) {
                follow = 3;
            } else {
                return false;
            }
            if (i + follow >= data.length && follow > 0) {
                return false;
            }
            for (let k = 1; k <= follow; k++) {
                if ((data[i + k] & 0xc0) !== 0x80) {
                    return false;
                }
            }
            i += follow + 1;
        }
        return true;
    }

    public static ensureLoopBoundary(value: number, maximumValue: number, label: string) {
        if (value > maximumValue) {
            throw new OverflowError(
                `'${label}' with value ${value} has exceeded the internal safety threshold of ${maximumValue}`
            );
        }
    }
}
