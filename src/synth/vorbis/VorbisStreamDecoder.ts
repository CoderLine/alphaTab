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
import type { VorbisStream } from '@src/synth/vorbis/VorbisStream';
import type { OggPacket } from '@src/synth/vorbis/OggReader';
import { ByteBuffer } from '@src/io/ByteBuffer';
import { TypeConversions } from '@src/io/TypeConversions';
import { IntBitReader } from '@src/synth/vorbis/IntBitReader';

export class VorbisSetupHeader {
    public codebooks: VorbisCodebook[] = [];
    public timeDomainTransforms: VorbisTimeDomainTransform[] = [];
    public floors: VorbisFloor[] = [];
    public residues: VorbisResidue[] = [];
    public mappings: VorbisMapping[] = [];
    public modes: VorbisMode[] = [];
}

class VorbisUtils {
    static ilog(x: number): number {
        let cnt = 0;
        while (x > 0) {
            ++cnt;
            x >>= 1; // this is safe because we'll never get here if the sign bit is set
        }
        return cnt;
    }

    static bitReverse(on: number, bits: number = 32) {
        let bn = BigInt(on);
        bn = ((bn & BigInt(0xaaaaaaaa)) >> 1n) | ((bn & BigInt(0x55555555)) << 1n);
        bn = ((bn & BigInt(0xcccccccc)) >> 2n) | ((bn & BigInt(0x33333333)) << 2n);
        bn = ((bn & BigInt(0xf0f0f0f0)) >> 4n) | ((bn & BigInt(0x0f0f0f0f)) << 4n);
        bn = ((bn & BigInt(0xff00ff00)) >> 8n) | ((bn & BigInt(0x00ff00ff)) << 8n);

        bn = ((bn >> 16n) | (bn << 16n)) >> (32n - BigInt(bits));
        const x = Number(BigInt.asUintN(32, bn));
        return x;
    }

    static convertFromVorbisFloat32(bits: number): number {
        // https://xiph.org/vorbis/doc/Vorbis_I_spec.html#x1-1200009.2.2
        const big = BigInt(bits);
        let bmantissa = big & BigInt(0x1fffff);
        const bsign = big & BigInt(0x80000000);
        const bexponent = (big & BigInt(0x7fe00000)) >> 21n;
        if (bsign !== 0n) {
            bmantissa = -bmantissa;
        }
        return Number(bmantissa) * Math.pow(2.0, Number(bexponent) - 788);
    }
}

interface IFastList {
    get(index: number): number;
}

class FastListArray implements IFastList {
    private _data: Int32Array;
    public constructor(data: Int32Array) {
        this._data = data;
    }
    public get(index: number): number {
        return this._data[index];
    }
}
class FastRange implements IFastList {
    public static readonly instance = new FastRange();
    public get(index: number) {
        return index;
    }
}

export class VorbisCodebook {
    private _lengths: Int32Array;
    private _maxBits: number = 0;

    private _overflowList: (HuffmanListNode | null)[] | null = null;
    private _prefixList: (HuffmanListNode | null)[] | null = null;
    private _prefixBitLength: number = 0;
    private _lookupTable!: Float32Array;

    public dimensions: number = 0;
    public entries: number = 0;
    public mapType: number = 0;

    public constructor(packet: IntBitReader, huffman: Huffman) {
        // first, check the sync pattern
        const chkVal = packet.readBits(24);
        if (chkVal !== 0x564342) {
            throw new AlphaTabError(AlphaTabErrorType.Format, 'Vorbis: Book header had invalid signature!');
        }

        // get the counts
        this.dimensions = packet.readBits(16);
        this.entries = packet.readBits(24);

        // init the storage
        this._lengths = new Int32Array(this.entries);

        this.initTree(packet, huffman);
        this.initLookupTable(packet);
    }

    public get(entry: number, dim: number): number {
        return this._lookupTable[entry * this.dimensions + dim];
    }

    public decodeScalar(packet: IntBitReader): number {
        let data = packet.tryPeekBits(this._prefixBitLength);
        if (data.bitsRead === 0) {
            return -1;
        }

        // try to get the value from the prefix list...
        let node = this._prefixList![data.value];
        if (node != null) {
            packet.skipBits(node.length);
            return node.value;
        }

        // nope, not possible... run through the overflow nodes
        data = packet.tryPeekBits(this._maxBits);

        if (this._overflowList !== null) {
            for (let i = 0; i < this._overflowList.length; i++) {
                node = this._overflowList[i]!;
                const bits = data.value & node.mask;
                if (node.bits === bits) {
                    packet.skipBits(node.length);
                    return node.value;
                }
            }
        }

        return -1;
    }

    private initTree(packet: IntBitReader, huffman: Huffman) {
        let sparse: boolean;
        let total = 0;

        let maxLen: number;
        if (packet.readBit()) {
            // ordered
            let len = packet.readBits(5) + 1;
            for (let i = 0; i < this.entries; ) {
                let cnt = packet.readBits(VorbisUtils.ilog(this.entries - i));

                while (--cnt >= 0) {
                    this._lengths[i++] = len;
                }

                ++len;
            }
            total = 0;
            sparse = false;
            maxLen = len;
        } else {
            // unordered
            maxLen = -1;
            sparse = packet.readBit();
            for (let i = 0; i < this.entries; i++) {
                if (!sparse || packet.readBit()) {
                    this._lengths[i] = packet.readBits(5) + 1;
                    ++total;
                } else {
                    // mark the entry as unused
                    this._lengths[i] = -1;
                }
                if (this._lengths[i] > maxLen) {
                    maxLen = this._lengths[i];
                }
            }
        }

        // figure out the maximum bit size; if all are unused, don't do anything else
        this._maxBits = maxLen;
        if (maxLen > -1) {
            let codewordLengths: Int32Array | null = null;
            if (sparse && total >= this.entries >> 2) {
                codewordLengths = new Int32Array(this.entries);
                codewordLengths.set(this._lengths.subarray(0, this.entries), 0);
                sparse = false;
            }

            let sortedCount: number;
            // compute size of sorted tables
            if (sparse) {
                sortedCount = total;
            } else {
                sortedCount = 0;
            }

            let values: Int32Array | null = null;
            let codewords: Int32Array | null = null;
            if (!sparse) {
                codewords = new Int32Array(this.entries);
            } else if (sortedCount !== 0) {
                codewordLengths = new Int32Array(sortedCount);
                codewords = new Int32Array(sortedCount);
                values = new Int32Array(sortedCount);
            }

            if (!this.computeCodewords(sparse, codewords, codewordLengths, this._lengths, this.entries, values)) {
                throw new AlphaTabError(AlphaTabErrorType.Format, 'Vorbis: Failed to compute codewords');
            }

            const valueList: IFastList = values == null ? FastRange.instance : new FastListArray(values);

            huffman.generateTable(valueList, codewordLengths ?? this._lengths, codewords);
            this._prefixList = huffman.prefixTree;
            this._prefixBitLength = huffman.tableBits;
            this._overflowList = huffman.overflowList;
        }
    }

    private computeCodewords(
        sparse: boolean,
        codewords: Int32Array | null,
        codewordLengths: Int32Array | null,
        len: Int32Array,
        n: number,
        values: Int32Array | null
    ): boolean {
        const available = new Uint32Array(32);

        let k: number = 0;
        let m: number = 0;

        for (k = 0; k < n; ++k) {
            if (len[k] > 0) {
                break;
            }
        }
        if (k === n) {
            return true;
        }

        this.addEntry(sparse, codewords, codewordLengths, 0, k, m++, len[k], values);

        for (let i = 1; i <= len[k]; ++i) {
            available[i] = 1 << (32 - i);
        }

        for (let i = k + 1; i < n; ++i) {
            let z = len[i];
            if (z <= 0) {
                continue;
            }

            while (z > 0 && available[z] === 0) {
                --z;
            }
            if (z === 0) {
                return false;
            }

            const res = available[z];
            available[z] = 0;
            this.addEntry(sparse, codewords, codewordLengths, VorbisUtils.bitReverse(res), i, m++, len[i], values);

            if (z !== len[i]) {
                for (let y = len[i]; y > z; --y) {
                    available[y] = res + (1 << (32 - y));
                }
            }
        }

        return true;
    }

    private addEntry(
        sparse: boolean,
        codewords: Int32Array | null,
        codewordLengths: Int32Array | null,
        huffCode: number,
        symbol: number,
        count: number,
        len: number,
        values: Int32Array | null
    ) {
        if (sparse) {
            codewords![count] = huffCode;
            codewordLengths![count] = len;
            values![count] = symbol;
        } else {
            codewords![symbol] = huffCode;
        }
    }

    private initLookupTable(packet: IntBitReader) {
        this.mapType = packet.readBits(4);
        if (this.mapType === 0) {
            return;
        }

        const minValue = VorbisUtils.convertFromVorbisFloat32(packet.readBits(32));
        const deltaValue = VorbisUtils.convertFromVorbisFloat32(packet.readBits(32));
        const valueBits = packet.readBits(4) + 1;
        const sequence_p = packet.readBit();

        let lookupValueCount = this.entries * this.dimensions;
        const lookupTable = new Float32Array(lookupValueCount);
        if (this.mapType === 1) {
            lookupValueCount = this.lookup1Values();
        }

        const multiplicands = new Uint32Array(lookupValueCount);
        for (let i = 0; i < lookupValueCount; i++) {
            multiplicands[i] = packet.readBits(valueBits);
        }

        // now that we have the initial data read in, calculate the entry tree
        if (this.mapType === 1) {
            for (let idx = 0; idx < this.entries; idx++) {
                let last = 0.0;
                let idxDiv = 1;
                for (let i = 0; i < this.dimensions; i++) {
                    const moff = ((idx / idxDiv) % lookupValueCount) | 0;
                    const value = multiplicands[moff] * deltaValue + minValue + last;
                    lookupTable[idx * this.dimensions + i] = value;

                    if (sequence_p) {
                        last = value;
                    }

                    idxDiv *= lookupValueCount;
                }
            }
        } else {
            for (let idx = 0; idx < this.entries; idx++) {
                let last = 0.0;
                let moff = idx * this.dimensions;
                for (let i = 0; i < this.dimensions; i++) {
                    const value = multiplicands[moff] * deltaValue + minValue + last;
                    lookupTable[idx * this.dimensions + i] = value;

                    if (sequence_p) {
                        last = value;
                    }

                    ++moff;
                }
            }
        }

        this._lookupTable = lookupTable;
    }

    private lookup1Values(): number {
        let r = Math.floor(Math.exp(Math.log(this.entries) / this.dimensions));

        if (Math.floor(Math.pow(r + 1, this.dimensions)) <= this.entries) {
            ++r;
        }

        return r;
    }
}

class HuffmanListNode {
    public value: number = 0;

    public length: number = 0;
    public bits: number = 0;
    public mask: number = 0;
}

export class Huffman {
    public static readonly MAX_TABLE_BITS = 10;

    public tableBits: number = 0;
    public prefixTree: (HuffmanListNode | null)[] = [];
    public overflowList: (HuffmanListNode | null)[] | null = null;

    public generateTable(values: IFastList, lengthList: Int32Array, codeList: Int32Array | null) {
        const list = new Array<HuffmanListNode>(lengthList.length);

        let maxLen = 0;
        for (let i = 0; i < list.length; i++) {
            const node = new HuffmanListNode();
            node.value = values.get(i);
            node.length = lengthList[i] <= 0 ? 99999 : lengthList[i];
            node.bits = codeList![i];
            node.mask = (1 << lengthList[i]) - 1;
            list[i] = node;
            if (lengthList[i] > 0 && maxLen < lengthList[i]) {
                maxLen = lengthList[i];
            }
        }

        list.sort((a, b) => {
            const len = a.length - b.length;
            if (len === 0) {
                return a.bits - b.bits;
            }
            return len;
        });

        const tableBits = maxLen > Huffman.MAX_TABLE_BITS ? Huffman.MAX_TABLE_BITS : maxLen;

        const prefixList: (HuffmanListNode | null)[] = [];
        let overflowList: (HuffmanListNode | null)[] | null = null;
        for (let i = 0; i < list.length && list[i].length < 99999; i++) {
            const itemBits = list[i].length;
            if (itemBits > tableBits) {
                overflowList = [];
                for (; i < list.length && list[i].length < 99999; i++) {
                    overflowList.push(list[i]);
                }
            } else {
                const maxVal = 1 << (tableBits - itemBits);
                const item = list[i];
                for (let j = 0; j < maxVal; j++) {
                    const idx = (j << itemBits) | item.bits;
                    while (prefixList.length <= idx) {
                        prefixList.push(null);
                    }
                    prefixList[idx] = item;
                }
            }
        }

        while (prefixList.length < 1 << tableBits) {
            prefixList.push(null);
        }

        this.tableBits = tableBits;
        this.prefixTree = prefixList;
        this.overflowList = overflowList;
    }
}

export class VorbisTimeDomainTransform {
    public constructor(packet: IntBitReader) {
        packet.readBits(16);
    }
}

export interface IVorbisFloorData {
    readonly executeChannel: boolean;
    forceEnergy: boolean;
    forceNoEnergy: boolean;
}

export interface IVorbisFloor {
    unpack(packet: IntBitReader, blockSize: number, channel: number): IVorbisFloorData;
    apply(floorData: IVorbisFloorData, blockSize: number, residue: Float32Array): void;
}

class VorbisFloorData0 implements IVorbisFloorData {
    public coeff: Float32Array;
    public amp: number = 0;

    public get executeChannel() {
        return (this.forceEnergy || this.amp > 0) && !this.forceNoEnergy;
    }

    public forceEnergy: boolean = false;
    public forceNoEnergy: boolean = false;

    public constructor(coeff: Float32Array) {
        this.coeff = coeff;
    }
}

export class VorbisFloor0 implements IVorbisFloor {
    private _order: number;
    private _rate: number;
    private _bark_map_size: number;
    private _ampBits: number;
    private _ampOfs: number;
    private _ampDiv: number;

    private _books: VorbisCodebook[];
    private _bookBits: number;
    private _wMap: Map<number, Float32Array>;
    private _barkMaps: Map<number, Int32Array>;

    public constructor(packet: IntBitReader, block0Size: number, block1Size: number, codebooks: VorbisCodebook[]) {
        this._order = packet.readBits(8);
        this._rate = packet.readBits(16);
        this._bark_map_size = packet.readBits(16);
        this._ampBits = packet.readBits(6);
        this._ampOfs = packet.readBits(8);
        this._books = new Array<VorbisCodebook>(packet.readBits(4) + 1);

        if (this._order < 1 || this._rate < 1 || this._bark_map_size < 1 || this._books.length === 0) {
            throw new AlphaTabError(AlphaTabErrorType.Format, 'Vorbis: Invalid Floor0 Data');
        }

        this._ampDiv = (1 << this._ampBits) - 1;

        for (let i = 0; i < this._books.length; i++) {
            const num = packet.readBits(8);
            if (num < 0 || num >= codebooks.length) {
                throw new AlphaTabError(AlphaTabErrorType.Format, 'Vorbis: Invalid Floor0 Data');
            }

            const book = codebooks[num];

            if (book.mapType === 0 || book.dimensions < 1) {
                throw new AlphaTabError(AlphaTabErrorType.Format, 'Vorbis: Invalid Floor0 Data');
            }

            this._books[i] = book;
        }
        this._bookBits = VorbisUtils.ilog(this._books.length);

        this._barkMaps = new Map<number, Int32Array>([
            [block0Size, this.synthesizeBarkCurve(block0Size / 2)],
            [block1Size, this.synthesizeBarkCurve(block1Size / 2)]
        ]);
        this._wMap = new Map<number, Float32Array>([
            [block0Size, this.synthesizeWDelMap(block0Size / 2)],
            [block1Size, this.synthesizeWDelMap(block1Size / 2)]
        ]);
    }

    private synthesizeBarkCurve(n: number): Int32Array {
        const scale = this._bark_map_size / VorbisFloor0.toBARK(this._rate / 2);

        const map = new Int32Array(n + 1);

        for (let i = 0; i < n - 1; i++) {
            map[i] = Math.min(
                this._bark_map_size - 1,
                Math.floor(VorbisFloor0.toBARK((this._rate / 2 / n) * i) * scale)
            );
        }
        map[n] = -1;
        return map;
    }

    private static toBARK(lsp: number): number {
        return 13.1 * Math.atan(0.00074 * lsp) + 2.24 * Math.atan(0.0000000185 * lsp * lsp) + 0.0001 * lsp;
    }

    private synthesizeWDelMap(n: number) {
        const wdel = Math.PI / this._bark_map_size;

        const map = new Float32Array(n);
        for (let i = 0; i < n; i++) {
            map[i] = 2 * Math.cos(wdel * i);
        }
        return map;
    }

    public unpack(packet: IntBitReader, blockSize: number, channel: number): IVorbisFloorData {
        const data = new VorbisFloorData0(new Float32Array(this._order + 1));

        data.amp = packet.readBits(this._ampBits);

        if (data.amp > 0) {
            data.amp = (data.amp / this._ampDiv) * this._ampOfs;

            const bookNum = packet.readBits(this._bookBits);
            if (bookNum >= this._books.length) {
                // we ran out of data or the packet is corrupt...  0 the floor and return
                data.amp = 0;
                return data;
            }
            const book = this._books[bookNum];

            // first, the book decode...
            for (let i = 0; i < this._order; ) {
                const entry = book.decodeScalar(packet);
                if (entry === -1) {
                    // we ran out of data or the packet is corrupt...  0 the floor and return
                    data.amp = 0;
                    return data;
                }
                for (let j = 0; i < this._order && j < book.dimensions; j++, i++) {
                    data.coeff[i] = book.get(entry, j);
                }
            }

            // then, the "averaging"
            let last = 0;
            for (let j = 0; j < this._order; ) {
                for (let k = 0; j < this._order && k < book.dimensions; j++, k++) {
                    data.coeff[j] += last;
                }
                last = data.coeff[j - 1];
            }
        }

        return data;
    }

    public apply(floorData: IVorbisFloorData, blockSize: number, residue: Float32Array): void {
        const data = floorData as VorbisFloorData0;
        const n = blockSize / 2;

        if (data.amp > 0) {
            // this is pretty well stolen directly from libvorbis...  BSD license
            const barkMap = this._barkMaps.get(blockSize)!;
            const wMap = this._wMap.get(blockSize)!;

            let i = 0;
            for (i = 0; i < this._order; i++) {
                data.coeff[i] = 2 * Math.cos(data.coeff[i]);
            }

            i = 0;
            while (i < n) {
                let j: number = 0;
                const k = barkMap[i];
                let p = 0.5;
                let q = 0.5;
                const w = wMap[k];
                for (j = 1; j < this._order; j += 2) {
                    q *= w - data.coeff[j - 1];
                    p *= w - data.coeff[j];
                }
                if (j === this._order) {
                    // odd order filter; slightly assymetric

                    q *= w - data.coeff[j - 1];
                    // biome-ignore lint/suspicious/noMisrefactoredShorthandAssign: Correct calculation here
                    p *= p * (4 - w * w);
                    q *= q;
                } else {
                    // even order filter; still symetric

                    // biome-ignore lint/suspicious/noMisrefactoredShorthandAssign: Correct calculation here
                    p *= p * (2 - w);
                    // biome-ignore lint/suspicious/noMisrefactoredShorthandAssign: Correct calculation here
                    q *= q * (2 + w);
                }

                // calc the dB of this bark section
                q = data.amp / Math.sqrt(p + q) - this._ampOfs;

                // now convert to a linear sample multiplier
                q = Math.exp(q * 0.11512925);

                residue[i] *= q;

                while (barkMap[++i] === k) {
                    residue[i] *= q;
                }
            }
        } else {
            residue.fill(0, 0, n);
        }
    }
}

class VorbisFloor1Data implements IVorbisFloorData {
    public posts = new Int32Array(64);
    public postCount: number = 0;

    public get executeChannel() {
        return (this.forceEnergy || this.postCount > 0) && !this.forceNoEnergy;
    }

    public forceEnergy: boolean = false;
    public forceNoEnergy: boolean = false;
}

export class VorbisFloor1 implements IVorbisFloor {
    private static readonly _rangeLookup = [256, 128, 86, 64];
    private static readonly _yBitsLookup = [8, 7, 7, 6];

    private _partitionClass: Int32Array;
    private _classDimensions: Int32Array;
    private _classSubclasses: Int32Array;
    private _xList: Int32Array;
    private _classMasterBookIndex: Int32Array;
    private _hNeigh: Int32Array;
    private _lNeigh: Int32Array;
    private _sortIdx: Int32Array;

    private _multiplier: number;
    private _range: number;
    private _yBits: number;

    private _classMasterbooks: VorbisCodebook[];
    private _subclassBooks: (VorbisCodebook | null)[][];
    private _subclassBookIndex: Int32Array[];

    public constructor(packet: IntBitReader, codebooks: VorbisCodebook[]) {
        let maximum_class = -1;
        this._partitionClass = new Int32Array(packet.readBits(5));
        for (let i = 0; i < this._partitionClass.length; i++) {
            this._partitionClass[i] = packet.readBits(4);
            if (this._partitionClass[i] > maximum_class) {
                maximum_class = this._partitionClass[i];
            }
        }

        ++maximum_class;

        this._classDimensions = new Int32Array(maximum_class);
        this._classSubclasses = new Int32Array(maximum_class);
        this._classMasterbooks = new Array<VorbisCodebook>(maximum_class);
        this._classMasterBookIndex = new Int32Array(maximum_class);
        this._subclassBooks = new Array<(VorbisCodebook | null)[]>(maximum_class);
        this._subclassBookIndex = new Array<Int32Array>(maximum_class);
        for (let i = 0; i < maximum_class; i++) {
            this._classDimensions[i] = packet.readBits(3) + 1;
            this._classSubclasses[i] = packet.readBits(2);
            if (this._classSubclasses[i] > 0) {
                this._classMasterBookIndex[i] = packet.readBits(8);
                this._classMasterbooks[i] = codebooks[this._classMasterBookIndex[i]];
            }

            this._subclassBooks[i] = new Array<VorbisCodebook | null>(1 << this._classSubclasses[i]);
            this._subclassBookIndex[i] = new Int32Array(this._subclassBooks[i].length);
            for (let j = 0; j < this._subclassBooks[i].length; j++) {
                const bookNum = packet.readBits(8) - 1;
                if (bookNum >= 0) {
                    this._subclassBooks[i][j] = codebooks[bookNum];
                }
                this._subclassBookIndex[i][j] = bookNum;
            }
        }

        this._multiplier = packet.readBits(2);

        this._range = VorbisFloor1._rangeLookup[this._multiplier];
        this._yBits = VorbisFloor1._yBitsLookup[this._multiplier];

        ++this._multiplier;

        const rangeBits = packet.readBits(4);

        const xList: number[] = [];
        xList.push(0);
        xList.push(1 << rangeBits);

        for (let i = 0; i < this._partitionClass.length; i++) {
            const classNum = this._partitionClass[i];
            for (let j = 0; j < this._classDimensions[classNum]; j++) {
                xList.push(packet.readBits(rangeBits));
            }
        }
        this._xList = new Int32Array(xList);

        // precalc the low and high neighbors (and init the sort table)
        this._lNeigh = new Int32Array(xList.length);
        this._hNeigh = new Int32Array(xList.length);
        this._sortIdx = new Int32Array(xList.length);
        this._sortIdx[0] = 0;
        this._sortIdx[1] = 1;
        for (let i = 2; i < this._lNeigh.length; i++) {
            this._lNeigh[i] = 0;
            this._hNeigh[i] = 1;
            this._sortIdx[i] = i;
            for (let j = 2; j < i; j++) {
                const temp = this._xList[j];
                if (temp < this._xList[i]) {
                    if (temp > this._xList[this._lNeigh[i]]) {
                        this._lNeigh[i] = j;
                    }
                } else {
                    if (temp < this._xList[this._hNeigh[i]]) {
                        this._hNeigh[i] = j;
                    }
                }
            }
        }

        // precalc the sort table
        for (let i = 0; i < this._sortIdx.length - 1; i++) {
            for (let j = i + 1; j < this._sortIdx.length; j++) {
                if (this._xList[i] === this._xList[j]) {
                    throw new AlphaTabError(AlphaTabErrorType.Format, 'Vorbis: Invalid Floor1 Data');
                }

                if (this._xList[this._sortIdx[i]] > this._xList[this._sortIdx[j]]) {
                    // swap the sort indexes
                    const temp = this._sortIdx[i];
                    this._sortIdx[i] = this._sortIdx[j];
                    this._sortIdx[j] = temp;
                }
            }
        }
    }

    public unpack(packet: IntBitReader, blockSize: number, channel: number): IVorbisFloorData {
        const data = new VorbisFloor1Data();

        // hoist ReadPosts to here since that's all we're doing...
        if (packet.readBit()) {
            let postCount = 2;
            data.posts[0] = packet.readBits(this._yBits);
            data.posts[1] = packet.readBits(this._yBits);

            for (let i = 0; i < this._partitionClass.length; i++) {
                const clsNum = this._partitionClass[i];
                const cdim = this._classDimensions[clsNum];
                const cbits = this._classSubclasses[clsNum];
                const csub = (1 << cbits) - 1;
                let cval = 0;
                if (cbits > 0) {
                    cval = this._classMasterbooks[clsNum].decodeScalar(packet);
                    if (cval === -1) {
                        // we read a bad value...  bail
                        postCount = 0;
                        break;
                    }
                }
                for (let j = 0; j < cdim; j++) {
                    const book = this._subclassBooks[clsNum][cval & csub];
                    cval = cval >> cbits;
                    if (book != null) {
                        data.posts[postCount] = book.decodeScalar(packet);
                        if (data.posts[postCount] === -1) {
                            // we read a bad value... bail
                            postCount = 0;
                            i = this._partitionClass.length;
                            break;
                        }
                    }
                    ++postCount;
                }
            }

            data.postCount = postCount;
        }

        return data;
    }

    public apply(floorData: IVorbisFloorData, blockSize: number, residue: Float32Array) {
        const data = floorData as VorbisFloor1Data;

        const n = blockSize / 2;

        if (data.postCount > 0) {
            const stepFlags = this.unwrapPosts(data);

            let lx = 0;

            let ly = data.posts[0] * this._multiplier;
            for (let i = 1; i < data.postCount; i++) {
                const idx = this._sortIdx[i];

                if (stepFlags[idx]) {
                    const hx = this._xList[idx];
                    const hy = data.posts[idx] * this._multiplier;
                    if (lx < n) {
                        this.renderLineMulti(lx, ly, Math.min(hx, n), hy, residue);
                    }
                    lx = hx;
                    ly = hy;
                }
                if (lx >= n) {
                    break;
                }
            }

            if (lx < n) {
                this.renderLineMulti(lx, ly, n, ly, residue);
            }
        } else {
            residue.fill(0, 0, n);
        }
    }

    private unwrapPosts(data: VorbisFloor1Data): boolean[] {
        const stepFlags = new Array<boolean>(64);
        stepFlags.fill(false);
        stepFlags[0] = true;
        stepFlags[1] = true;

        const finalY = new Int32Array(64);
        finalY[0] = data.posts[0];
        finalY[1] = data.posts[1];

        for (let i = 2; i < data.postCount; i++) {
            const lowOfs = this._lNeigh[i];
            const highOfs = this._hNeigh[i];

            const predicted = this.renderPoint(
                this._xList[lowOfs],
                finalY[lowOfs],
                this._xList[highOfs],
                finalY[highOfs],
                this._xList[i]
            );

            const val = data.posts[i];
            const highroom = this._range - predicted;
            const lowroom = predicted;
            let room: number;
            if (highroom < lowroom) {
                room = highroom * 2;
            } else {
                room = lowroom * 2;
            }
            if (val !== 0) {
                stepFlags[lowOfs] = true;
                stepFlags[highOfs] = true;
                stepFlags[i] = true;

                if (val >= room) {
                    if (highroom > lowroom) {
                        finalY[i] = val - lowroom + predicted;
                    } else {
                        finalY[i] = predicted - val + highroom - 1;
                    }
                } else {
                    if (val % 2 === 1) {
                        // odd
                        finalY[i] = predicted - (val + 1) / 2;
                    } else {
                        // even
                        finalY[i] = predicted + val / 2;
                    }
                }
            } else {
                stepFlags[i] = false;
                finalY[i] = predicted;
            }
        }

        for (let i = 0; i < data.postCount; i++) {
            data.posts[i] = finalY[i];
        }

        return stepFlags;
    }

    private renderPoint(x0: number, y0: number, x1: number, y1: number, X: number) {
        const dy = y1 - y0;
        const adx = x1 - x0;
        const ady = Math.abs(dy);
        const err = ady * (X - x0);
        const off = (err / adx) | 0;
        if (dy < 0) {
            return y0 - off;
        }
        return y0 + off;
    }

    private renderLineMulti(x0: number, y0: number, x1: number, y1: number, v: Float32Array) {
        const dy = y1 - y0;
        const adx = x1 - x0;
        let ady = Math.abs(dy);
        const sy = 1 - ((dy >> 31) & 1) * 2;
        const b = (dy / adx) | 0;
        let x = x0;
        let y = y0;
        let err = -adx;

        v[x0] *= VorbisFloor1.inverse_dB_table[y0];
        ady -= Math.abs(b) * adx;

        while (++x < x1) {
            y += b;
            err += ady;
            if (err >= 0) {
                err -= adx;
                y += sy;
            }
            v[x] *= VorbisFloor1.inverse_dB_table[y];
        }
    }

    // prettier-ignore
    private static readonly inverse_dB_table = new Float32Array([
        1.0649863e-7, 1.1341951e-7, 1.2079015e-7, 1.2863978e-7, 1.3699951e-7, 1.4590251e-7, 1.5538408e-7, 1.6548181e-7,
        1.7623575e-7, 1.8768855e-7, 1.9988561e-7, 2.128753e-7, 2.2670913e-7, 2.4144197e-7, 2.5713223e-7, 2.7384213e-7,
        2.9163793e-7, 3.1059021e-7, 3.3077411e-7, 3.5226968e-7, 3.7516214e-7, 3.9954229e-7, 4.255068e-7, 4.5315863e-7,
        4.8260743e-7, 5.1396998e-7, 5.4737065e-7, 5.8294187e-7, 6.2082472e-7, 6.6116941e-7, 7.0413592e-7, 7.4989464e-7,
        7.9862701e-7, 8.505263e-7, 9.0579828e-7, 9.6466216e-7, 1.0273513e-6, 1.0941144e-6, 1.1652161e-6, 1.2409384e-6,
        1.3215816e-6, 1.4074654e-6, 1.4989305e-6, 1.5963394e-6, 1.7000785e-6, 1.8105592e-6, 1.9282195e-6, 2.0535261e-6,
        2.1869758e-6, 2.3290978e-6, 2.4804557e-6, 2.6416497e-6, 2.813319e-6, 2.9961443e-6, 3.1908506e-6, 3.3982101e-6,
        3.6190449e-6, 3.8542308e-6, 4.1047004e-6, 4.371447e-6, 4.6555282e-6, 4.9580707e-6, 5.280274e-6, 5.623416e-6,
        5.9888572e-6, 6.3780469e-6, 6.7925283e-6, 7.2339451e-6, 7.7040476e-6, 8.2047e-6, 8.7378876e-6, 9.3057248e-6,
        9.9104632e-6, 1.0554501e-5, 1.1240392e-5, 1.1970856e-5, 1.2748789e-5, 1.3577278e-5, 1.4459606e-5, 1.5399272e-5,
        1.6400004e-5, 1.7465768e-5, 1.8600792e-5, 1.9809576e-5, 2.1096914e-5, 2.2467911e-5, 2.3928002e-5, 2.5482978e-5,
        2.7139006e-5, 2.8902651e-5, 3.0780908e-5, 3.2781225e-5, 3.4911534e-5, 3.7180282e-5, 3.9596466e-5, 4.2169667e-5,
        4.491009e-5, 4.7828601e-5, 5.0936773e-5, 5.4246931e-5, 5.7772202e-5, 6.1526565e-5, 6.5524908e-5, 6.9783085e-5,
        7.4317983e-5, 7.9147585e-5, 8.429104e-5, 8.9768747e-5, 9.5602426e-5, 0.00010181521, 0.00010843174,
        0.00011547824, 0.00012298267, 0.00013097477, 0.00013948625, 0.00014855085, 0.00015820453, 0.00016848555,
        0.00017943469, 0.00019109536, 0.00020351382, 0.00021673929, 0.00023082423, 0.00024582449, 0.00026179955,
        0.00027881276, 0.00029693158, 0.00031622787, 0.00033677814, 0.00035866388, 0.00038197188, 0.00040679456,
        0.00043323036, 0.00046138411, 0.00049136745, 0.00052329927, 0.00055730621, 0.00059352311, 0.00063209358,
        0.00067317058, 0.000716917, 0.0007635063, 0.00081312324, 0.00086596457, 0.00092223983, 0.00098217216,
        0.0010459992, 0.0011139742, 0.0011863665, 0.0012634633, 0.0013455702, 0.0014330129, 0.0015261382, 0.0016253153,
        0.0017309374, 0.0018434235, 0.0019632195, 0.0020908006, 0.0022266726, 0.0023713743, 0.0025254795, 0.0026895994,
        0.0028643847, 0.0030505286, 0.0032487691, 0.0034598925, 0.0036847358, 0.0039241906, 0.0041792066, 0.004450795,
        0.0047400328, 0.0050480668, 0.0053761186, 0.0057254891, 0.0060975636, 0.0064938176, 0.0069158225, 0.0073652516,
        0.0078438871, 0.0083536271, 0.0088964928, 0.009474637, 0.010090352, 0.01074608, 0.011444421, 0.012188144,
        0.012980198, 0.013823725, 0.014722068, 0.015678791, 0.016697687, 0.017782797, 0.018938423, 0.020169149,
        0.021479854, 0.022875735, 0.02436233, 0.025945531, 0.027631618, 0.029427276, 0.031339626, 0.033376252,
        0.035545228, 0.037855157, 0.040315199, 0.042935108, 0.045725273, 0.048696758, 0.051861348, 0.055231591,
        0.05882085, 0.062643361, 0.066714279, 0.071049749, 0.075666962, 0.080584227, 0.085821044, 0.091398179,
        0.097337747, 0.1036633, 0.11039993, 0.11757434, 0.12521498, 0.13335215, 0.14201813, 0.15124727, 0.16107617,
        0.1715438, 0.18269168, 0.19456402, 0.20720788, 0.22067342, 0.23501402, 0.25028656, 0.26655159, 0.28387361,
        0.30232132, 0.32196786, 0.34289114, 0.36517414, 0.38890521, 0.41417847, 0.44109412, 0.4697589, 0.50028648,
        0.53279791, 0.56742212, 0.6042964, 0.64356699, 0.68538959, 0.72993007, 0.77736504, 0.8278826, 0.88168307,
        0.9389798, 1.0
    ]);
}

export class VorbisFloor implements IVorbisFloor {
    public floor: IVorbisFloor;

    public constructor(packet: IntBitReader, block0Size: number, block1Size: number, codebooks: VorbisCodebook[]) {
        const type = packet.readBits(16);
        switch (type) {
            case 0:
                this.floor = new VorbisFloor0(packet, block0Size, block1Size, codebooks);
                break;
            case 1:
                this.floor = new VorbisFloor1(packet, codebooks);
                break;

            default:
                throw new AlphaTabError(AlphaTabErrorType.Format, `Vorbis: Invalid Floor type: ${type}`);
        }
    }
    public apply(floorData: IVorbisFloorData, blockSize: number, residue: Float32Array): void {
        this.floor.apply(floorData, blockSize, residue);
    }

    public unpack(packet: IntBitReader, blockSize: number, channel: number): IVorbisFloorData {
        return this.floor.unpack(packet, blockSize, channel);
    }
}

export interface IVorbisResidue {
    decode(packet: IntBitReader, doNotDecodeChannel: boolean[], blockSize: number, buffer: Float32Array[]): void;
}

export class VorbisResidue0 implements IVorbisResidue {
    private _channels: number;
    private _begin: number;
    private _end: number;
    private _partitionSize: number;
    private _classifications: number;
    private _maxStages: number;

    private _books: (VorbisCodebook | null)[][];
    private _classBook: VorbisCodebook;

    private _cascade: Int32Array;
    private _decodeMap: Int32Array[];

    public constructor(packet: IntBitReader, channels: number, codebooks: VorbisCodebook[]) {
        this._begin = packet.readBits(24);
        this._end = packet.readBits(24);
        this._partitionSize = packet.readBits(24) + 1;
        this._classifications = packet.readBits(6) + 1;
        this._classBook = codebooks[packet.readBits(8)];

        this._cascade = new Int32Array(this._classifications);
        let acc = 0;
        for (let i = 0; i < this._classifications; i++) {
            const low_bits = packet.readBits(3);
            if (packet.readBit()) {
                this._cascade[i] = (packet.readBits(5) << 3) | low_bits;
            } else {
                this._cascade[i] = low_bits;
            }
            acc += VorbisResidue0.icount(this._cascade[i]);
        }

        const bookNums = new Int32Array(acc);
        for (let i = 0; i < acc; i++) {
            bookNums[i] = packet.readBits(8);
            if (codebooks[bookNums[i]].mapType === 0) {
                throw new AlphaTabError(AlphaTabErrorType.Format, 'Vorbis: Invalid Residue 0');
            }
        }

        const entries = this._classBook.entries;
        let dim = this._classBook.dimensions;
        let partvals = 1;
        while (dim > 0) {
            partvals *= this._classifications;
            if (partvals > entries) {
                throw new AlphaTabError(AlphaTabErrorType.Format, 'Vorbis: Invalid Residue 0');
            }
            --dim;
        }

        // now the lookups
        this._books = new Array<(VorbisCodebook | null)[]>(this._classifications);

        acc = 0;
        let maxstage = 0;
        let stages: number;
        for (let j = 0; j < this._classifications; j++) {
            stages = VorbisUtils.ilog(this._cascade[j]);
            this._books[j] = new Array<VorbisCodebook | null>(stages);
            if (stages > 0) {
                maxstage = Math.max(maxstage, stages);
                for (let k = 0; k < stages; k++) {
                    if ((this._cascade[j] & (1 << k)) > 0) {
                        this._books[j][k] = codebooks[bookNums[acc++]];
                    }
                }
            }
        }
        this._maxStages = maxstage;

        this._decodeMap = new Array<Int32Array>(partvals);
        for (let j = 0; j < partvals; j++) {
            let val = j;
            let mult = (partvals / this._classifications) | 0;
            this._decodeMap[j] = new Int32Array(this._classBook.dimensions);
            for (let k = 0; k < this._classBook.dimensions; k++) {
                const deco = (val / mult) | 0;
                val -= deco * mult;
                mult = (mult / this._classifications) | 0;
                this._decodeMap[j][k] = deco;
            }
        }

        this._channels = channels;
    }

    private static icount(v: number): number {
        let ret = 0;
        while (v !== 0) {
            ret += v & 1;
            v >>= 1;
        }
        return ret;
    }

    public decode(
        packet: IntBitReader,
        doNotDecodeChannel: boolean[],
        blockSize: number,
        buffer: Float32Array[]
    ): void {
        const end = this._end < blockSize / 2 ? this._end : blockSize / 2;
        const n = end - this._begin;

        if (n > 0 && doNotDecodeChannel.indexOf(false) !== -1) {
            const partitionCount = n / this._partitionSize;

            const partitionWords = ((partitionCount + this._classBook.dimensions - 1) / this._classBook.dimensions) | 0;
            const partWordCache: Int32Array[][] = [];
            for (let i = 0; i < this._channels; i++) {
                partWordCache.push(new Array<Int32Array>(partitionWords));
            }

            for (let stage = 0; stage < this._maxStages; stage++) {
                for (let partitionIdx = 0, entryIdx = 0; partitionIdx < partitionCount; entryIdx++) {
                    if (stage === 0) {
                        for (let ch = 0; ch < this._channels; ch++) {
                            const idx = this._classBook.decodeScalar(packet);
                            if (idx >= 0 && idx < this._decodeMap.length) {
                                partWordCache[ch][entryIdx] = this._decodeMap[idx];
                            } else {
                                partitionIdx = partitionCount;
                                stage = this._maxStages;
                                break;
                            }
                        }
                    }
                    for (
                        let dimensionIdx = 0;
                        partitionIdx < partitionCount && dimensionIdx < this._classBook.dimensions;
                        dimensionIdx++, partitionIdx++
                    ) {
                        const offset = this._begin + partitionIdx * this._partitionSize;
                        for (let ch = 0; ch < this._channels; ch++) {
                            const idx = partWordCache[ch][entryIdx][dimensionIdx];
                            if ((this._cascade[idx] & (1 << stage)) !== 0) {
                                const book = this._books[idx][stage];
                                if (book) {
                                    if (this.writeVectors(book, packet, buffer, ch, offset, this._partitionSize)) {
                                        // bad packet...  exit now and try to use what we already have
                                        partitionIdx = partitionCount;
                                        stage = this._maxStages;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    protected writeVectors(
        codebook: VorbisCodebook,
        packet: IntBitReader,
        residue: Float32Array[],
        channel: number,
        offset: number,
        partitionSize: number
    ): boolean {
        const res = residue[channel];
        const steps = partitionSize / codebook.dimensions;
        const entryCache = new Int32Array(steps);

        for (let i = 0; i < steps; i++) {
            entryCache[i] = codebook.decodeScalar(packet);
            if (entryCache[i] === -1) {
                return true;
            }
        }
        for (let dim = 0; dim < codebook.dimensions; dim++) {
            for (let step = 0; step < steps; step++, offset++) {
                res[offset] += codebook.get(entryCache[step], dim);
            }
        }
        return false;
    }
}

export class VorbisResidue1 extends VorbisResidue0 {
    protected override writeVectors(
        codebook: VorbisCodebook,
        packet: IntBitReader,
        residue: Float32Array[],
        channel: number,
        offset: number,
        partitionSize: number
    ): boolean {
        const res = residue[channel];

        for (let i = 0; i < partitionSize; ) {
            const entry = codebook.decodeScalar(packet);
            if (entry === -1) {
                return true;
            }
            for (let j = 0; j < codebook.dimensions; i++, j++) {
                res[offset + i] += codebook.get(entry, j);
            }
        }

        return false;
    }
}

export class VorbisResidue2 extends VorbisResidue0 {
    private _realChannels: number;
    public constructor(packet: IntBitReader, channels: number, codebooks: VorbisCodebook[]) {
        super(packet, 1, codebooks);
        this._realChannels = channels;
    }

    public override decode(
        packet: IntBitReader,
        doNotDecodeChannel: boolean[],
        blockSize: number,
        buffer: Float32Array[]
    ): void {
        // since we're doing all channels in a single pass, the block size has to be multiplied.
        // otherwise this is just a pass-through call
        super.decode(packet, doNotDecodeChannel, blockSize * this._realChannels, buffer);
    }

    protected override writeVectors(
        codebook: VorbisCodebook,
        packet: IntBitReader,
        residue: Float32Array[],
        channel: number,
        offset: number,
        partitionSize: number
    ): boolean {
        let chPtr = 0;

        offset /= this._realChannels;
        for (let c = 0; c < partitionSize; ) {
            const entry = codebook.decodeScalar(packet);
            if (entry === -1) {
                return true;
            }
            for (let d = 0; d < codebook.dimensions; d++, c++) {
                residue[chPtr][offset] += codebook.get(entry, d);
                if (++chPtr === this._realChannels) {
                    chPtr = 0;
                    offset++;
                }
            }
        }

        return false;
    }
}

export class VorbisResidue implements IVorbisResidue {
    public residue: IVorbisResidue;

    public constructor(packet: IntBitReader, channels: number, codebooks: VorbisCodebook[]) {
        const type = packet.readBits(16);
        switch (type) {
            case 0:
                this.residue = new VorbisResidue0(packet, channels, codebooks);
                break;
            case 1:
                this.residue = new VorbisResidue1(packet, channels, codebooks);
                break;
            case 2:
                this.residue = new VorbisResidue2(packet, channels, codebooks);
                break;

            default:
                throw new AlphaTabError(AlphaTabErrorType.Format, `Vorbis: Invalid Residue type: ${type}`);
        }
    }

    public decode(
        packet: IntBitReader,
        doNotDecodeChannel: boolean[],
        blockSize: number,
        buffer: Float32Array[]
    ): void {
        this.residue.decode(packet, doNotDecodeChannel, blockSize, buffer);
    }
}

export class VorbisMapping {
    private _mdct: Mdct;
    private _couplingAngle: Int32Array;
    private _couplingMangitude: Int32Array;
    private _submapFloor: VorbisFloor[];
    private _submapResidue: VorbisResidue[];
    private _channelFloor: VorbisFloor[];
    private _channelResidue: VorbisResidue[];

    public constructor(
        packet: IntBitReader,
        channels: number,
        floors: VorbisFloor[],
        residues: VorbisResidue[],
        mdct: Mdct
    ) {
        const mappingType = packet.readBits(16);
        if (mappingType !== 0) {
            throw new AlphaTabError(AlphaTabErrorType.Format, 'Vorbis: Invalid mapping type!');
        }

        let submapCount = 1;
        if (packet.readBit()) {
            submapCount += packet.readBits(4);
        }

        // square polar mapping
        let couplingSteps = 0;
        if (packet.readBit()) {
            couplingSteps = packet.readBits(8) + 1;
        }

        const couplingBits = VorbisUtils.ilog(channels - 1);
        this._couplingAngle = new Int32Array(couplingSteps);
        this._couplingMangitude = new Int32Array(couplingSteps);
        for (let j = 0; j < couplingSteps; j++) {
            const magnitude = packet.readBits(couplingBits);
            const angle = packet.readBits(couplingBits);
            if (magnitude === angle || magnitude > channels - 1 || angle > channels - 1) {
                throw new AlphaTabError(
                    AlphaTabErrorType.Format,
                    'Vorbis: Invalid magnitude or angle in mapping header!'
                );
            }
            this._couplingAngle[j] = angle;
            this._couplingMangitude[j] = magnitude;
        }

        if (packet.readBits(2) !== 0) {
            throw new AlphaTabError(AlphaTabErrorType.Format, 'Vorbis: Reserved bits not 0 in mapping header.');
        }

        const mux = new Int32Array(channels);
        if (submapCount > 1) {
            for (let c = 0; c < channels; c++) {
                mux[c] = packet.readBits(4);
                if (mux[c] > submapCount) {
                    throw new AlphaTabError(
                        AlphaTabErrorType.Format,
                        'Vorbis: Invalid channel mux submap index in mapping header!'
                    );
                }
            }
        }

        this._submapFloor = new Array<VorbisFloor>(submapCount);
        this._submapResidue = new Array<VorbisResidue>(submapCount);
        for (let j = 0; j < submapCount; j++) {
            packet.skipBits(8); // unused placeholder
            const floorNum = packet.readBits(8);
            if (floorNum >= floors.length) {
                throw new AlphaTabError(AlphaTabErrorType.Format, 'Vorbis: Invalid floor number in mapping header!');
            }
            const residueNum = packet.readBits(8);
            if (residueNum >= residues.length) {
                throw new AlphaTabError(AlphaTabErrorType.Format, 'Vorbis: Invalid residue number in mapping header!');
            }

            this._submapFloor[j] = floors[floorNum];
            this._submapResidue[j] = residues[residueNum];
        }

        this._channelFloor = new Array<VorbisFloor>(channels);
        this._channelResidue = new Array<VorbisResidue>(channels);
        for (let c = 0; c < channels; c++) {
            this._channelFloor[c] = this._submapFloor[mux[c]];
            this._channelResidue[c] = this._submapResidue[mux[c]];
        }
        this._mdct = mdct;
    }

    public decodePacket(packet: IntBitReader, blockSize: number, buffer: Float32Array[]) {
        const halfBlockSize = blockSize >> 1;

        // read the noise floor data
        const floorData = new Array<IVorbisFloorData>(this._channelFloor.length);
        const noExecuteChannel = new Array<boolean>(this._channelFloor.length);
        noExecuteChannel.fill(false);

        for (let i = 0; i < this._channelFloor.length; i++) {
            floorData[i] = this._channelFloor[i].unpack(packet, blockSize, i);
            noExecuteChannel[i] = !floorData[i].executeChannel;

            // pre-clear the residue buffers
            buffer[i].fill(0, 0, halfBlockSize);
        }

        // make sure we handle no-energy channels correctly given the couplings..
        for (let i = 0; i < this._couplingAngle.length; i++) {
            if (
                floorData[this._couplingAngle[i]].executeChannel ||
                floorData[this._couplingMangitude[i]].executeChannel
            ) {
                floorData[this._couplingAngle[i]].forceEnergy = true;
                floorData[this._couplingMangitude[i]].forceEnergy = true;
            }
        }

        // decode the submaps into the residue buffer
        for (let i = 0; i < this._submapFloor.length; i++) {
            for (let j = 0; j < this._channelFloor.length; j++) {
                if (
                    this._submapFloor[i] !== this._channelFloor[j] ||
                    this._submapResidue[i] !== this._channelResidue[j]
                ) {
                    // the submap doesn't match, so this floor doesn't contribute
                    floorData[j].forceNoEnergy = true;
                }
            }

            this._submapResidue[i].decode(packet, noExecuteChannel, blockSize, buffer);
        }

        // inverse coupling
        for (let i = this._couplingAngle.length - 1; i >= 0; i--) {
            if (
                floorData[this._couplingAngle[i]].executeChannel ||
                floorData[this._couplingMangitude[i]].executeChannel
            ) {
                const magnitude = buffer[this._couplingMangitude[i]];
                const angle = buffer[this._couplingAngle[i]];

                // we only have to do the first half; MDCT ignores the last half
                for (let j = 0; j < halfBlockSize; j++) {
                    let newM: number;
                    let newA: number;

                    const oldM = magnitude[j];
                    const oldA = angle[j];
                    if (oldM > 0) {
                        if (oldA > 0) {
                            newM = oldM;
                            newA = oldM - oldA;
                        } else {
                            newA = oldM;
                            newM = oldM + oldA;
                        }
                    } else {
                        if (oldA > 0) {
                            newM = oldM;
                            newA = oldM + oldA;
                        } else {
                            newA = oldM;
                            newM = oldM - oldA;
                        }
                    }

                    magnitude[j] = newM;
                    angle[j] = newA;
                }
            }
        }

        // apply floor / dot product / MDCT (only run if we have sound energy in that channel)
        for (let c = 0; c < this._channelFloor.length; c++) {
            if (floorData[c].executeChannel) {
                this._channelFloor[c].apply(floorData[c], blockSize, buffer[c]);
                this._mdct.reverse(buffer[c], blockSize);
            } else {
                // since we aren't doing the IMDCT, we have to explicitly clear the back half of the block
                buffer[c].fill(0, halfBlockSize, halfBlockSize * 2);
            }
        }
    }
}

class VorbisModeOverlapInfo {
    public packetStartIndex: number = 0;
    public packetTotalLength: number = 0;
    public packetValidLength: number = 0;
}

class VorbisModePacketInfo {
    public overlapInfo: VorbisModeOverlapInfo = new VorbisModeOverlapInfo();
    public windowIndex: number = 0;
}

class VorbisReadNextPacketResult {
    public samplePosition: number | null = null;
    public constructor(samplePosition: number | null = null) {
        this.samplePosition = samplePosition;
    }
}

export class VorbisMode {
    private static readonly M_PI2 = 3.1415926539 / 2;

    private _channels: number;
    private _blockFlag: boolean;
    private _blockSize: number;
    private _mapping: VorbisMapping;
    private _windows: Float32Array[];
    private _overlapInfo: VorbisModeOverlapInfo[] | null = null;

    public constructor(
        packet: IntBitReader,
        channels: number,
        block0Size: number,
        block1Size: number,
        mappings: VorbisMapping[]
    ) {
        this._channels = channels;

        this._blockFlag = packet.readBit();
        if (0 !== packet.readBits(32)) {
            throw new AlphaTabError(
                AlphaTabErrorType.Format,
                'Vorbis: Mode header had invalid window or transform type!'
            );
        }

        const mappingIdx = packet.readBits(8);
        if (mappingIdx >= mappings.length) {
            throw new AlphaTabError(AlphaTabErrorType.Format, 'Vorbis: Mode header had invalid mapping index!');
        }
        this._mapping = mappings[mappingIdx];

        if (this._blockFlag) {
            this._blockSize = block1Size;
            this._windows = [
                VorbisMode.calcWindow(block0Size, block1Size, block0Size),
                VorbisMode.calcWindow(block1Size, block1Size, block0Size),
                VorbisMode.calcWindow(block0Size, block1Size, block1Size),
                VorbisMode.calcWindow(block1Size, block1Size, block1Size)
            ];
            this._overlapInfo = [
                VorbisMode.calcOverlap(block0Size, block1Size, block0Size),
                VorbisMode.calcOverlap(block1Size, block1Size, block0Size),
                VorbisMode.calcOverlap(block0Size, block1Size, block1Size),
                VorbisMode.calcOverlap(block1Size, block1Size, block1Size)
            ];
        } else {
            this._blockSize = block0Size;
            this._windows = [VorbisMode.calcWindow(block0Size, block0Size, block0Size)];
        }
    }

    public decode(reader: IntBitReader, buffer: Float32Array[]): VorbisModeOverlapInfo {
        const info = this.getPacketInfo(reader);

        this._mapping.decodePacket(reader, this._blockSize, buffer);

        const window = this._windows[info.windowIndex];
        for (let i = 0; i < this._blockSize; i++) {
            for (let ch = 0; ch < this._channels; ch++) {
                buffer[ch][i] *= window[i];
            }
        }

        return info.overlapInfo;
    }

    private getPacketInfo(reader: IntBitReader): VorbisModePacketInfo {
        const info = new VorbisModePacketInfo();
        if (this._blockFlag) {
            const prevFlag = reader.readBit();
            const nextFlag = reader.readBit();

            info.windowIndex = (prevFlag ? 1 : 0) + (nextFlag ? 2 : 0);

            const overlapInfo = this._overlapInfo![info.windowIndex];
            info.overlapInfo.packetStartIndex = overlapInfo.packetStartIndex;
            info.overlapInfo.packetValidLength = overlapInfo.packetValidLength;
            info.overlapInfo.packetTotalLength = overlapInfo.packetTotalLength;
        } else {
            info.windowIndex = 0;
            info.overlapInfo.packetStartIndex = 0;
            info.overlapInfo.packetValidLength = this._blockSize / 2;
            info.overlapInfo.packetTotalLength = this._blockSize;
        }

        return info;
    }

    private static calcWindow(prevBlockSize: number, blockSize: number, nextBlockSize: number): Float32Array {
        const array = new Float32Array(blockSize);

        const left = prevBlockSize / 2;
        const wnd = blockSize;
        const right = nextBlockSize / 2;

        const leftbegin = wnd / 4 - left / 2;
        const rightbegin = wnd - wnd / 4 - right / 2;

        for (let i = 0; i < left; i++) {
            let x = Math.sin(((i + 0.5) / left) * VorbisMode.M_PI2);
            x *= x;
            array[leftbegin + i] = Math.sin(x * VorbisMode.M_PI2);
        }

        for (let i = leftbegin + left; i < rightbegin; i++) {
            array[i] = 1.0;
        }

        for (let i = 0; i < right; i++) {
            let x = Math.sin(((right - i - 0.5) / right) * VorbisMode.M_PI2);
            x *= x;
            array[rightbegin + i] = Math.sin(x * VorbisMode.M_PI2);
        }

        return array;
    }

    private static calcOverlap(prevBlockSize: number, blockSize: number, nextBlockSize: number): VorbisModeOverlapInfo {
        const leftOverlapHalfSize = prevBlockSize / 4;
        const rightOverlapHalfSize = nextBlockSize / 4;

        const packetStartIndex = blockSize / 4 - leftOverlapHalfSize;
        const packetTotalLength = (blockSize / 4) * 3 + rightOverlapHalfSize;
        const packetValidLength = packetTotalLength - rightOverlapHalfSize * 2;

        const info = new VorbisModeOverlapInfo();
        info.packetStartIndex = packetStartIndex;
        info.packetValidLength = packetValidLength;
        info.packetTotalLength = packetTotalLength;
        return info;
    }
}

class MdctImpl {
    // biome-ignore lint/correctness/noPrecisionLoss: High precision PI
    // biome-ignore lint/suspicious/noApproximativeNumericConstant: High precision PI
    private static readonly M_PI = 3.14159265358979323846264;

    private readonly _n: number;
    private readonly _n2: number;
    private readonly _n4: number;
    private readonly _n8: number;
    private readonly _ld: number;

    private readonly _a: Float32Array;
    private readonly _b: Float32Array;
    private readonly _c: Float32Array;

    private readonly _bitrev: Uint16Array;

    public constructor(n: number) {
        this._n = n;
        this._n2 = n >> 1;
        this._n4 = this._n2 >> 1;
        this._n8 = this._n4 >> 1;

        this._ld = VorbisUtils.ilog(n) - 1;

        // first, calc the "twiddle factors"
        this._a = new Float32Array(this._n2);
        this._b = new Float32Array(this._n2);
        this._c = new Float32Array(this._n4);

        let k: number = 0;
        let k2: number = 0;
        for (; k < this._n4; ++k, k2 += 2) {
            this._a[k2] = Math.cos((4 * k * MdctImpl.M_PI) / n);
            this._a[k2 + 1] = -Math.sin((4 * k * MdctImpl.M_PI) / n);
            this._b[k2] = Math.cos(((k2 + 1) * MdctImpl.M_PI) / n / 2) * 0.5;
            this._b[k2 + 1] = Math.sin(((k2 + 1) * MdctImpl.M_PI) / n / 2) * 0.5;
        }

        k = 0;
        k2 = 0;
        for (; k < this._n8; ++k, k2 += 2) {
            this._c[k2] = Math.cos((2 * (k2 + 1) * MdctImpl.M_PI) / n);
            this._c[k2 + 1] = -Math.sin((2 * (k2 + 1) * MdctImpl.M_PI) / n);
        }

        // now, calc the bit reverse table
        this._bitrev = new Uint16Array(this._n8);
        for (let i = 0; i < this._n8; ++i) {
            this._bitrev[i] = TypeConversions.int32ToUint16(VorbisUtils.bitReverse(i, this._ld - 3) << 2);
        }
    }

    public calcReverse(buffer: Float32Array) {
        let u: Float32Array;
        let v: Float32Array;

        const buf2 = new Float32Array(this._n2);

        // copy and reflect spectral data
        // step 0

        {
            let d = this._n2 - 2; // buf2
            let AA = 0; // A
            let e = 0; // buffer
            const e_stop = this._n2; // buffer
            while (e !== e_stop) {
                buf2[d + 1] = buffer[e] * this._a[AA] - buffer[e + 2] * this._a[AA + 1];
                buf2[d] = buffer[e] * this._a[AA + 1] + buffer[e + 2] * this._a[AA];
                d -= 2;
                AA += 2;
                e += 4;
            }

            e = this._n2 - 3;
            while (d >= 0) {
                buf2[d + 1] = -buffer[e + 2] * this._a[AA] - -buffer[e] * this._a[AA + 1];
                buf2[d] = -buffer[e + 2] * this._a[AA + 1] + -buffer[e] * this._a[AA];
                d -= 2;
                AA += 2;
                e -= 4;
            }
        }

        // apply "symbolic" names
        u = buffer;
        v = buf2;

        // step 2

        {
            let AA = this._n2 - 8; // A

            let e0 = this._n4; // v
            let e1 = 0; // v

            let d0 = this._n4; // u
            let d1 = 0; // u

            while (AA >= 0) {
                let v40_20: number;

                let v41_21: number;

                v41_21 = v[e0 + 1] - v[e1 + 1];
                v40_20 = v[e0] - v[e1];
                u[d0 + 1] = v[e0 + 1] + v[e1 + 1];
                u[d0] = v[e0] + v[e1];
                u[d1 + 1] = v41_21 * this._a[AA + 4] - v40_20 * this._a[AA + 5];
                u[d1] = v40_20 * this._a[AA + 4] + v41_21 * this._a[AA + 5];

                v41_21 = v[e0 + 3] - v[e1 + 3];
                v40_20 = v[e0 + 2] - v[e1 + 2];
                u[d0 + 3] = v[e0 + 3] + v[e1 + 3];
                u[d0 + 2] = v[e0 + 2] + v[e1 + 2];
                u[d1 + 3] = v41_21 * this._a[AA] - v40_20 * this._a[AA + 1];
                u[d1 + 2] = v40_20 * this._a[AA] + v41_21 * this._a[AA + 1];

                AA -= 8;

                d0 += 4;
                d1 += 4;
                e0 += 4;
                e1 += 4;
            }
        }

        // step 3

        // iteration 0
        this.step3_iter0_loop(this._n >> 4, u, this._n2 - 1 - this._n4 * 0, -this._n8);
        this.step3_iter0_loop(this._n >> 4, u, this._n2 - 1 - this._n4 * 1, -this._n8);

        // iteration 1
        this.step3_inner_r_loop(this._n >> 5, u, this._n2 - 1 - this._n8 * 0, -(this._n >> 4), 16);
        this.step3_inner_r_loop(this._n >> 5, u, this._n2 - 1 - this._n8 * 1, -(this._n >> 4), 16);
        this.step3_inner_r_loop(this._n >> 5, u, this._n2 - 1 - this._n8 * 2, -(this._n >> 4), 16);
        this.step3_inner_r_loop(this._n >> 5, u, this._n2 - 1 - this._n8 * 3, -(this._n >> 4), 16);

        // iterations 2 ... x
        let l = 2;
        for (; l < (this._ld - 3) >> 1; ++l) {
            const k0 = this._n >> (l + 2);
            const k0_2 = k0 >> 1;
            const lim = 1 << (l + 1);
            for (let i = 0; i < lim; ++i) {
                this.step3_inner_r_loop(this._n >> (l + 4), u, this._n2 - 1 - k0 * i, -k0_2, 1 << (l + 3));
            }
        }

        // iterations x ... end
        for (; l < this._ld - 6; ++l) {
            const k0 = this._n >> (l + 2);
            const k1 = 1 << (l + 3);
            const k0_2 = k0 >> 1;
            const rlim = this._n >> (l + 6);
            const lim = 1 << (l + 1);
            let i_off = this._n2 - 1;
            let A0 = 0;

            for (let r = rlim; r > 0; --r) {
                this.step3_inner_s_loop(lim, u, i_off, -k0_2, A0, k1, k0);
                A0 += k1 * 4;
                i_off -= 8;
            }
        }

        // combine some iteration steps...
        this.step3_inner_s_loop_ld654(this._n >> 5, u, this._n2 - 1, this._n);

        // steps 4, 5, and 6
        {
            let bit = 0;

            let d0 = this._n4 - 4; // v
            let d1 = this._n2 - 4; // v
            while (d0 >= 0) {
                let k4: number;

                k4 = this._bitrev[bit];
                v[d1 + 3] = u[k4];
                v[d1 + 2] = u[k4 + 1];
                v[d0 + 3] = u[k4 + 2];
                v[d0 + 2] = u[k4 + 3];

                k4 = this._bitrev[bit + 1];
                v[d1 + 1] = u[k4];
                v[d1] = u[k4 + 1];
                v[d0 + 1] = u[k4 + 2];
                v[d0] = u[k4 + 3];

                d0 -= 4;
                d1 -= 4;
                bit += 2;
            }
        }

        // step 7
        {
            let c = 0; // C
            let d = 0; // v
            let e = this._n2 - 4; // v

            while (d < e) {
                let a02: number;
                let a11: number;
                let b0: number;
                let b1: number;
                let b2: number;
                let b3: number;

                a02 = v[d] - v[e + 2];
                a11 = v[d + 1] + v[e + 3];

                b0 = this._c[c + 1] * a02 + this._c[c] * a11;
                b1 = this._c[c + 1] * a11 - this._c[c] * a02;

                b2 = v[d] + v[e + 2];
                b3 = v[d + 1] - v[e + 3];

                v[d] = b2 + b0;
                v[d + 1] = b3 + b1;
                v[e + 2] = b2 - b0;
                v[e + 3] = b1 - b3;

                a02 = v[d + 2] - v[e];
                a11 = v[d + 3] + v[e + 1];

                b0 = this._c[c + 3] * a02 + this._c[c + 2] * a11;
                b1 = this._c[c + 3] * a11 - this._c[c + 2] * a02;

                b2 = v[d + 2] + v[e];
                b3 = v[d + 3] - v[e + 1];

                v[d + 2] = b2 + b0;
                v[d + 3] = b3 + b1;
                v[e] = b2 - b0;
                v[e + 1] = b1 - b3;

                c += 4;
                d += 4;
                e -= 4;
            }
        }

        // step 8 + decode
        {
            let b = this._n2 - 8; // B
            let e = this._n2 - 8; // buf2
            let d0 = 0; // buffer
            let d1 = this._n2 - 4; // buffer
            let d2 = this._n2; // buffer
            let d3 = this._n - 4; // buffer
            while (e >= 0) {
                let p0: number;
                let p1: number;
                let p2: number;
                let p3: number;

                p3 = buf2[e + 6] * this._b[b + 7] - buf2[e + 7] * this._b[b + 6];
                p2 = -buf2[e + 6] * this._b[b + 6] - buf2[e + 7] * this._b[b + 7];

                buffer[d0] = p3;
                buffer[d1 + 3] = -p3;
                buffer[d2] = p2;
                buffer[d3 + 3] = p2;

                p1 = buf2[e + 4] * this._b[b + 5] - buf2[e + 5] * this._b[b + 4];
                p0 = -buf2[e + 4] * this._b[b + 4] - buf2[e + 5] * this._b[b + 5];

                buffer[d0 + 1] = p1;
                buffer[d1 + 2] = -p1;
                buffer[d2 + 1] = p0;
                buffer[d3 + 2] = p0;

                p3 = buf2[e + 2] * this._b[b + 3] - buf2[e + 3] * this._b[b + 2];
                p2 = -buf2[e + 2] * this._b[b + 2] - buf2[e + 3] * this._b[b + 3];

                buffer[d0 + 2] = p3;
                buffer[d1 + 1] = -p3;
                buffer[d2 + 2] = p2;
                buffer[d3 + 1] = p2;

                p1 = buf2[e] * this._b[b + 1] - buf2[e + 1] * this._b[b];
                p0 = -buf2[e] * this._b[b] - buf2[e + 1] * this._b[b + 1];

                buffer[d0 + 3] = p1;
                buffer[d1] = -p1;
                buffer[d2 + 3] = p0;
                buffer[d3] = p0;

                b -= 8;
                e -= 8;
                d0 += 4;
                d2 += 4;
                d1 -= 4;
                d3 -= 4;
            }
        }
    }

    private step3_inner_r_loop(lim: number, e: Float32Array, d0: number, k_off: number, k1: number) {
        let k00_20: number;
        let k01_21: number;

        let e0 = d0; // e
        let e2 = e0 + k_off; // e
        let a = 0;

        for (let i = lim >> 2; i > 0; --i) {
            k00_20 = e[e0] - e[e2];
            k01_21 = e[e0 - 1] - e[e2 - 1];
            e[e0] += e[e2];
            e[e0 - 1] += e[e2 - 1];
            e[e2] = k00_20 * this._a[a] - k01_21 * this._a[a + 1];
            e[e2 - 1] = k01_21 * this._a[a] + k00_20 * this._a[a + 1];

            a += k1;

            k00_20 = e[e0 - 2] - e[e2 - 2];
            k01_21 = e[e0 - 3] - e[e2 - 3];
            e[e0 - 2] += e[e2 - 2];
            e[e0 - 3] += e[e2 - 3];
            e[e2 - 2] = k00_20 * this._a[a] - k01_21 * this._a[a + 1];
            e[e2 - 3] = k01_21 * this._a[a] + k00_20 * this._a[a + 1];

            a += k1;

            k00_20 = e[e0 - 4] - e[e2 - 4];
            k01_21 = e[e0 - 5] - e[e2 - 5];
            e[e0 - 4] += e[e2 - 4];
            e[e0 - 5] += e[e2 - 5];
            e[e2 - 4] = k00_20 * this._a[a] - k01_21 * this._a[a + 1];
            e[e2 - 5] = k01_21 * this._a[a] + k00_20 * this._a[a + 1];

            a += k1;

            k00_20 = e[e0 - 6] - e[e2 - 6];
            k01_21 = e[e0 - 7] - e[e2 - 7];
            e[e0 - 6] += e[e2 - 6];
            e[e0 - 7] += e[e2 - 7];
            e[e2 - 6] = k00_20 * this._a[a] - k01_21 * this._a[a + 1];
            e[e2 - 7] = k01_21 * this._a[a] + k00_20 * this._a[a + 1];

            a += k1;

            e0 -= 8;
            e2 -= 8;
        }
    }

    private step3_iter0_loop(n: number, e: Float32Array, i_off: number, k_off: number) {
        let ee0 = i_off; // e
        let ee2 = ee0 + k_off; // e
        let a = 0;
        for (let i = n >> 2; i > 0; --i) {
            let k00_20: number;
            let k01_21: number;

            k00_20 = e[ee0] - e[ee2];
            k01_21 = e[ee0 - 1] - e[ee2 - 1];
            e[ee0] += e[ee2];
            e[ee0 - 1] += e[ee2 - 1];
            e[ee2] = k00_20 * this._a[a] - k01_21 * this._a[a + 1];
            e[ee2 - 1] = k01_21 * this._a[a] + k00_20 * this._a[a + 1];
            a += 8;

            k00_20 = e[ee0 - 2] - e[ee2 - 2];
            k01_21 = e[ee0 - 3] - e[ee2 - 3];
            e[ee0 - 2] += e[ee2 - 2];
            e[ee0 - 3] += e[ee2 - 3];
            e[ee2 - 2] = k00_20 * this._a[a] - k01_21 * this._a[a + 1];
            e[ee2 - 3] = k01_21 * this._a[a] + k00_20 * this._a[a + 1];
            a += 8;

            k00_20 = e[ee0 - 4] - e[ee2 - 4];
            k01_21 = e[ee0 - 5] - e[ee2 - 5];
            e[ee0 - 4] += e[ee2 - 4];
            e[ee0 - 5] += e[ee2 - 5];
            e[ee2 - 4] = k00_20 * this._a[a] - k01_21 * this._a[a + 1];
            e[ee2 - 5] = k01_21 * this._a[a] + k00_20 * this._a[a + 1];
            a += 8;

            k00_20 = e[ee0 - 6] - e[ee2 - 6];
            k01_21 = e[ee0 - 7] - e[ee2 - 7];
            e[ee0 - 6] += e[ee2 - 6];
            e[ee0 - 7] += e[ee2 - 7];
            e[ee2 - 6] = k00_20 * this._a[a] - k01_21 * this._a[a + 1];
            e[ee2 - 7] = k01_21 * this._a[a] + k00_20 * this._a[a + 1];
            a += 8;

            ee0 -= 8;
            ee2 -= 8;
        }
    }

    private step3_inner_s_loop(
        n: number,
        e: Float32Array,
        i_off: number,
        k_off: number,
        a: number,
        a_off: number,
        k0: number
    ) {
        const A0 = this._a[a];
        const A1 = this._a[a + 1];
        const A2 = this._a[a + a_off];
        const A3 = this._a[a + a_off + 1];
        const A4 = this._a[a + a_off * 2];
        const A5 = this._a[a + a_off * 2 + 1];
        const A6 = this._a[a + a_off * 3];
        const A7 = this._a[a + a_off * 3 + 1];

        let k00: number;
        let k11: number;

        let ee0 = i_off; // e
        let ee2 = ee0 + k_off; // e

        for (let i = n; i > 0; --i) {
            k00 = e[ee0] - e[ee2];
            k11 = e[ee0 - 1] - e[ee2 - 1];
            e[ee0] += e[ee2];
            e[ee0 - 1] += e[ee2 - 1];
            e[ee2] = k00 * A0 - k11 * A1;
            e[ee2 - 1] = k11 * A0 + k00 * A1;

            k00 = e[ee0 - 2] - e[ee2 - 2];
            k11 = e[ee0 - 3] - e[ee2 - 3];
            e[ee0 - 2] += e[ee2 - 2];
            e[ee0 - 3] += e[ee2 - 3];
            e[ee2 - 2] = k00 * A2 - k11 * A3;
            e[ee2 - 3] = k11 * A2 + k00 * A3;

            k00 = e[ee0 - 4] - e[ee2 - 4];
            k11 = e[ee0 - 5] - e[ee2 - 5];
            e[ee0 - 4] += e[ee2 - 4];
            e[ee0 - 5] += e[ee2 - 5];
            e[ee2 - 4] = k00 * A4 - k11 * A5;
            e[ee2 - 5] = k11 * A4 + k00 * A5;

            k00 = e[ee0 - 6] - e[ee2 - 6];
            k11 = e[ee0 - 7] - e[ee2 - 7];
            e[ee0 - 6] += e[ee2 - 6];
            e[ee0 - 7] += e[ee2 - 7];
            e[ee2 - 6] = k00 * A6 - k11 * A7;
            e[ee2 - 7] = k11 * A6 + k00 * A7;

            ee0 -= k0;
            ee2 -= k0;
        }
    }

    private step3_inner_s_loop_ld654(n: number, e: Float32Array, i_off: number, base_n: number) {
        const a_off = base_n >> 3;
        const A2 = this._a[a_off];
        let z = i_off; // e
        const b = z - 16 * n; // e

        while (z > b) {
            let k00: number;
            let k11: number;

            k00 = e[z] - e[z - 8];
            k11 = e[z - 1] - e[z - 9];
            e[z] += e[z - 8];
            e[z - 1] += e[z - 9];
            e[z - 8] = k00;
            e[z - 9] = k11;

            k00 = e[z - 2] - e[z - 10];
            k11 = e[z - 3] - e[z - 11];
            e[z - 2] += e[z - 10];
            e[z - 3] += e[z - 11];
            e[z - 10] = (k00 + k11) * A2;
            e[z - 11] = (k11 - k00) * A2;

            k00 = e[z - 12] - e[z - 4];
            k11 = e[z - 5] - e[z - 13];
            e[z - 4] += e[z - 12];
            e[z - 5] += e[z - 13];
            e[z - 12] = k11;
            e[z - 13] = k00;

            k00 = e[z - 14] - e[z - 6];
            k11 = e[z - 7] - e[z - 15];
            e[z - 6] += e[z - 14];
            e[z - 7] += e[z - 15];
            e[z - 14] = (k00 + k11) * A2;
            e[z - 15] = (k00 - k11) * A2;

            this.iter_54(e, z);
            this.iter_54(e, z - 8);

            z -= 16;
        }
    }

    private iter_54(e: Float32Array, z: number) {
        const k00 = e[z] - e[z - 4];
        const y0 = e[z] + e[z - 4];
        const y2 = e[z - 2] + e[z - 6];
        const k22 = e[z - 2] - e[z - 6];

        e[z] = y0 + y2;
        e[z - 2] = y0 - y2;

        const k33 = e[z - 3] - e[z - 7];

        e[z - 4] = k00 + k33;
        e[z - 6] = k00 - k33;

        const k11 = e[z - 1] - e[z - 5];
        const y1 = e[z - 1] + e[z - 5];
        const y3 = e[z - 3] + e[z - 7];

        e[z - 1] = y1 + y3;
        e[z - 3] = y1 - y3;
        e[z - 5] = k11 - k22;
        e[z - 7] = k11 + k22;
    }
}

export class Mdct {
    private _setupCache: Map<number, MdctImpl> = new Map<number, MdctImpl>();

    public reverse(samples: Float32Array, sampleCount: number) {
        let impl: MdctImpl;
        if (this._setupCache.has(sampleCount)) {
            impl = this._setupCache.get(sampleCount)!;
        } else {
            impl = new MdctImpl(sampleCount);
            this._setupCache.set(sampleCount, impl);
        }

        impl.calcReverse(samples);
    }
}

export class VorbisStreamDecoder {
    private _stream: VorbisStream;
    private _setup: VorbisSetupHeader;
    private _packets: OggPacket[];
    private _packetIndex: number = 0;

    private _nextPacketBuf: Float32Array[] | null;
    private _prevPacketBuf: Float32Array[] | null;
    private _prevPacketStart: number;
    private _prevPacketEnd: number;
    private _prevPacketStop: number;

    private _currentPosition: number;
    private _hasPosition: boolean;
    private _eosFound: boolean;
    private _modeFieldBits: number;

    public constructor(stream: VorbisStream, setup: VorbisSetupHeader, packets: OggPacket[]) {
        this._stream = stream;
        this._setup = setup;
        this._packets = packets;

        this._currentPosition = 0;

        this._prevPacketBuf = null;
        this._prevPacketStart = 0;
        this._prevPacketEnd = 0;
        this._prevPacketStop = 0;
        this._nextPacketBuf = null;
        this._eosFound = false;
        this._hasPosition = false;

        // save off the number of bits to read to determine packet mode
        this._modeFieldBits = VorbisUtils.ilog(setup.modes.length - 1);
    }

    public decode() {
        let allSamples = new Float32Array(
            this._packets[this._packets.length - 1].granulePosition! * this._stream.audioChannels
        );

        // 200ms
        const buffer = new Float32Array(0.2 * this._stream.audioSampleRate * this._stream.audioChannels);

        let cnt: number = 0;
        let pos = 0;
        while (true) {
            cnt = this.read(buffer, 0, buffer.length);
            if (cnt === 0) {
                break;
            }
            // not enough space in buffer -> grow by 1 buffer size
            if (pos + cnt >= allSamples.length) {
                const newAllSamples = new Float32Array(allSamples.length + buffer.length);
                newAllSamples.set(allSamples, 0);
                allSamples = newAllSamples;
            }

            allSamples.set(buffer.subarray(0, cnt), pos);
            pos += cnt;
        }

        // truncate excess
        return allSamples.subarray(0, pos);
    }

    public read(buffer: Float32Array, offset: number, count: number): number {
        // if the caller didn't ask for any data, bail early
        if (count === 0) {
            return 0;
        }

        // save off value to track when we're done with the request
        let idx = offset;
        const tgt = offset + count;

        // try to fill the buffer; drain the last buffer if EOS, resync, bad packet, or parameter change
        while (idx < tgt) {
            // if we don't have any more valid data in the current packet, read in the next packet
            if (this._prevPacketStart === this._prevPacketEnd) {
                if (this._eosFound) {
                    this._nextPacketBuf = null;
                    this._prevPacketBuf = null;
                    // no more samples, so just return
                    break;
                }

                const readResult = this.readNextPacket((idx - offset) / this._stream.audioChannels);

                if (readResult === null) {
                    // drain the current packet (the windowing will fade it out)
                    this._prevPacketEnd = this._prevPacketStop;
                }

                // if we need to pick up a position, and the packet had one, apply the position now
                if (readResult !== null && readResult.samplePosition !== null && !this._hasPosition) {
                    this._hasPosition = true;
                    this._currentPosition =
                        readResult!.samplePosition! -
                        (this._prevPacketEnd - this._prevPacketStart) -
                        (idx - offset) / this._stream.audioChannels;
                }
            }

            // we read out the valid samples from the previous packet
            const copyLen = Math.min(
                (tgt - idx) / this._stream.audioChannels,
                this._prevPacketEnd - this._prevPacketStart
            );
            if (copyLen > 0) {
                idx += this.copyBuffer(buffer, idx, copyLen);
            }
        }

        // update the count of floats written
        count = idx - offset;

        // update the position
        this._currentPosition += count / this._stream.audioChannels;

        // return count of floats written
        return count;
    }

    private copyBuffer(target: Float32Array, targetIndex: number, count: number) {
        let idx = targetIndex;
        for (; count > 0; this._prevPacketStart++, count--) {
            for (let ch = 0; ch < this._stream.audioChannels; ch++) {
                target[idx++] = this._prevPacketBuf![ch][this._prevPacketStart];
            }
        }
        return idx - targetIndex;
    }

    private readNextPacket(bufferedSamples: number): VorbisReadNextPacketResult | null {
        // decode the next packet now so we can start overlapping with it
        const res = this.decodeNextPacket();
        this._eosFound = this._eosFound || res.isEndOfStream;
        if (res.curPacket == null) {
            return null;
        }

        // if we get a max sample position, back off our valid length to match
        if (res.samplePosition !== null && res.isEndOfStream) {
            const actualEnd = this._currentPosition + bufferedSamples + res.validLen - res.startIndex;
            const diff = res.samplePosition! - actualEnd;
            if (diff < 0) {
                res.validLen += diff;
                if (res.validLen < 0) {
                    //  TODO: something is wrong that this happens, this._currentPosition is way too high
                    res.validLen = 0;
                }
            }
        }

        // start overlapping (if we don't have an previous packet data, just loop and the previous packet logic will handle things appropriately)
        if (this._prevPacketEnd > 0) {
            // overlap the first samples in the packet with the previous packet, then loop
            VorbisStreamDecoder.overlapBuffers(
                this._prevPacketBuf!,
                res.curPacket,
                this._prevPacketStart,
                this._prevPacketStop,
                res.startIndex,
                this._stream.audioChannels
            );
            this._prevPacketStart = res.startIndex;
        } else if (this._prevPacketBuf == null) {
            // first packet, so it doesn't have any good data before the valid length
            this._prevPacketStart = res.validLen;
        }

        // keep the old buffer so the GC doesn't have to reallocate every packet
        this._nextPacketBuf = this._prevPacketBuf;

        // save off our current packet's data for the next pass
        this._prevPacketEnd = res.validLen;
        this._prevPacketStop = res.totalLen;
        this._prevPacketBuf = res.curPacket!;

        return new VorbisReadNextPacketResult(res.samplePosition);
    }

    private static overlapBuffers(
        previous: Float32Array[],
        next: Float32Array[],
        prevStart: number,
        prevLen: number,
        nextStart: number,
        channels: number
    ) {
        for (; prevStart < prevLen; prevStart++, nextStart++) {
            for (let c = 0; c < channels; c++) {
                next[c][nextStart] += previous[c][prevStart];
            }
        }
    }

    private decodeNextPacket(): DecodeNextPacketInfo {
        const res = new DecodeNextPacketInfo();
        let packet: OggPacket | null = null;
        if (this._packetIndex >= this._packets.length) {
            // no packet? we're at the end of the stream
            res.isEndOfStream = true;
        } else {
            packet = this._packets[this._packetIndex++];
            const reader = new IntBitReader(ByteBuffer.fromBuffer(packet.packetData));
            // if the packet is flagged as the end of the stream, we can safely mark _eosFound
            res.isEndOfStream = packet.isEndOfStream;

            // make sure the packet starts with a 0 bit as per the spec
            if (!reader.readBit()) {
                // if we get here, we should have a good packet; decode it and add it to the buffer
                const mode = this._setup.modes[reader.readBits(this._modeFieldBits)];
                if (this._nextPacketBuf == null) {
                    this._nextPacketBuf = new Array<Float32Array>(this._stream.audioChannels);
                    for (let i = 0; i < this._stream.audioChannels; i++) {
                        this._nextPacketBuf[i] = new Float32Array(this._stream.blocksize1);
                    }
                }

                const decodeRes = mode.decode(reader, this._nextPacketBuf);
                res.startIndex = decodeRes.packetStartIndex;
                res.validLen = decodeRes.packetValidLength;
                res.totalLen = decodeRes.packetTotalLength;

                // per the spec, do not decode more samples than the last granulePosition
                res.samplePosition = packet.granulePosition;
                res.curPacket = this._nextPacketBuf;
                return res;
            }
        }

        return res;
    }
}

class DecodeNextPacketInfo {
    public curPacket: Float32Array[] | null = null;
    public startIndex: number = 0;
    public validLen: number = 0;
    public totalLen: number = 0;
    public isEndOfStream: boolean = false;
    public samplePosition: number | null = null;
}
