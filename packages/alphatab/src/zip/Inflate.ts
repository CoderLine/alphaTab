// This Inflate algorithm is based on the Inflate class of the Haxe Standard Library (MIT)
/*
 * Copyright (C)2005-2019 Haxe Foundation
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */
import { FormatError } from '@src/FormatError';
import { IOHelper } from '@src/io/IOHelper';
import type { IReadable } from '@src/io/IReadable';
import {
    Found as HuffmanFound,
    type Huffman,
    NeedBit as HuffmanNeedBit,
    NeedBits as HuffmanNeedBits
} from '@src/zip/Huffman';
import { HuffTools } from '@src/zip/HuffTools';

/**
 * @internal
 */
enum InflateState {
    Head = 0,
    Block = 1,
    CData = 2,
    Flat = 3,
    Crc = 4,
    Dist = 5,
    DistOne = 6,
    Done = 7
}

/**
 * @internal
 */
class InflateWindow {
    private static readonly _size: number = 1 << 15;
    private static readonly _bufferSize: number = 1 << 16;

    public buffer: Uint8Array = new Uint8Array(InflateWindow._bufferSize);
    public pos: number = 0;

    public slide(): void {
        const b: Uint8Array = new Uint8Array(InflateWindow._bufferSize);
        this.pos -= InflateWindow._size;
        b.set(this.buffer.subarray(InflateWindow._size, InflateWindow._size + this.pos), 0);
        this.buffer = b;
    }

    public addBytes(b: Uint8Array, p: number, len: number): void {
        if (this.pos + len > InflateWindow._bufferSize) {
            this.slide();
        }
        this.buffer.set(b.subarray(p, p + len), this.pos);
        this.pos += len;
    }

    public addByte(c: number): void {
        if (this.pos === InflateWindow._bufferSize) {
            this.slide();
        }
        this.buffer[this.pos] = c;
        this.pos++;
    }

    public getLastChar(): number {
        return this.buffer[this.pos - 1];
    }

    public available(): number {
        return this.pos;
    }
}

/**
 * @internal
 */
export class Inflate {
    private static _lenExtraBitsTbl: number[] = [
        0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, -1, -1
    ];
    private static _lenBaseValTbl: number[] = [
        3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227,
        258
    ];
    private static _distExtraBitsTbl: number[] = [
        0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, -1, -1
    ];
    private static _distBaseValTbl: number[] = [
        1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097,
        6145, 8193, 12289, 16385, 24577
    ];
    private static _codeLengthsPos: number[] = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];

    private static _fixedHuffman: Huffman = Inflate._buildFixedHuffman();

    private static _buildFixedHuffman(): Huffman {
        const a: number[] = [];
        for (let n: number = 0; n < 288; n++) {
            a.push(n <= 143 ? 8 : n <= 255 ? 9 : n <= 279 ? 7 : 8);
        }
        return HuffTools.make(a, 0, 288, 10);
    }

    private _nbits: number = 0;
    private _bits: number = 0;
    private _state: InflateState = InflateState.Block;
    private _isFinal: boolean = false;
    private _huffman: Huffman = Inflate._fixedHuffman;
    private _huffdist: Huffman | null = null;
    private _len: number = 0;
    private _dist: number = 0;
    private _needed: number = 0;
    private _output: Uint8Array | null = null;
    private _outpos: number = 0;
    private _input: IReadable;
    private _lengths: number[] = [];
    private _window: InflateWindow = new InflateWindow();

    public constructor(readable: IReadable) {
        this._input = readable;
        for (let i: number = 0; i < 19; i++) {
            this._lengths.push(-1);
        }
    }

    public readBytes(b: Uint8Array, pos: number, len: number): number {
        this._needed = len;
        this._outpos = pos;
        this._output = b;
        if (len > 0) {
            while (this._inflateLoop()) {
                // inflating...
            }
        }
        return len - this._needed;
    }

    private _inflateLoop(): boolean {
        switch (this._state) {
            case InflateState.Head:
                const cmf: number = this._input.readByte();
                const cm: number = cmf & 15;
                if (cm !== 8) {
                    throw new FormatError('Invalid data');
                }
                const flg: number = this._input.readByte();
                // var fcheck = flg & 31;
                const fdict: boolean = (flg & 32) !== 0;
                // var flevel = flg >> 6;
                if (((cmf << 8) + flg) % 31 !== 0) {
                    throw new FormatError('Invalid data');
                }
                if (fdict) {
                    throw new FormatError('Unsupported dictionary');
                }
                this._state = InflateState.Block;
                return true;
            case InflateState.Crc:
                this._state = InflateState.Done;
                return true;
            case InflateState.Done:
                // nothing
                return false;
            case InflateState.Block:
                this._isFinal = this._getBit();
                switch (this._getBits(2)) {
                    case 0:
                        this._len = IOHelper.readUInt16LE(this._input);
                        const nlen: number = IOHelper.readUInt16LE(this._input);
                        if (nlen !== 0xffff - this._len) {
                            throw new FormatError('Invalid data');
                        }
                        this._state = InflateState.Flat;
                        const r: boolean = this._inflateLoop();
                        this._resetBits();
                        return r;
                    case 1:
                        this._huffman = Inflate._fixedHuffman;
                        this._huffdist = null;
                        this._state = InflateState.CData;
                        return true;
                    case 2:
                        const hlit: number = this._getBits(5) + 257;
                        const hdist: number = this._getBits(5) + 1;
                        const hclen: number = this._getBits(4) + 4;
                        for (let i: number = 0; i < hclen; i++) {
                            this._lengths[Inflate._codeLengthsPos[i]] = this._getBits(3);
                        }
                        for (let i: number = hclen; i < 19; i++) {
                            this._lengths[Inflate._codeLengthsPos[i]] = 0;
                        }
                        this._huffman = HuffTools.make(this._lengths, 0, 19, 8);
                        const xlengths: number[] = [];
                        for (let i: number = 0; i < hlit + hdist; i++) {
                            xlengths.push(0);
                        }
                        this._inflateLengths(xlengths, hlit + hdist);
                        this._huffdist = HuffTools.make(xlengths, hlit, hdist, 16);
                        this._huffman = HuffTools.make(xlengths, 0, hlit, 16);
                        this._state = InflateState.CData;
                        return true;
                    default:
                        throw new FormatError('Invalid data');
                }
            case InflateState.Flat: {
                const rlen: number = this._len < this._needed ? this._len : this._needed;
                const bytes: Uint8Array = IOHelper.readByteArray(this._input, rlen);
                this._len -= rlen;
                this._addBytes(bytes, 0, rlen);
                if (this._len === 0) {
                    this._state = this._isFinal ? InflateState.Crc : InflateState.Block;
                }
                return this._needed > 0;
            }
            case InflateState.DistOne: {
                const rlen: number = this._len < this._needed ? this._len : this._needed;
                this._addDistOne(rlen);
                this._len -= rlen;
                if (this._len === 0) {
                    this._state = InflateState.CData;
                }
                return this._needed > 0;
            }
            case InflateState.Dist:
                while (this._len > 0 && this._needed > 0) {
                    const rdist: number = this._len < this._dist ? this._len : this._dist;
                    const rlen: number = this._needed < rdist ? this._needed : rdist;
                    this._addDist(this._dist, rlen);
                    this._len -= rlen;
                }
                if (this._len === 0) {
                    this._state = InflateState.CData;
                }
                return this._needed > 0;
            case InflateState.CData:
                let n: number = this._applyHuffman(this._huffman);
                if (n < 256) {
                    this._addByte(n);
                    return this._needed > 0;
                }

                if (n === 256) {
                    this._state = this._isFinal ? InflateState.Crc : InflateState.Block;
                    return true;
                }
                n = (n - 257) & 0xff;
                let extraBits: number = Inflate._lenExtraBitsTbl[n];
                if (extraBits === -1) {
                    throw new FormatError('Invalid data');
                }
                this._len = Inflate._lenBaseValTbl[n] + this._getBits(extraBits);
                const huffdist: Huffman | null = this._huffdist;
                const distCode: number = !huffdist ? this._getRevBits(5) : this._applyHuffman(huffdist);
                extraBits = Inflate._distExtraBitsTbl[distCode];
                if (extraBits === -1) {
                    throw new FormatError('Invalid data');
                }
                this._dist = Inflate._distBaseValTbl[distCode] + this._getBits(extraBits);
                if (this._dist > this._window.available()) {
                    throw new FormatError('Invalid data');
                }
                this._state = this._dist === 1 ? InflateState.DistOne : InflateState.Dist;
                return true;
        }
        return false;
    }

    private _addDistOne(n: number): void {
        const c: number = this._window.getLastChar();
        for (let i: number = 0; i < n; i++) {
            this._addByte(c);
        }
    }

    private _addByte(b: number): void {
        this._window.addByte(b);
        this._output![this._outpos] = b;
        this._needed--;
        this._outpos++;
    }

    private _addDist(d: number, len: number): void {
        this._addBytes(this._window.buffer, this._window.pos - d, len);
    }

    private _getBit(): boolean {
        if (this._nbits === 0) {
            this._nbits = 8;
            this._bits = this._input.readByte();
        }
        const b: boolean = (this._bits & 1) === 1;
        this._nbits--;
        this._bits = this._bits >> 1;
        return b;
    }

    private _getBits(n: number): number {
        while (this._nbits < n) {
            this._bits = this._bits | (this._input.readByte() << this._nbits);
            this._nbits += 8;
        }
        const b: number = this._bits & ((1 << n) - 1);
        this._nbits -= n;
        this._bits = this._bits >> n;
        return b;
    }

    private _getRevBits(n: number): number {
        return n === 0 ? 0 : this._getBit() ? (1 << (n - 1)) | this._getRevBits(n - 1) : this._getRevBits(n - 1);
    }

    private _resetBits(): void {
        this._bits = 0;
        this._nbits = 0;
    }

    private _addBytes(b: Uint8Array, p: number, len: number): void {
        this._window.addBytes(b, p, len);
        this._output!.set(b.subarray(p, p + len), this._outpos);
        this._needed -= len;
        this._outpos += len;
    }

    private _inflateLengths(a: number[], max: number): void {
        let i: number = 0;
        let prev: number = 0;
        while (i < max) {
            const n: number = this._applyHuffman(this._huffman);
            switch (n) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                case 12:
                case 13:
                case 14:
                case 15:
                    prev = n;
                    a[i] = n;
                    i++;
                    break;
                case 16:
                    const end: number = i + 3 + this._getBits(2);
                    if (end > max) {
                        throw new FormatError('Invalid data');
                    }
                    while (i < end) {
                        a[i] = prev;
                        i++;
                    }
                    break;
                case 17:
                    i += 3 + this._getBits(3);
                    if (i > max) {
                        throw new FormatError('Invalid data');
                    }
                    break;
                case 18:
                    i += 11 + this._getBits(7);
                    if (i > max) {
                        throw new FormatError('Invalid data');
                    }
                    break;
                default: {
                    throw new FormatError('Invalid data');
                }
            }
        }
    }

    private _applyHuffman(h: Huffman): number {
        if (h instanceof HuffmanFound) {
            return h.n;
        }
        if (h instanceof HuffmanNeedBit) {
            return this._applyHuffman(this._getBit() ? h.right : h.left);
        }
        if (h instanceof HuffmanNeedBits) {
            return this._applyHuffman(h.table[this._getBits(h.n)]);
        }
        throw new FormatError('Invalid data');
    }
}
