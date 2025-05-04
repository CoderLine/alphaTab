/*
 * This part of the Vorbis Decoder is adopted from NVorbis and then simplified for alphaTab
 * https://github.com/NVorbis/NVorbis
 *
 * MIT License
 *
 * Copyright (c) 2020 Andrew Ward
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { AlphaTabError, AlphaTabErrorType } from '@src/AlphaTabError';
import type { IReadable } from '@src/io/IReadable';

class IntBitReaderReadResult {
    public value: number = 0;
    public bitsRead: number = 0;
}

export class IntBitReader {
    private static readonly ByteSize = 8; // size of byte in bits

    private readonly _source: IReadable;
    private _bitBucket: bigint = 0n; // 8
    private _bitCount: bigint = 0n; // 4
    private _overflowBits: bigint = 0n; // 1

    public constructor(source: IReadable) {
        this._source = source;
    }

    public readByte(): number {
        return this.readBits(IntBitReader.ByteSize);
    }

    public readBit(): boolean {
        return this.readBits(1) === 1;
    }

    public readBytes(count: number): Uint8Array {
        const bytes = new Uint8Array(count);
        for (let i = 0; i < count; i++) {
            bytes[i] = this.readByte() & 0xff;
        }
        return bytes;
    }

    public readBits(count: number): number {
        // short-circuit 0
        if (count === 0) {
            return 0;
        }

        const result = this.tryPeekBits(count);

        this.skipBits(count);

        return result.value;
    }

    public tryPeekBits(count: number): IntBitReaderReadResult {
        if (count < 0 || count > 32) {
            throw new AlphaTabError(AlphaTabErrorType.General, 'IO: Cannot read more than 32 bits in one go');
        }
        if (count === 0) {
            return new IntBitReaderReadResult();
        }

        const result = new IntBitReaderReadResult();
        while (this._bitCount < count) {
            const val = BigInt(this._source.readByte());
            if (val === -1n) {
                result.bitsRead = Number(this._bitCount);
                result.value = Number(this._bitBucket);
                this._bitBucket = 0n;
                this._bitCount = 0n;

                return result;
            }
            this._bitBucket = ((val & 0xffn) << this._bitCount) | this._bitBucket;
            this._bitCount += 8n;

            if (this._bitCount > 32) {
                this._overflowBits = (val >> (40n - this._bitCount)) & 0xffn;
            }
        }

        let bitBucket = this._bitBucket;
        if (count < 64) {
            bitBucket = bitBucket & ((1n << BigInt(count)) - 1n);
        }

        result.value = Number(bitBucket);

        result.bitsRead = count;
        return result;
    }

    public skipBits(count: number) {
        let bigCount = BigInt(count);
        if (count === 0) {
            // no-op
        } else if (this._bitCount > bigCount) {
            // we still have bits left over...
            if (count > 31) {
                this._bitBucket = 0n;
            } else {
                this._bitBucket = this._bitBucket >> bigCount;
            }
            if (this._bitCount > 32) {
                const overflowCount = this._bitCount - 32n;
                this._bitBucket = this._bitBucket | (this._overflowBits << (this._bitCount - bigCount - overflowCount));

                if (overflowCount > count) {
                    // ugh, we have to keep bits in overflow
                    this._overflowBits = (this._overflowBits >> bigCount) & 0xffn;
                }
            }

            this._bitCount -= bigCount;
        } else if (this._bitCount === bigCount) {
            this._bitBucket = 0n;
            this._bitCount = 0n;
        } //  _bitCount < count
        else {
            // we have to move more bits than we have available...
            bigCount -= this._bitCount;
            this._bitCount = 0n;
            this._bitBucket = 0n;

            while (bigCount > 8) {
                if (this._source.readByte() === -1) {
                    bigCount = 0n;
                    break;
                }
                bigCount -= 8n;
            }

            if (bigCount > 0) {
                const temp = BigInt(this._source.readByte());
                if (temp === -1n) {
                } else {
                    this._bitBucket = temp >> bigCount;
                    this._bitCount = 8n - bigCount;
                }
            }
        }
    }
}
