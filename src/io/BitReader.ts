import { ByteBuffer } from '@src/io/ByteBuffer';
import { IReadable } from '@src/io/IReadable';
import { AlphaTabError, AlphaTabErrorType } from '@src/AlphaTabError';

export class EndOfReaderError extends AlphaTabError {
    public constructor() {
        super(AlphaTabErrorType.Format, 'Unexpected end of data within reader');
        Object.setPrototypeOf(this, EndOfReaderError.prototype);
    }
}

/**
 * This utility public class allows bitwise reading of a stream
 */
export class BitReader {
    private static readonly ByteSize: number = 8;

    private _currentByte: number = 0;
    private _position: number = BitReader.ByteSize;
    private _source: IReadable;

    public constructor(source: IReadable) {
        this._source = source;
    }

    public readByte(): number {
        return this.readBits(8);
    }

    public readBytes(count: number): Uint8Array {
        const bytes: Uint8Array = new Uint8Array(count);
        for (let i: number = 0; i < count; i++) {
            bytes[i] = this.readByte() & 0xff;
        }
        return bytes;
    }

    public readBits(count: number): number {
        let bits: number = 0;
        let i: number = count - 1;
        while (i >= 0) {
            bits = bits | (this.readBit() << i);
            i--;
        }
        return bits;
    }

    public readBitsReversed(count: number): number {
        let bits: number = 0;
        for (let i: number = 0; i < count; i++) {
            bits = bits | (this.readBit() << i);
        }
        return bits;
    }

    public readBit(): number {
        // need a new byte?
        if (this._position >= 8) {
            this._currentByte = this._source.readByte();
            if (this._currentByte === -1) {
                throw new EndOfReaderError();
            }
            this._position = 0;
        }
        // shift the desired byte to the least significant bit and
        // get the value using masking
        const value: number = (this._currentByte >> (BitReader.ByteSize - this._position - 1)) & 0x01;
        this._position++;
        return value;
    }

    public readAll(): Uint8Array {
        let all: ByteBuffer = ByteBuffer.empty();
        try {
            while (true) {
                all.writeByte(this.readByte() & 0xff);
            }
        } catch (e) {
            if (!(e instanceof EndOfReaderError)) {
                throw e;
            }
        }
        return all.toArray();
    }
}
