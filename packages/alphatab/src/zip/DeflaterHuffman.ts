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

import { DeflaterConstants } from '@src/zip/DeflaterConstants';
import type { PendingBuffer } from '@src/zip/PendingBuffer';

/**
 * @internal
 */
class Tree {
    // repeat previous bit length 3-6 times (2 bits of repeat count)
    private static readonly _repeat3To6 = 16;

    // repeat a zero length 3-10 times  (3 bits of repeat count)
    private static readonly _repeat3To10 = 17;

    // repeat a zero length 11-138 times  (7 bits of repeat count)
    private static readonly _repeat11To138 = 18;

    public freqs: Int16Array;

    public length: Uint8Array | null = null;

    public minNumCodes: number;

    public numCodes: number = 0;

    private _codes: Int16Array | null = null;
    private readonly _bitLengthCounts: Int32Array;
    private readonly _maxLength: number;
    private _huffman: DeflaterHuffman;

    public constructor(dh: DeflaterHuffman, elems: number, minCodes: number, maxLength: number) {
        this._huffman = dh;
        this.minNumCodes = minCodes;
        this._maxLength = maxLength;
        this.freqs = new Int16Array(elems);
        this._bitLengthCounts = new Int32Array(maxLength);
    }

    /**
     * Resets the internal state of the tree
     */
    public reset() {
        for (let i = 0; i < this.freqs.length; i++) {
            this.freqs[i] = 0;
        }
        this._codes = null;
        this.length = null;
    }

    public buildTree() {
        const numSymbols = this.freqs.length;

        /* heap is a priority queue, sorted by frequency, least frequent
         * nodes first.  The heap is a binary tree, with the property, that
         * the parent node is smaller than both child nodes.  This assures
         * that the smallest node is the first parent.
         *
         * The binary tree is encoded in an array:  0 is root node and
         * the nodes 2*n+1, 2*n+2 are the child nodes of node n.
         */
        const heap = new Int32Array(numSymbols);
        let heapLen = 0;
        let maxCode = 0;
        for (let n = 0; n < numSymbols; n++) {
            const freq = this.freqs[n];
            if (freq !== 0) {
                // Insert n into heap
                let pos = heapLen++;
                while (true) {
                    if (pos > 0) {
                        const ppos = Math.floor((pos - 1) / 2);
                        if (this.freqs[heap[ppos]] > freq) {
                            heap[pos] = heap[ppos];
                            pos = ppos;
                        } else {
                            break;
                        }
                    } else {
                        break;
                    }
                }
                heap[pos] = n;

                maxCode = n;
            }
        }

        /* We could encode a single literal with 0 bits but then we
         * don't see the literals.  Therefore we force at least two
         * literals to avoid this case.  We don't care about order in
         * this case, both literals get a 1 bit code.
         */
        while (heapLen < 2) {
            const node = maxCode < 2 ? ++maxCode : 0;
            heap[heapLen++] = node;
        }

        this.numCodes = Math.max(maxCode + 1, this.minNumCodes);

        const numLeafs = heapLen;
        const childs = new Int32Array(4 * heapLen - 2);
        const values = new Int32Array(2 * heapLen - 1);
        let numNodes = numLeafs;
        for (let i = 0; i < heapLen; i++) {
            const node = heap[i];
            childs[2 * i] = node;
            childs[2 * i + 1] = -1;
            values[i] = this.freqs[node] << 8;
            heap[i] = i;
        }

        /* Construct the Huffman tree by repeatedly combining the least two
         * frequent nodes.
         */
        do {
            const first = heap[0];
            let last = heap[--heapLen];

            // Propagate the hole to the leafs of the heap
            let ppos = 0;
            let path = 1;

            while (path < heapLen) {
                if (path + 1 < heapLen && values[heap[path]] > values[heap[path + 1]]) {
                    path++;
                }

                heap[ppos] = heap[path];
                ppos = path;
                path = path * 2 + 1;
            }

            /* Now propagate the last element down along path.  Normally
             * it shouldn't go too deep.
             */
            let lastVal = values[last];
            while (true) {
                path = ppos;
                if (ppos > 0) {
                    ppos = Math.floor((path - 1) / 2);
                    if (values[heap[ppos]] > lastVal) {
                        heap[path] = heap[ppos];
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            }

            heap[path] = last;

            const second = heap[0];

            // Create a new node father of first and second
            last = numNodes++;
            childs[2 * last] = first;
            childs[2 * last + 1] = second;
            const mindepth = Math.min(values[first] & 0xff, values[second] & 0xff);
            lastVal = values[first] + values[second] - mindepth + 1;
            values[last] = lastVal;

            // Again, propagate the hole to the leafs
            ppos = 0;
            path = 1;

            while (path < heapLen) {
                if (path + 1 < heapLen && values[heap[path]] > values[heap[path + 1]]) {
                    path++;
                }

                heap[ppos] = heap[path];
                ppos = path;
                path = ppos * 2 + 1;
            }

            // Now propagate the new element down along path
            while (true) {
                path = ppos;
                if (path > 0) {
                    ppos = Math.floor((path - 1) / 2);
                    if (values[heap[ppos]] > lastVal) {
                        heap[path] = heap[ppos];
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            }
            heap[path] = last;
        } while (heapLen > 1);

        this._buildLength(childs);
    }

    private _buildLength(childs: Int32Array) {
        this.length = new Uint8Array(this.freqs.length);
        const numNodes = Math.floor(childs.length / 2);
        const numLeafs = Math.floor((numNodes + 1) / 2);
        let overflow = 0;

        for (let i = 0; i < this._maxLength; i++) {
            this._bitLengthCounts[i] = 0;
        }

        // First calculate optimal bit lengths
        const lengths = new Int32Array(numNodes);
        lengths[numNodes - 1] = 0;

        for (let i = numNodes - 1; i >= 0; i--) {
            if (childs[2 * i + 1] !== -1) {
                let bitLength = lengths[i] + 1;
                if (bitLength > this._maxLength) {
                    bitLength = this._maxLength;
                    overflow++;
                }
                lengths[childs[2 * i]] = bitLength;
                lengths[childs[2 * i + 1]] = bitLength;
            } else {
                // A leaf node
                const bitLength = lengths[i];
                this._bitLengthCounts[bitLength - 1]++;
                this.length[childs[2 * i]] = lengths[i];
            }
        }

        if (overflow === 0) {
            return;
        }

        let incrBitLen = this._maxLength - 1;
        do {
            // Find the first bit length which could increase:
            while (this._bitLengthCounts[--incrBitLen] === 0) {}

            // Move this node one down and remove a corresponding
            // number of overflow nodes.
            do {
                this._bitLengthCounts[incrBitLen]--;
                this._bitLengthCounts[++incrBitLen]++;
                overflow -= 1 << (this._maxLength - 1 - incrBitLen);
            } while (overflow > 0 && incrBitLen < this._maxLength - 1);
        } while (overflow > 0);

        /* We may have overshot above.  Move some nodes from maxLength to
         * maxLength-1 in that case.
         */
        this._bitLengthCounts[this._maxLength - 1] += overflow;
        this._bitLengthCounts[this._maxLength - 2] -= overflow;

        /* Now recompute all bit lengths, scanning in increasing
         * frequency.  It is simpler to reconstruct all lengths instead of
         * fixing only the wrong ones. This idea is taken from 'ar'
         * written by Haruhiko Okumura.
         *
         * The nodes were inserted with decreasing frequency into the childs
         * array.
         */
        let nodePtr = 2 * numLeafs;
        for (let bits = this._maxLength; bits !== 0; bits--) {
            let n = this._bitLengthCounts[bits - 1];
            while (n > 0) {
                const childPtr = 2 * childs[nodePtr++];
                if (childs[childPtr + 1] === -1) {
                    // We found another leaf
                    this.length[childs[childPtr]] = bits;
                    n--;
                }
            }
        }
    }

    /**
     * Get encoded length
     * @returns Encoded length, the sum of frequencies * lengths
     */
    public getEncodedLength(): number {
        let len = 0;
        for (let i = 0; i < this.freqs.length; i++) {
            len += this.freqs[i] * this.length![i];
        }
        return len;
    }

    /**
     * Scan a literal or distance tree to determine the frequencies of the codes
     * in the bit length tree.
     * @param blTree
     */
    public calcBLFreq(blTree: Tree) {
        let maxCount: number; /* max repeat count */
        let minCount: number; /* min repeat count */
        let count: number; /* repeat count of the current code */
        let curlen = -1; /* length of current code */

        let i = 0;
        while (i < this.numCodes) {
            count = 1;
            const nextlen = this.length![i];
            if (nextlen === 0) {
                maxCount = 138;
                minCount = 3;
            } else {
                maxCount = 6;
                minCount = 3;
                if (curlen !== nextlen) {
                    blTree.freqs[nextlen]++;
                    count = 0;
                }
            }
            curlen = nextlen;
            i++;

            while (i < this.numCodes && curlen === this.length![i]) {
                i++;
                if (++count >= maxCount) {
                    break;
                }
            }

            if (count < minCount) {
                blTree.freqs[curlen] += count;
            } else if (curlen !== 0) {
                blTree.freqs[Tree._repeat3To6]++;
            } else if (count <= 10) {
                blTree.freqs[Tree._repeat3To10]++;
            } else {
                blTree.freqs[Tree._repeat11To138]++;
            }
        }
    }

    /**
     * Set static codes and length
     * @param staticCodes new codes
     * @param staticLengths length for new codes
     */
    public setStaticCodes(staticCodes: Int16Array, staticLengths: Uint8Array) {
        this._codes = staticCodes;
        this.length = staticLengths;
    }

    /**
     * Build dynamic codes and lengths
     */
    public buildCodes() {
        const nextCode = new Int32Array(this._maxLength);
        let code = 0;

        this._codes = new Int16Array(this.freqs.length);

        for (let bits = 0; bits < this._maxLength; bits++) {
            nextCode[bits] = code;
            code += this._bitLengthCounts[bits] << (15 - bits);
        }

        for (let i = 0; i < this.numCodes; i++) {
            const bits = this.length![i];
            if (bits > 0) {
                this._codes[i] = DeflaterHuffman.bitReverse(nextCode[bits - 1]);
                nextCode[bits - 1] += 1 << (16 - bits);
            }
        }
    }

    /**
     * Write tree values
     * @param blTree Tree to write
     */
    public writeTree(blTree: Tree) {
        let maxCount: number; // max repeat count
        let minCount: number; // min repeat count
        let count: number; // repeat count of the current code
        let curlen = -1; // length of current code

        let i = 0;
        while (i < this.numCodes) {
            count = 1;
            const nextlen = this.length![i];
            if (nextlen === 0) {
                maxCount = 138;
                minCount = 3;
            } else {
                maxCount = 6;
                minCount = 3;
                if (curlen !== nextlen) {
                    blTree.writeSymbol(nextlen);
                    count = 0;
                }
            }
            curlen = nextlen;
            i++;

            while (i < this.numCodes && curlen === this.length![i]) {
                i++;
                if (++count >= maxCount) {
                    break;
                }
            }

            if (count < minCount) {
                while (count-- > 0) {
                    blTree.writeSymbol(curlen);
                }
            } else if (curlen !== 0) {
                blTree.writeSymbol(Tree._repeat3To6);
                this._huffman.pending.writeBits(count - 3, 2);
            } else if (count <= 10) {
                blTree.writeSymbol(Tree._repeat3To10);
                this._huffman.pending.writeBits(count - 3, 3);
            } else {
                blTree.writeSymbol(Tree._repeat11To138);
                this._huffman.pending.writeBits(count - 11, 7);
            }
        }
    }

    public writeSymbol(code: number) {
        this._huffman.pending.writeBits(this._codes![code] & 0xffff, this.length![code]);
    }
}

/**
 * @internal
 */
export class DeflaterHuffman {
    private static readonly _bufSize = 1 << (DeflaterConstants.defaultMemLevel + 6);
    private static readonly _literalNum = 286;

    /**
     * Written to Zip file to identify a stored block
     */
    public static readonly storedBlock = 0;

    /**
     * Identifies static tree in Zip file
     */
    public static readonly staticTrees = 1;

    /**
     * Identifies dynamic tree in Zip file
     */
    public static readonly dynTrees = 2;

    // Number of distance codes
    private static readonly _distNum = 30;

    private static _staticLCodes: Int16Array = new Int16Array(DeflaterHuffman._literalNum);
    private static _staticLLength: Uint8Array = new Uint8Array(DeflaterHuffman._literalNum);
    private static _staticDCodes: Int16Array = new Int16Array(DeflaterHuffman._distNum);
    private static _staticDLength: Uint8Array = new Uint8Array(DeflaterHuffman._distNum);

    public static staticInit() {
        // See RFC 1951 3.2.6
        // Literal codes

        let i = 0;
        while (i < 144) {
            DeflaterHuffman._staticLCodes[i] = DeflaterHuffman.bitReverse((0x030 + i) << 8);
            DeflaterHuffman._staticLLength[i++] = 8;
        }

        while (i < 256) {
            DeflaterHuffman._staticLCodes[i] = DeflaterHuffman.bitReverse((0x190 - 144 + i) << 7);
            DeflaterHuffman._staticLLength[i++] = 9;
        }

        while (i < 280) {
            DeflaterHuffman._staticLCodes[i] = DeflaterHuffman.bitReverse((0x000 - 256 + i) << 9);
            DeflaterHuffman._staticLLength[i++] = 7;
        }

        while (i < DeflaterHuffman._literalNum) {
            DeflaterHuffman._staticLCodes[i] = DeflaterHuffman.bitReverse((0x0c0 - 280 + i) << 8);
            DeflaterHuffman._staticLLength[i++] = 8;
        }

        // Distance codes
        for (i = 0; i < DeflaterHuffman._distNum; i++) {
            DeflaterHuffman._staticDCodes[i] = DeflaterHuffman.bitReverse(i << 11);
            DeflaterHuffman._staticDLength[i] = 5;
        }
    }

    // The lengths of the bit length codes are sent in order of decreasing
    // probability, to avoid transmitting the lengths for unused bit length codes.
    private static readonly _blOrder: number[] = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];

    private static readonly _bit4Reverse: Uint8Array = new Uint8Array([0, 8, 4, 12, 2, 10, 6, 14, 1, 9, 5, 13, 3, 11, 7, 15]);

    /**
     * Reverse the bits of a 16 bit value.
     * @param toReverse Value to reverse bits
     * @returns Value with bits reversed
     */
    public static bitReverse(toReverse: number): number {
        return (
            (DeflaterHuffman._bit4Reverse[toReverse & 0xf] << 12) |
            (DeflaterHuffman._bit4Reverse[(toReverse >> 4) & 0xf] << 8) |
            (DeflaterHuffman._bit4Reverse[(toReverse >> 8) & 0xf] << 4) |
            DeflaterHuffman._bit4Reverse[toReverse >> 12]
        );
    }

    // Number of codes used to transfer bit lengths
    private static readonly _bitLenNum = 19;

    private static readonly _eofSymbol = 256;

    /**
     * Pending buffer to use
     */
    public pending: PendingBuffer;

    private _literalTree: Tree;
    private _distTree: Tree;
    private _blTree: Tree;

    // Buffer for distances
    private _dBuf: Int16Array;

    private _lBuf: Uint8Array;
    private _lastLit: number = 0;
    private _extraBits: number = 0;

    public constructor(pending: PendingBuffer) {
        this.pending = pending;

        this._literalTree = new Tree(this, DeflaterHuffman._literalNum, 257, 15);
        this._distTree = new Tree(this, DeflaterHuffman._distNum, 1, 15);
        this._blTree = new Tree(this, DeflaterHuffman._bitLenNum, 4, 7);

        this._dBuf = new Int16Array(DeflaterHuffman._bufSize);
        this._lBuf = new Uint8Array(DeflaterHuffman._bufSize);
    }

    public isFull(): boolean {
        return this._lastLit >= DeflaterHuffman._bufSize;
    }

    public reset() {
        this._lastLit = 0;
        this._extraBits = 0;
        this._literalTree.reset();
        this._distTree.reset();
        this._blTree.reset();
    }

    public flushStoredBlock(stored: Uint8Array, storedOffset: number, storedLength: number, lastBlock: boolean) {
        this.pending.writeBits((DeflaterHuffman.storedBlock << 1) + (lastBlock ? 1 : 0), 3);
        this.pending.alignToByte();
        this.pending.writeShort(storedLength);
        this.pending.writeShort(~storedLength);
        this.pending.writeBlock(stored, storedOffset, storedLength);
        this.reset();
    }

    public flushBlock(stored: Uint8Array, storedOffset: number, storedLength: number, lastBlock: boolean) {
        this._literalTree.freqs[DeflaterHuffman._eofSymbol]++;

        // Build trees
        this._literalTree.buildTree();
        this._distTree.buildTree();

        // Calculate bitlen frequency
        this._literalTree.calcBLFreq(this._blTree);
        this._distTree.calcBLFreq(this._blTree);

        // Build bitlen tree
        this._blTree.buildTree();

        let blTreeCodes = 4;
        for (let i = 18; i > blTreeCodes; i--) {
            if (this._blTree.length![DeflaterHuffman._blOrder[i]] > 0) {
                blTreeCodes = i + 1;
            }
        }
        let optLen =
            14 +
            blTreeCodes * 3 +
            this._blTree.getEncodedLength() +
            this._literalTree.getEncodedLength() +
            this._distTree.getEncodedLength() +
            this._extraBits;

        let staticLen = this._extraBits;
        for (let i = 0; i < DeflaterHuffman._literalNum; i++) {
            staticLen += this._literalTree.freqs[i] * DeflaterHuffman._staticLLength[i];
        }
        for (let i = 0; i < DeflaterHuffman._distNum; i++) {
            staticLen += this._distTree.freqs[i] * DeflaterHuffman._staticDLength[i];
        }
        if (optLen >= staticLen) {
            // Force static trees
            optLen = staticLen;
        }

        if (storedOffset >= 0 && storedLength + 4 < optLen >> 3) {
            // Store Block
            this.flushStoredBlock(stored, storedOffset, storedLength, lastBlock);
        } else if (optLen === staticLen) {
            // Encode with static tree
            this.pending.writeBits((DeflaterHuffman.staticTrees << 1) + (lastBlock ? 1 : 0), 3);
            this._literalTree.setStaticCodes(DeflaterHuffman._staticLCodes, DeflaterHuffman._staticLLength);
            this._distTree.setStaticCodes(DeflaterHuffman._staticDCodes, DeflaterHuffman._staticDLength);
            this.compressBlock();
            this.reset();
        } else {
            // Encode with dynamic tree
            this.pending.writeBits((DeflaterHuffman.dynTrees << 1) + (lastBlock ? 1 : 0), 3);
            this.sendAllTrees(blTreeCodes);
            this.compressBlock();
            this.reset();
        }
    }

    /**
     * Write all trees to pending buffer
     * @param blTreeCodes The number/rank of treecodes to send.
     */
    public sendAllTrees(blTreeCodes: number) {
        this._blTree.buildCodes();
        this._literalTree.buildCodes();
        this._distTree.buildCodes();
        this.pending.writeBits(this._literalTree.numCodes - 257, 5);
        this.pending.writeBits(this._distTree.numCodes - 1, 5);
        this.pending.writeBits(blTreeCodes - 4, 4);
        for (let rank = 0; rank < blTreeCodes; rank++) {
            this.pending.writeBits(this._blTree.length![DeflaterHuffman._blOrder[rank]], 3);
        }
        this._literalTree.writeTree(this._blTree);
        this._distTree.writeTree(this._blTree);
    }

    /**
     * Compress current buffer writing data to pending buffer
     */
    public compressBlock() {
        for (let i = 0; i < this._lastLit; i++) {
            const litlen = this._lBuf[i] & 0xff;
            let dist = this._dBuf[i];
            if (dist-- !== 0) {
                const lc = DeflaterHuffman._lCode(litlen);
                this._literalTree.writeSymbol(lc);

                let bits = Math.floor((lc - 261) / 4);
                if (bits > 0 && bits <= 5) {
                    this.pending.writeBits(litlen & ((1 << bits) - 1), bits);
                }

                const dc = DeflaterHuffman._dCode(dist);
                this._distTree.writeSymbol(dc);

                bits = Math.floor(dc / 2) - 1;
                if (bits > 0) {
                    this.pending.writeBits(dist & ((1 << bits) - 1), bits);
                }
            } else {
                this._literalTree.writeSymbol(litlen);
            }
        }

        this._literalTree.writeSymbol(DeflaterHuffman._eofSymbol);
    }

    /**
     * Add distance code and length to literal and distance trees
     * @param distance Distance code
     * @param length Length
     * @returns Value indicating if internal buffer is full
     */
    public tallyDist(distance: number, length: number): boolean {
        this._dBuf[this._lastLit] = distance;
        this._lBuf[this._lastLit++] = length - 3;

        const lc = DeflaterHuffman._lCode(length - 3);
        this._literalTree.freqs[lc]++;
        if (lc >= 265 && lc < 285) {
            this._extraBits += Math.floor((lc - 261) / 4);
        }

        const dc = DeflaterHuffman._dCode(distance - 1);
        this._distTree.freqs[dc]++;
        if (dc >= 4) {
            this._extraBits += Math.floor(dc / 2) - 1;
        }
        return this.isFull();
    }

    /**
     * Add literal to buffer
     * @param literal Literal value to add to buffer
     * @returns Value indicating internal buffer is full
     */
    public tallyLit(literal: number): boolean {
        this._dBuf[this._lastLit] = 0;
        this._lBuf[this._lastLit++] = literal;
        this._literalTree.freqs[literal]++;
        return this.isFull();
    }

    private static _lCode(length: number): number {
        if (length === 255) {
            return 285;
        }

        let code = 257;
        while (length >= 8) {
            code += 4;
            length = length >> 1;
        }
        return code + length;
    }

    private static _dCode(distance: number): number {
        let code = 0;
        while (distance >= 4) {
            code += 2;
            distance = distance >> 1;
        }
        return code + distance;
    }
}

DeflaterHuffman.staticInit();
