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

import { DeflaterConstants } from "./DeflaterConstants";
import { PendingBuffer } from "./PendingBuffer";


class Tree {
    // repeat previous bit length 3-6 times (2 bits of repeat count)
    private static readonly Repeat3To6 = 16;

    // repeat a zero length 3-10 times  (3 bits of repeat count)
    private static readonly Repeat3To10 = 17;

    // repeat a zero length 11-138 times  (7 bits of repeat count)
    private static readonly Repeat11To138 = 18;

    public freqs: Int16Array;

    public length: Uint8Array | null = null;

    public minNumCodes: number;

    public numCodes: number = 0;

    private codes: Int16Array | null = null;
    private readonly bitLengthCounts: Int32Array;
    private readonly maxLength: number;
    private huffman: DeflaterHuffman;

    public constructor(dh: DeflaterHuffman, elems: number, minCodes: number, maxLength: number) {
        this.huffman = dh;
        this.minNumCodes = minCodes;
        this.maxLength = maxLength;
        this.freqs = new Int16Array(elems);
        this.bitLengthCounts = new Int32Array(maxLength);
    }

    /**
     * Resets the internal state of the tree
     */
    public reset() {
        for (let i = 0; i < this.freqs.length; i++) {
            this.freqs[i] = 0;
        }
        this.codes = null;
        this.length = null;
    }


    public buildTree() {
        let numSymbols = this.freqs.length;

        /* heap is a priority queue, sorted by frequency, least frequent
        * nodes first.  The heap is a binary tree, with the property, that
        * the parent node is smaller than both child nodes.  This assures
        * that the smallest node is the first parent.
        *
        * The binary tree is encoded in an array:  0 is root node and
        * the nodes 2*n+1, 2*n+2 are the child nodes of node n.
        */
        let heap = new Int32Array(numSymbols);
        let heapLen = 0;
        let maxCode = 0;
        for (let n = 0; n < numSymbols; n++) {
            let freq = this.freqs[n];
            if (freq != 0) {
                // Insert n into heap
                let pos = heapLen++;
                let ppos;
                while (pos > 0 && this.freqs[heap[ppos = Math.floor((pos - 1) / 2)]] > freq) {
                    heap[pos] = heap[ppos];
                    pos = ppos;
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
            let node = maxCode < 2 ? ++maxCode : 0;
            heap[heapLen++] = node;
        }

        this.numCodes = Math.max(maxCode + 1, this.minNumCodes);

        let numLeafs = heapLen;
        let childs = new Int32Array(4 * heapLen - 2);
        let values = new Int32Array(2 * heapLen - 1);
        let numNodes = numLeafs;
        for (let i = 0; i < heapLen; i++) {
            let node = heap[i];
            childs[2 * i] = node;
            childs[2 * i + 1] = -1;
            values[i] = this.freqs[node] << 8;
            heap[i] = i;
        }

        /* Construct the Huffman tree by repeatedly combining the least two
        * frequent nodes.
        */
        do {
            let first = heap[0];
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
            while ((path = ppos) > 0 && values[heap[ppos = Math.floor((path - 1) / 2)]] > lastVal) {
                heap[path] = heap[ppos];
            }
            heap[path] = last;

            let second = heap[0];

            // Create a new node father of first and second
            last = numNodes++;
            childs[2 * last] = first;
            childs[2 * last + 1] = second;
            let mindepth = Math.min(values[first] & 0xff, values[second] & 0xff);
            values[last] = lastVal = values[first] + values[second] - mindepth + 1;

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
            while ((path = ppos) > 0 && values[heap[ppos = Math.floor((path - 1) / 2)]] > lastVal) {
                heap[path] = heap[ppos];
            }
            heap[path] = last;
        } while (heapLen > 1);

        this.buildLength(childs);
    }


    private buildLength(childs: Int32Array) {
        this.length = new Uint8Array(this.freqs.length);
        let numNodes = Math.floor(childs.length / 2);
        let numLeafs = Math.floor((numNodes + 1) / 2);
        let overflow = 0;

        for (let i = 0; i < this.maxLength; i++) {
            this.bitLengthCounts[i] = 0;
        }

        // First calculate optimal bit lengths
        let lengths = new Int32Array(numNodes);
        lengths[numNodes - 1] = 0;

        for (let i = numNodes - 1; i >= 0; i--) {
            if (childs[2 * i + 1] != -1) {
                let bitLength = lengths[i] + 1;
                if (bitLength > this.maxLength) {
                    bitLength = this.maxLength;
                    overflow++;
                }
                lengths[childs[2 * i]] = lengths[childs[2 * i + 1]] = bitLength;
            }
            else {
                // A leaf node
                let bitLength = lengths[i];
                this.bitLengthCounts[bitLength - 1]++;
                this.length[childs[2 * i]] = lengths[i];
            }
        }

        if (overflow == 0) {
            return;
        }

        let incrBitLen = this.maxLength - 1;
        do {
            // Find the first bit length which could increase:
            while (this.bitLengthCounts[--incrBitLen] == 0) {
            }

            // Move this node one down and remove a corresponding
            // number of overflow nodes.
            do {
                this.bitLengthCounts[incrBitLen]--;
                this.bitLengthCounts[++incrBitLen]++;
                overflow -= 1 << (this.maxLength - 1 - incrBitLen);
            } while (overflow > 0 && incrBitLen < this.maxLength - 1);
        } while (overflow > 0);

        /* We may have overshot above.  Move some nodes from maxLength to
        * maxLength-1 in that case.
        */
        this.bitLengthCounts[this.maxLength - 1] += overflow;
        this.bitLengthCounts[this.maxLength - 2] -= overflow;

        /* Now recompute all bit lengths, scanning in increasing
        * frequency.  It is simpler to reconstruct all lengths instead of
        * fixing only the wrong ones. This idea is taken from 'ar'
        * written by Haruhiko Okumura.
        *
        * The nodes were inserted with decreasing frequency into the childs
        * array.
        */
        let nodePtr = 2 * numLeafs;
        for (let bits = this.maxLength; bits != 0; bits--) {
            let n = this.bitLengthCounts[bits - 1];
            while (n > 0) {
                let childPtr = 2 * childs[nodePtr++];
                if (childs[childPtr + 1] == -1) {
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
        let max_count: number;               /* max repeat count */
        let min_count: number;               /* min repeat count */
        let count: number;                   /* repeat count of the current code */
        let curlen = -1;             /* length of current code */

        let i = 0;
        while (i < this.numCodes) {
            count = 1;
            let nextlen = this.length![i];
            if (nextlen == 0) {
                max_count = 138;
                min_count = 3;
            }
            else {
                max_count = 6;
                min_count = 3;
                if (curlen != nextlen) {
                    blTree.freqs[nextlen]++;
                    count = 0;
                }
            }
            curlen = nextlen;
            i++;

            while (i < this.numCodes && curlen == this.length![i]) {
                i++;
                if (++count >= max_count) {
                    break;
                }
            }

            if (count < min_count) {
                blTree.freqs[curlen] += count;
            }
            else if (curlen != 0) {
                blTree.freqs[Tree.Repeat3To6]++;
            }
            else if (count <= 10) {
                blTree.freqs[Tree.Repeat3To10]++;
            }
            else {
                blTree.freqs[Tree.Repeat11To138]++;
            }
        }
    }

    /**
     * Set static codes and length
     * @param staticCodes new codes
     * @param staticLengths length for new codes
     */
    public setStaticCodes(staticCodes: Int16Array, staticLengths: Uint8Array) {
        this.codes = staticCodes;
        this.length = staticLengths;
    }


    /**
     * Build dynamic codes and lengths
     */
    public buildCodes() {
        let nextCode = new Int32Array(this.maxLength);
        let code = 0;

        this.codes = new Int16Array(this.freqs.length);

        for (let bits = 0; bits < this.maxLength; bits++) {
            nextCode[bits] = code;
            code += this.bitLengthCounts[bits] << (15 - bits);

        }

        for (let i = 0; i < this.numCodes; i++) {
            let bits = this.length![i];
            if (bits > 0) {
                this.codes[i] = DeflaterHuffman.bitReverse(nextCode[bits - 1]);
                nextCode[bits - 1] += 1 << (16 - bits);
            }
        }
    }

    /**
     * Write tree values
     * @param blTree Tree to write
     */
    public writeTree(blTree: Tree) {
        let maxCount: number;               // max repeat count
        let minCount: number;               // min repeat count
        let count: number;                   // repeat count of the current code
        let curlen = -1;             // length of current code

        let i = 0;
        while (i < this.numCodes) {
            count = 1;
            let nextlen = this.length![i];
            if (nextlen == 0) {
                maxCount = 138;
                minCount = 3;
            }
            else {
                maxCount = 6;
                minCount = 3;
                if (curlen != nextlen) {
                    blTree.writeSymbol(nextlen);
                    count = 0;
                }
            }
            curlen = nextlen;
            i++;

            while (i < this.numCodes && curlen == this.length![i]) {
                i++;
                if (++count >= maxCount) {
                    break;
                }
            }

            if (count < minCount) {
                while (count-- > 0) {
                    blTree.writeSymbol(curlen);
                }
            }
            else if (curlen != 0) {
                blTree.writeSymbol(Tree.Repeat3To6);
                this.huffman.pending.writeBits(count - 3, 2);
            }
            else if (count <= 10) {
                blTree.writeSymbol(Tree.Repeat3To10);
                this.huffman.pending.writeBits(count - 3, 3);
            }
            else {
                blTree.writeSymbol(Tree.Repeat11To138);
                this.huffman.pending.writeBits(count - 11, 7);
            }
        }
    }

    public writeSymbol(code: number) {
        this.huffman.pending.writeBits(this.codes![code] & 0xffff, this.length![code]);
    }
}

export class DeflaterHuffman {
    private static readonly BUFSIZE = 1 << (DeflaterConstants.DEFAULT_MEM_LEVEL + 6);
    private static readonly LITERAL_NUM = 286;

    /**
     * Written to Zip file to identify a stored block
     */
    public static readonly STORED_BLOCK = 0;

    /**
     * Identifies static tree in Zip file
     */
    public static readonly STATIC_TREES = 1;

    /**
     * Identifies dynamic tree in Zip file
     */
    public static readonly DYN_TREES = 2;

    // Number of distance codes
    private static readonly DIST_NUM = 30;


    private static staticLCodes: Int16Array;
    private static staticLLength: Uint8Array;
    private static staticDCodes: Int16Array;
    private static staticDLength: Uint8Array;

    public static staticInit() {
        // See RFC 1951 3.2.6
        // Literal codes
        DeflaterHuffman.staticLCodes = new Int16Array(DeflaterHuffman.LITERAL_NUM);
        DeflaterHuffman.staticLLength = new Uint8Array(DeflaterHuffman.LITERAL_NUM);

        let i = 0;
        while (i < 144) {
            DeflaterHuffman.staticLCodes[i] = DeflaterHuffman.bitReverse((0x030 + i) << 8);
            DeflaterHuffman.staticLLength[i++] = 8;
        }

        while (i < 256) {
            DeflaterHuffman.staticLCodes[i] = DeflaterHuffman.bitReverse((0x190 - 144 + i) << 7);
            DeflaterHuffman.staticLLength[i++] = 9;
        }

        while (i < 280) {
            DeflaterHuffman.staticLCodes[i] = DeflaterHuffman.bitReverse((0x000 - 256 + i) << 9);
            DeflaterHuffman.staticLLength[i++] = 7;
        }

        while (i < DeflaterHuffman.LITERAL_NUM) {
            DeflaterHuffman.staticLCodes[i] = DeflaterHuffman.bitReverse((0x0c0 - 280 + i) << 8);
            DeflaterHuffman.staticLLength[i++] = 8;
        }

        // Distance codes
        DeflaterHuffman.staticDCodes = new Int16Array(DeflaterHuffman.DIST_NUM);
        DeflaterHuffman.staticDLength = new Uint8Array(DeflaterHuffman.DIST_NUM);
        for (i = 0; i < DeflaterHuffman.DIST_NUM; i++) {
            DeflaterHuffman.staticDCodes[i] = DeflaterHuffman.bitReverse(i << 11);
            DeflaterHuffman.staticDLength[i] = 5;
        }
    }

    // The lengths of the bit length codes are sent in order of decreasing
    // probability, to avoid transmitting the lengths for unused bit length codes.
    private static readonly BL_ORDER: number[] = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];

    private static readonly bit4Reverse: Uint8Array = new Uint8Array([
        0,
        8,
        4,
        12,
        2,
        10,
        6,
        14,
        1,
        9,
        5,
        13,
        3,
        11,
        7,
        15
    ]);

    /**
     * Reverse the bits of a 16 bit value.
     * @param toReverse Value to reverse bits
     * @returns Value with bits reversed
     */
    public static bitReverse(toReverse: number): number {
        return (DeflaterHuffman.bit4Reverse[toReverse & 0xF] << 12 |
            DeflaterHuffman.bit4Reverse[(toReverse >> 4) & 0xF] << 8 |
            DeflaterHuffman.bit4Reverse[(toReverse >> 8) & 0xF] << 4 |
            DeflaterHuffman.bit4Reverse[toReverse >> 12]);
    }

    // Number of codes used to transfer bit lengths
    private static readonly BITLEN_NUM = 19;



    private static readonly EOF_SYMBOL = 256;


    /**
     * Pending buffer to use
     */
    public pending: PendingBuffer;

    private literalTree: Tree;
    private distTree: Tree;
    private blTree: Tree;

    // Buffer for distances
    private d_buf: Int16Array;

    private l_buf: Uint8Array;
    private last_lit: number = 0;
    private extra_bits: number = 0;

    public constructor(pending: PendingBuffer) {
        this.pending = pending;

        this.literalTree = new Tree(this, DeflaterHuffman.LITERAL_NUM, 257, 15);
        this.distTree = new Tree(this, DeflaterHuffman.DIST_NUM, 1, 15);
        this.blTree = new Tree(this, DeflaterHuffman.BITLEN_NUM, 4, 7);

        this.d_buf = new Int16Array(DeflaterHuffman.BUFSIZE);
        this.l_buf = new Uint8Array(DeflaterHuffman.BUFSIZE);
    }

    public isFull(): boolean {
        return this.last_lit >= DeflaterHuffman.BUFSIZE;
    }

    public reset() {
        this.last_lit = 0;
        this.extra_bits = 0;
        this.literalTree.reset();
        this.distTree.reset();
        this.blTree.reset();
    }

    public flushStoredBlock(stored: Uint8Array, storedOffset: number, storedLength: number, lastBlock: boolean) {
        this.pending.writeBits((DeflaterHuffman.STORED_BLOCK << 1) + (lastBlock ? 1 : 0), 3);
        this.pending.alignToByte();
        this.pending.writeShort(storedLength);
        this.pending.writeShort(~storedLength);
        this.pending.writeBlock(stored, storedOffset, storedLength);
        this.reset();
    }

    public flushBlock(stored: Uint8Array, storedOffset: number, storedLength: number, lastBlock: boolean) {
        this.literalTree.freqs[DeflaterHuffman.EOF_SYMBOL]++;

        // Build trees
        this.literalTree.buildTree();
        this.distTree.buildTree();

        // Calculate bitlen frequency
        this.literalTree.calcBLFreq(this.blTree);
        this.distTree.calcBLFreq(this.blTree);

        // Build bitlen tree
        this.blTree.buildTree();

        let blTreeCodes = 4;
        for (let i = 18; i > blTreeCodes; i--) {
            if (this.blTree.length![DeflaterHuffman.BL_ORDER[i]] > 0) {
                blTreeCodes = i + 1;
            }
        }
        let opt_len = 14 + blTreeCodes * 3 + this.blTree.getEncodedLength() +
            this.literalTree.getEncodedLength() + this.distTree.getEncodedLength() +
            this.extra_bits;

        let static_len = this.extra_bits;
        for (let i = 0; i < DeflaterHuffman.LITERAL_NUM; i++) {
            static_len += this.literalTree.freqs[i] * DeflaterHuffman.staticLLength[i];
        }
        for (let i = 0; i < DeflaterHuffman.DIST_NUM; i++) {
            static_len += this.distTree.freqs[i] * DeflaterHuffman.staticDLength[i];
        }
        if (opt_len >= static_len) {
            // Force static trees
            opt_len = static_len;
        }

        if (storedOffset >= 0 && storedLength + 4 < opt_len >> 3) {
            // Store Block
            this.flushStoredBlock(stored, storedOffset, storedLength, lastBlock);
        }
        else if (opt_len == static_len) {
            // Encode with static tree
            this.pending.writeBits((DeflaterHuffman.STATIC_TREES << 1) + (lastBlock ? 1 : 0), 3);
            this.literalTree.setStaticCodes(DeflaterHuffman.staticLCodes, DeflaterHuffman.staticLLength);
            this.distTree.setStaticCodes(DeflaterHuffman.staticDCodes, DeflaterHuffman.staticDLength);
            this.compressBlock();
            this.reset();
        }
        else {
            // Encode with dynamic tree
            this.pending.writeBits((DeflaterHuffman.DYN_TREES << 1) + (lastBlock ? 1 : 0), 3);
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
        this.blTree.buildCodes();
        this.literalTree.buildCodes();
        this.distTree.buildCodes();
        this.pending.writeBits(this.literalTree.numCodes - 257, 5);
        this.pending.writeBits(this.distTree.numCodes - 1, 5);
        this.pending.writeBits(blTreeCodes - 4, 4);
        for (let rank = 0; rank < blTreeCodes; rank++) {
            this.pending.writeBits(this.blTree.length![DeflaterHuffman.BL_ORDER[rank]], 3);
        }
        this.literalTree.writeTree(this.blTree);
        this.distTree.writeTree(this.blTree);
    }

    /**
     * Compress current buffer writing data to pending buffer
     */
    public compressBlock() {
        for (let i = 0; i < this.last_lit; i++) {
            let litlen = this.l_buf[i] & 0xff;
            let dist = this.d_buf[i];
            if (dist-- != 0) {
                let lc = DeflaterHuffman.Lcode(litlen);
                this.literalTree.writeSymbol(lc);

                let bits = Math.floor((lc - 261) / 4);
                if (bits > 0 && bits <= 5) {
                    this.pending.writeBits(litlen & ((1 << bits) - 1), bits);
                }

                let dc = DeflaterHuffman.Dcode(dist);
                this.distTree.writeSymbol(dc);

                bits = Math.floor(dc / 2) - 1;
                if (bits > 0) {
                    this.pending.writeBits(dist & ((1 << bits) - 1), bits);
                }
            }
            else {
                this.literalTree.writeSymbol(litlen);
            }
        }

        this.literalTree.writeSymbol(DeflaterHuffman.EOF_SYMBOL);
    }

    /**
     * Add distance code and length to literal and distance trees
     * @param distance Distance code
     * @param length Length
     * @returns Value indicating if internal buffer is full
     */
    public tallyDist(distance: number, length: number): boolean {
        this.d_buf[this.last_lit] = distance;
        this.l_buf[this.last_lit++] = (length - 3);

        let lc = DeflaterHuffman.Lcode(length - 3);
        this.literalTree.freqs[lc]++;
        if (lc >= 265 && lc < 285) {
            this.extra_bits += Math.floor((lc - 261) / 4);
        }

        let dc = DeflaterHuffman.Dcode(distance - 1);
        this.distTree.freqs[dc]++;
        if (dc >= 4) {
            this.extra_bits += Math.floor(dc / 2) - 1;
        }
        return this.isFull();
    }

    /**
     * Add literal to buffer
     * @param literal Literal value to add to buffer
     * @returns Value indicating internal buffer is full
     */
    public tallyLit(literal: number): boolean {
        this.d_buf[this.last_lit] = 0;
        this.l_buf[this.last_lit++] = literal;
        this.literalTree.freqs[literal]++;
        return this.isFull();
    }

    private static Lcode(length: number): number {
        if (length == 255) {
            return 285;
        }

        let code = 257;
        while (length >= 8) {
            code += 4;
            length >>= 1;
        }
        return code + length;
    }

    private static Dcode(distance: number): number {
        let code = 0;
        while (distance >= 4) {
            code += 2;
            distance >>= 1;
        }
        return code + distance;
    }
}

DeflaterHuffman.staticInit();
