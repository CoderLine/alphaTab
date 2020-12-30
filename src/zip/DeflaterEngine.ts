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

import { Crc32 } from "./Crc32";
import { DeflaterConstants } from "./DeflaterConstants";
import { DeflaterHuffman } from "./DeflaterHuffman";
import { PendingBuffer } from "./PendingBuffer";

/**
 * Low level compression engine for deflate algorithm which uses a 32K sliding window
 * with secondary compression from Huffman/Shannon-Fano codes.
 */
export class DeflaterEngine {
    private static readonly TooFar: number = 4096;

    private blockStart: number;
    private maxChain: number = 128;
    private niceLength: number = 128;
    private goodLength: number = 8;

    /**
     * Hash index of string to be inserted
     */
    private insertHashIndex: number = 0;

    /**
     * Points to the current character in the window.
     */
    private strstart: number;

    /**
     * This array contains the part of the uncompressed stream that
     * is of relevance.  The current character is indexed by strstart.
     */
    private window: Uint8Array;

    /**
     * Hashtable, hashing three characters to an index for window, so
     * that window[index]..window[index+2] have this hash code.
     * Note that the array should really be unsigned short, so you need
     * to and the values with 0xffff.
     */
    private head: Int16Array;

    /**
     * <code>prev[index &amp; WMASK]</code> points to the previous index that has the
     * same hash code as the string starting at index.  This way
     * entries with the same hash code are in a linked list.
     * Note that the array should really be unsigned short, so you need
     * to and the values with 0xffff.
     */
    private prev: Int16Array;

    /**
     * lookahead is the number of characters starting at strstart in
     * window that are valid.
     * So window[strstart] until window[strstart+lookahead-1] are valid
     * characters.
     */
    private lookahead: number = 0;

    /**
     * The input data for compression.
     */
    private inputBuf: Uint8Array | null = null;

    /**
     * The offset into inputBuf, where input data starts.
     */
    private inputOff: number = 0;

    /**
     * The end offset of the input data.
     */
    private inputEnd: number = 0;


    /**
     * Set if previous match exists
     */
    private prevAvailable: boolean = false;

    private matchStart: number = 0;

    /**
     * Length of best match
     */
    private matchLen: number = 0;

    private pending: PendingBuffer;
    private huffman: DeflaterHuffman;

    public inputCrc: Crc32;

    /**
     * Construct instance with pending buffer
     * @param pending Pending buffer to use
     * @param noAdlerCalculation Pending buffer to use
     */
    public constructor(pending: PendingBuffer) {
        this.pending = pending;
        this.huffman = new DeflaterHuffman(pending);
        this.inputCrc = new Crc32();

        this.window = new Uint8Array(2 * DeflaterConstants.WSIZE);
        this.head = new Int16Array(DeflaterConstants.HASH_SIZE);
        this.prev = new Int16Array(DeflaterConstants.WSIZE);

        // We start at index 1, to avoid an implementation deficiency, that
        // we cannot build a repeat pattern at index 0.
        this.blockStart = 1;
        this.strstart = 1;
    }

    /**
     * Reset internal state
     */
    public reset() {
        this.huffman.reset();
        this.inputCrc.reset();
        this.blockStart = 1;
        this.strstart = 1;
        this.lookahead = 0;
        this.prevAvailable = false;
        this.matchLen = DeflaterConstants.MIN_MATCH - 1;

        for (let i = 0; i < DeflaterConstants.HASH_SIZE; i++) {
            this.head[i] = 0;
        }

        for (let i = 0; i < DeflaterConstants.WSIZE; i++) {
            this.prev[i] = 0;
        }
    }


    private updateHash() {
        this.insertHashIndex = (this.window[this.strstart] << DeflaterConstants.HASH_SHIFT) ^ this.window[this.strstart + 1];
    }

    /**
     * Determines if more input is needed.
     * @returns Return true if input is needed via setInput
     */
    public needsInput(): boolean {
        return (this.inputEnd == this.inputOff);
    }

    /**
     * Sets input data to be deflated.  Should only be called when <code>NeedsInput()</code>
     * returns true
     * @param buffer The buffer containing input data.
     * @param offset The offset of the first byte of data.
     * @param count The number of bytes of data to use as input.
     */
    public setInput(buffer: Uint8Array, offset: number, count: number) {
        let end = offset + count;
        this.inputBuf = buffer;
        this.inputOff = offset;
        this.inputEnd = end;
    }

    /**
     * Deflate drives actual compression of data
     * @param flush True to flush input buffers
     * @param finish Finish deflation with the current input.
     * @returns Returns true if progress has been made.
     */
    public deflate(flush: boolean, finish: boolean): boolean {
        let progress: boolean;
        do {
            this.fillWindow();
            let canFlush = flush && (this.inputOff == this.inputEnd);
            progress = this.deflateSlow(canFlush, finish);
        } while (this.pending.isFlushed && progress); // repeat while we have no pending output and progress was made
        return progress;
    }

    private deflateSlow(flush: boolean, finish: boolean): boolean {
        if (this.lookahead < DeflaterConstants.MIN_LOOKAHEAD && !flush) {
            return false;
        }

        while (this.lookahead >= DeflaterConstants.MIN_LOOKAHEAD || flush) {
            if (this.lookahead == 0) {
                if (this.prevAvailable) {
                    this.huffman.tallyLit(this.window[this.strstart - 1] & 0xff);
                }
                this.prevAvailable = false;

                // We are flushing everything
                this.huffman.flushBlock(this.window, this.blockStart, this.strstart - this.blockStart,
                    finish);
                this.blockStart = this.strstart;
                return false;
            }

            if (this.strstart >= 2 * DeflaterConstants.WSIZE - DeflaterConstants.MIN_LOOKAHEAD) {
                /* slide window, as FindLongestMatch needs this.
                 * This should only happen when flushing and the window
                 * is almost full.
                 */
                this.slideWindow();
            }

            let prevMatch = this.matchStart;
            let prevLen = this.matchLen;
            if (this.lookahead >= DeflaterConstants.MIN_MATCH) {
                let hashHead = this.insertString();

                if (hashHead != 0 &&
                    this.strstart - hashHead <= DeflaterConstants.MAX_DIST &&
                    this.findLongestMatch(hashHead)) {
                    // longestMatch sets matchStart and matchLen

                    // Discard match if too small and too far away
                    if (this.matchLen == DeflaterConstants.MIN_MATCH && this.strstart - this.matchStart > DeflaterEngine.TooFar) {
                        this.matchLen = DeflaterConstants.MIN_MATCH - 1;
                    }
                }
            }

            // previous match was better
            if ((prevLen >= DeflaterConstants.MIN_MATCH) && (this.matchLen <= prevLen)) {

                this.huffman.tallyDist(this.strstart - 1 - prevMatch, prevLen);
                prevLen -= 2;
                do {
                    this.strstart++;
                    this.lookahead--;
                    if (this.lookahead >= DeflaterConstants.MIN_MATCH) {
                        this.insertString();
                    }
                } while (--prevLen > 0);

                this.strstart++;
                this.lookahead--;
                this.prevAvailable = false;
                this.matchLen = DeflaterConstants.MIN_MATCH - 1;
            }
            else {
                if (this.prevAvailable) {
                    this.huffman.tallyLit(this.window[this.strstart - 1] & 0xff);
                }
                this.prevAvailable = true;
                this.strstart++;
                this.lookahead--;
            }

            if (this.huffman.isFull()) {
                let len = this.strstart - this.blockStart;
                if (this.prevAvailable) {
                    len--;
                }
                let lastBlock = (finish && (this.lookahead == 0) && !this.prevAvailable);
                this.huffman.flushBlock(this.window, this.blockStart, len, lastBlock);
                this.blockStart += len;
                return !lastBlock;
            }
        }
        return true;
    }


    /**
     * Find the best (longest) string in the window matching the
     * string starting at strstart.
     * @param curMatch 
     * @returns True if a match greater than the minimum length is found
     */
    private findLongestMatch(curMatch: number): boolean {
        let match: number;
        let scan = this.strstart;
        // scanMax is the highest position that we can look at
        let scanMax = scan + Math.min(DeflaterConstants.MAX_MATCH, this.lookahead) - 1;
        let limit = Math.max(scan - DeflaterConstants.MAX_DIST, 0);

        let window = this.window;
        let prev = this.prev;
        let chainLength = this.maxChain;
        let niceLength = Math.min(this.niceLength, this.lookahead);

        this.matchLen = Math.max(this.matchLen, DeflaterConstants.MIN_MATCH - 1);

        if (scan + this.matchLen > scanMax) {
            return false;
        }

        let scan_end1 = window[scan + this.matchLen - 1];
        let scan_end = window[scan + this.matchLen];

        // Do not waste too much time if we already have a good match:
        if (this.matchLen >= this.goodLength) {
            chainLength >>= 2;
        }

        do {
            match = curMatch;
            scan = this.strstart;

            if (window[match + this.matchLen] != scan_end
                || window[match + this.matchLen - 1] != scan_end1
                || window[match] != window[scan]
                || window[++match] != window[++scan]) {
                continue;
            }

            // scan is set to strstart+1 and the comparison passed, so
            // scanMax - scan is the maximum number of bytes we can compare.
            // below we compare 8 bytes at a time, so first we compare
            // (scanMax - scan) % 8 bytes, so the remainder is a multiple of 8

            switch ((scanMax - scan) % 8) {
                case 1:
                    if (window[++scan] == window[++match]) break;
                    break;

                case 2:
                    if (window[++scan] == window[++match]
                        && window[++scan] == window[++match]) break;
                    break;

                case 3:
                    if (window[++scan] == window[++match]
                        && window[++scan] == window[++match]
                        && window[++scan] == window[++match]) break;
                    break;

                case 4:
                    if (window[++scan] == window[++match]
                        && window[++scan] == window[++match]
                        && window[++scan] == window[++match]
                        && window[++scan] == window[++match]) break;
                    break;

                case 5:
                    if (window[++scan] == window[++match]
                        && window[++scan] == window[++match]
                        && window[++scan] == window[++match]
                        && window[++scan] == window[++match]
                        && window[++scan] == window[++match]) break;
                    break;

                case 6:
                    if (window[++scan] == window[++match]
                        && window[++scan] == window[++match]
                        && window[++scan] == window[++match]
                        && window[++scan] == window[++match]
                        && window[++scan] == window[++match]
                        && window[++scan] == window[++match]) break;
                    break;

                case 7:
                    if (window[++scan] == window[++match]
                        && window[++scan] == window[++match]
                        && window[++scan] == window[++match]
                        && window[++scan] == window[++match]
                        && window[++scan] == window[++match]
                        && window[++scan] == window[++match]
                        && window[++scan] == window[++match]) break;
                    break;
            }

            if (window[scan] == window[match]) {
                /* We check for insufficient lookahead only every 8th comparison;
                 * the 256th check will be made at strstart + 258 unless lookahead is
                 * exhausted first.
                 */
                do {
                    if (scan == scanMax) {
                        ++scan;     // advance to first position not matched
                        ++match;

                        break;
                    }
                }
                while (window[++scan] == window[++match]
                && window[++scan] == window[++match]
                && window[++scan] == window[++match]
                && window[++scan] == window[++match]
                && window[++scan] == window[++match]
                && window[++scan] == window[++match]
                && window[++scan] == window[++match]
                    && window[++scan] == window[++match]);
            }

            if (scan - this.strstart > this.matchLen) {
                this.matchStart = curMatch;
                this.matchLen = scan - this.strstart;

                if (this.matchLen >= niceLength) {
                    break;
                }

                scan_end1 = window[scan - 1];
                scan_end = window[scan];
            }
        } while ((curMatch = (prev[curMatch & DeflaterConstants.WMASK] & 0xffff)) > limit && 0 != --chainLength);

        return this.matchLen >= DeflaterConstants.MIN_MATCH;
    }


    /**
     * Inserts the current string in the head hash and returns the previous
     * value for this hash.
     * @returns The previous hash value
     */
    private insertString(): number {
        let match: number;
        let hash = ((this.insertHashIndex << DeflaterConstants.HASH_SHIFT) ^ this.window[this.strstart + (DeflaterConstants.MIN_MATCH - 1)]) & DeflaterConstants.HASH_MASK;

        this.prev[this.strstart & DeflaterConstants.WMASK] = match = this.head[hash];
        this.head[hash] = this.strstart;
        this.insertHashIndex = hash;
        return match & 0xffff;
    }

    /**
     * Fill the window
     */
    public fillWindow() {
        /* If the window is almost full and there is insufficient lookahead,
         * move the upper half to the lower one to make room in the upper half.
         */
        if (this.strstart >= DeflaterConstants.WSIZE + DeflaterConstants.MAX_DIST) {
            this.slideWindow();
        }

        /* If there is not enough lookahead, but still some input left,
         * read in the input
         */
        if (this.lookahead < DeflaterConstants.MIN_LOOKAHEAD && this.inputOff < this.inputEnd) {
            let more = 2 * DeflaterConstants.WSIZE - this.lookahead - this.strstart;

            if (more > this.inputEnd - this.inputOff) {
                more = this.inputEnd - this.inputOff;
            }

            this.window.set(this.inputBuf!.subarray(this.inputOff, this.inputOff + more), this.strstart + this.lookahead);
            this.inputCrc.update(this.inputBuf!, this.inputOff, more);

            this.inputOff += more;
            // this.totalIn += more;
            this.lookahead += more;
        }

        if (this.lookahead >= DeflaterConstants.MIN_MATCH) {
            this.updateHash();
        }
    }

    private slideWindow() {
        this.window.set(this.window.subarray(DeflaterConstants.WSIZE, DeflaterConstants.WSIZE + DeflaterConstants.WSIZE), 0);
        this.matchStart -= DeflaterConstants.WSIZE;
        this.strstart -= DeflaterConstants.WSIZE;
        this.blockStart -= DeflaterConstants.WSIZE;

        // Slide the hash table (could be avoided with 32 bit values
        // at the expense of memory usage).
        for (let i = 0; i < DeflaterConstants.HASH_SIZE; ++i) {
            let m = this.head[i] & 0xffff;
            this.head[i] = (m >= DeflaterConstants.WSIZE ? (m - DeflaterConstants.WSIZE) : 0);
        }

        // Slide the prev table.
        for (let i = 0; i < DeflaterConstants.WSIZE; i++) {
            let m = this.prev[i] & 0xffff;
            this.prev[i] = (m >= DeflaterConstants.WSIZE ? (m - DeflaterConstants.WSIZE) : 0);
        }
    }
}