// This Deflate algorithm is based on the Deflater class of the SharpZipLib (MIT)
// https://github.com/icsharpcode/SharpZipLib
/*
 * Copyright © 2000-2018 SharpZipLib Contributors
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons
 * to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

/**
 * This class is general purpose class for writing data to a buffer.
 * It allows you to write bits as well as bytes
 * Based on DeflaterPending.java
 */
export class PendingBuffer {
    private _buffer: Uint8Array;
    private _start: number = 0;
    private _end: number = 0;
    private _bits: number = 0;

    /**
     * The number of bits written to the buffer
     */
    public bitCount: number = 0;

    /**
     * Indicates if buffer has been flushed
     */
    public get isFlushed(): boolean {
        return this._end === 0;
    }

    /**
     * construct instance using specified buffer size
     * @param bufferSize size to use for internal buffer
     */
    public constructor(bufferSize: number) {
        this._buffer = new Uint8Array(bufferSize);
    }

    /**
     * Clear internal state/buffers
     */
    public reset() {
        this._start = 0;
        this._end = 0;
        this.bitCount = 0;
    }

    /**
     * Write a short value to internal buffer most significant byte first
     * @param s value to write
     */
    public writeShortMSB(s: number) {
        this._buffer[this._end++] = (s >> 8) & 0xFF;
        this._buffer[this._end++] = s & 0xFF;
    }

    /**
     * Write a short value to buffer LSB first
     * @param value The value to write.
     */
    public writeShort(value: number) {
        this._buffer[this._end++] = value;
        this._buffer[this._end++] = (value >> 8);
    }


    /**
     * Write a block of data to buffer
     * @param block data to write
     * @param offset offset of first byte to write
     * @param length number of bytes to write
     */
    public writeBlock(block: Uint8Array, offset: number, length: number) {
        this._buffer.set(block.subarray(offset, offset + length), this._end);
        this._end += length;
    }

    /**
     * Flushes the pending buffer into the given output array.  If the
     * output array is to small, only a partial flush is done.
     * @param output The output array.
     * @param offset The offset into output array.
     * @param length The maximum number of bytes to store.
     * @returns The number of bytes flushed.
     */
    public flush(output: Uint8Array, offset: number, length: number) {
        if (this.bitCount >= 8) {
            this._buffer[this._end++] = this._bits & 0xFF;
            this._bits >>= 8;
            this.bitCount -= 8;
        }

        if (length > this._end - this._start) {
            length = this._end - this._start;
            output.set(this._buffer.subarray(this._start, this._start + length), offset);
            this._start = 0;
            this._end = 0;
        }
        else {
            output.set(this._buffer.subarray(this._start, this._start + length), offset);
            this._start += length;
        }
        return length;
    }

    /**
     * Write bits to internal buffer
     * @param b source of bits
     * @param count number of bits to write
     */
    public writeBits(b: number, count: number) {
        this._bits |= b << this.bitCount;
        this.bitCount += count;
        if (this.bitCount >= 16) {
            this._buffer[this._end++] = this._bits & 0xFF;
            this._buffer[this._end++] = (this._bits >> 8) & 0xFF;
            this._bits >>= 16;
            this.bitCount -= 16;
        }
    }

    /**
     * Align internal buffer on a byte boundary
     */
    public alignToByte() {
        if (this.bitCount > 0) {
            this._buffer[this._end++] = this._bits & 0xFF;
            if (this.bitCount > 8) {
                this._buffer[this._end++] = (this._bits >> 8) & 0xFF;
            }
        }
        this._bits = 0;
        this.bitCount = 0;
    }
}
