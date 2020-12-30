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
import { IReadable } from '@src/io/IReadable';
import {
    Found as HuffmanFound,
    Huffman,
    NeedBit as HuffmanNeedBit,
    NeedBits as HuffmanNeedBits
} from '@src/zip/Huffman';
import { HuffTools } from '@src/zip/HuffTools';

enum InflateState {
    Head,
    Block,
    CData,
    Flat,
    Crc,
    Dist,
    DistOne,
    Done
}

class InflateWindow {
    private static readonly Size: number = 1 << 15;
    private static readonly BufferSize: number = 1 << 16;

    public buffer: Uint8Array = new Uint8Array(InflateWindow.BufferSize);
    public pos: number = 0;

    public slide(): void {
        let b: Uint8Array = new Uint8Array(InflateWindow.BufferSize);
        this.pos -= InflateWindow.Size;
        b.set(this.buffer.subarray(InflateWindow.Size, InflateWindow.Size + this.pos), 0);
        this.buffer = b;
    }

    public addBytes(b: Uint8Array, p: number, len: number): void {
        if (this.pos + len > InflateWindow.BufferSize) {
            this.slide();
        }
        this.buffer.set(b.subarray(p, p + len), this.pos);
        this.pos += len;
    }

    public addByte(c: number): void {
        if (this.pos === InflateWindow.BufferSize) {
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

export class Inflate {
    // prettier-ignore
    private static LenExtraBitsTbl: number[] = [
        0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, -1,
        -1
    ];
    // prettier-ignore
    private static LenBaseValTbl: number[] = [
        3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115,
        131, 163, 195, 227, 258
    ];
    // prettier-ignore
    private static DistExtraBitsTbl: number[] = [
        0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12,
        13, 13, -1, -1
    ];
    // prettier-ignore
    private static DistBaseValTbl: number[] = [
        1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537,
        2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577
    ];
    // prettier-ignore
    private static CodeLengthsPos: number[] = [
        16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15
    ];

    private static _fixedHuffman: Huffman = Inflate.buildFixedHuffman();

    private static buildFixedHuffman(): Huffman {
        let a: number[] = [];
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
            while (this.inflateLoop()) {
                // inflating...
            }
        }
        return len - this._needed;
    }

    private inflateLoop(): boolean {
        switch (this._state) {
            case InflateState.Head:
                let cmf: number = this._input.readByte();
                let cm: number = cmf & 15;
                if (cm !== 8) {
                    throw new FormatError('Invalid data');
                }
                let flg: number = this._input.readByte();
                // var fcheck = flg & 31;
                let fdict: boolean = (flg & 32) !== 0;
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
                this._isFinal = this.getBit();
                switch (this.getBits(2)) {
                    case 0:
                        this._len = IOHelper.readUInt16LE(this._input);
                        let nlen: number = IOHelper.readUInt16LE(this._input);
                        if (nlen !== 0xffff - this._len) {
                            throw new FormatError('Invalid data');
                        }
                        this._state = InflateState.Flat;
                        let r: boolean = this.inflateLoop();
                        this.resetBits();
                        return r;
                    case 1:
                        this._huffman = Inflate._fixedHuffman;
                        this._huffdist = null;
                        this._state = InflateState.CData;
                        return true;
                    case 2:
                        let hlit: number = this.getBits(5) + 257;
                        let hdist: number = this.getBits(5) + 1;
                        let hclen: number = this.getBits(4) + 4;
                        for (let i: number = 0; i < hclen; i++) {
                            this._lengths[Inflate.CodeLengthsPos[i]] = this.getBits(3);
                        }
                        for (let i: number = hclen; i < 19; i++) {
                            this._lengths[Inflate.CodeLengthsPos[i]] = 0;
                        }
                        this._huffman = HuffTools.make(this._lengths, 0, 19, 8);
                        let xlengths: number[] = [];
                        for (let i: number = 0; i < hlit + hdist; i++) {
                            xlengths.push(0);
                        }
                        this.inflateLengths(xlengths, hlit + hdist);
                        this._huffdist = HuffTools.make(xlengths, hlit, hdist, 16);
                        this._huffman = HuffTools.make(xlengths, 0, hlit, 16);
                        this._state = InflateState.CData;
                        return true;
                    default:
                        throw new FormatError('Invalid data');
                }
            case InflateState.Flat: {
                let rlen: number = this._len < this._needed ? this._len : this._needed;
                let bytes: Uint8Array = IOHelper.readByteArray(this._input, rlen);
                this._len -= rlen;
                this.addBytes(bytes, 0, rlen);
                if (this._len === 0) this._state = this._isFinal ? InflateState.Crc : InflateState.Block;
                return this._needed > 0;
            }
            case InflateState.DistOne: {
                let rlen: number = this._len < this._needed ? this._len : this._needed;
                this.addDistOne(rlen);
                this._len -= rlen;
                if (this._len === 0) {
                    this._state = InflateState.CData;
                }
                return this._needed > 0;
            }
            case InflateState.Dist:
                while (this._len > 0 && this._needed > 0) {
                    let rdist: number = this._len < this._dist ? this._len : this._dist;
                    let rlen: number = this._needed < rdist ? this._needed : rdist;
                    this.addDist(this._dist, rlen);
                    this._len -= rlen;
                }
                if (this._len === 0) {
                    this._state = InflateState.CData;
                }
                return this._needed > 0;
            case InflateState.CData:
                let n: number = this.applyHuffman(this._huffman);
                if (n < 256) {
                    this.addByte(n);
                    return this._needed > 0;
                } else if (n === 256) {
                    this._state = this._isFinal ? InflateState.Crc : InflateState.Block;
                    return true;
                } else {
                    n = (n - 257) & 0xff;
                    let extraBits: number = Inflate.LenExtraBitsTbl[n];
                    if (extraBits === -1) {
                        throw new FormatError('Invalid data');
                    }
                    this._len = Inflate.LenBaseValTbl[n] + this.getBits(extraBits);
                    let huffdist: Huffman | null = this._huffdist;
                    let distCode: number = !huffdist ? this.getRevBits(5) : this.applyHuffman(huffdist);
                    extraBits = Inflate.DistExtraBitsTbl[distCode];
                    if (extraBits === -1) {
                        throw new FormatError('Invalid data');
                    }
                    this._dist = Inflate.DistBaseValTbl[distCode] + this.getBits(extraBits);
                    if (this._dist > this._window.available()) {
                        throw new FormatError('Invalid data');
                    }
                    this._state = this._dist === 1 ? InflateState.DistOne : InflateState.Dist;
                    return true;
                }
        }
        return false;
    }

    private addDistOne(n: number): void {
        let c: number = this._window.getLastChar();
        for (let i: number = 0; i < n; i++) {
            this.addByte(c);
        }
    }

    private addByte(b: number): void {
        this._window.addByte(b);
        this._output![this._outpos] = b;
        this._needed--;
        this._outpos++;
    }

    private addDist(d: number, len: number): void {
        this.addBytes(this._window.buffer, this._window.pos - d, len);
    }

    private getBit(): boolean {
        if (this._nbits === 0) {
            this._nbits = 8;
            this._bits = this._input.readByte();
        }
        let b: boolean = (this._bits & 1) === 1;
        this._nbits--;
        this._bits = this._bits >> 1;
        return b;
    }

    private getBits(n: number): number {
        while (this._nbits < n) {
            this._bits = this._bits | (this._input.readByte() << this._nbits);
            this._nbits += 8;
        }
        let b: number = this._bits & ((1 << n) - 1);
        this._nbits -= n;
        this._bits = this._bits >> n;
        return b;
    }

    private getRevBits(n: number): number {
        return n === 0 ? 0 : this.getBit() ? (1 << (n - 1)) | this.getRevBits(n - 1) : this.getRevBits(n - 1);
    }

    private resetBits(): void {
        this._bits = 0;
        this._nbits = 0;
    }

    private addBytes(b: Uint8Array, p: number, len: number): void {
        this._window.addBytes(b, p, len);
        this._output!.set(b.subarray(p, p + len), this._outpos);
        this._needed -= len;
        this._outpos += len;
    }

    private inflateLengths(a: number[], max: number): void {
        let i: number = 0;
        let prev: number = 0;
        while (i < max) {
            let n: number = this.applyHuffman(this._huffman);
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
                    let end: number = i + 3 + this.getBits(2);
                    if (end > max) {
                        throw new FormatError('Invalid data');
                    }
                    while (i < end) {
                        a[i] = prev;
                        i++;
                    }
                    break;
                case 17:
                    i += 3 + this.getBits(3);
                    if (i > max) {
                        throw new FormatError('Invalid data');
                    }
                    break;
                case 18:
                    i += 11 + this.getBits(7);
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

    private applyHuffman(h: Huffman): number {
        if (h instanceof HuffmanFound) {
            return h.n;
        }
        if (h instanceof HuffmanNeedBit) {
            return this.applyHuffman(this.getBit() ? h.right : h.left);
        }
        if (h instanceof HuffmanNeedBits) {
            return this.applyHuffman(h.table[this.getBits(h.n)]);
        }
        throw new FormatError('Invalid data');
    }
}
