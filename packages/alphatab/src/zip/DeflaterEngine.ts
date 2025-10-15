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

import { Crc32 } from '@src/zip/Crc32';
import { DeflaterConstants } from '@src/zip/DeflaterConstants';
import { DeflaterHuffman } from '@src/zip/DeflaterHuffman';
import type { PendingBuffer } from '@src/zip/PendingBuffer';

/**
 * Low level compression engine for deflate algorithm which uses a 32K sliding window
 * with secondary compression from Huffman/Shannon-Fano codes.
 * 
 * @internal
 */
export class DeflaterEngine {
    private static readonly _tooFar: number = 4096;

    private _blockStart: number;
    private _maxChain: number = 128;
    private _niceLength: number = 128;
    private _goodLength: number = 8;

    /**
     * Hash index of string to be inserted
     */
    private _insertHashIndex: number = 0;

    /**
     * Points to the current character in the window.
     */
    private _strstart: number;

    /**
     * This array contains the part of the uncompressed stream that
     * is of relevance.  The current character is indexed by strstart.
     */
    private _window: Uint8Array;

    /**
     * Hashtable, hashing three characters to an index for window, so
     * that window[index]..window[index+2] have this hash code.
     * Note that the array should really be unsigned short, so you need
     * to and the values with 0xffff.
     */
    private _head: Int16Array;

    /**
     * <code>prev[index &amp; WMASK]</code> points to the previous index that has the
     * same hash code as the string starting at index.  This way
     * entries with the same hash code are in a linked list.
     * Note that the array should really be unsigned short, so you need
     * to and the values with 0xffff.
     */
    private _prev: Int16Array;

    /**
     * lookahead is the number of characters starting at strstart in
     * window that are valid.
     * So window[strstart] until window[strstart+lookahead-1] are valid
     * characters.
     */
    private _lookahead: number = 0;

    /**
     * The input data for compression.
     */
    private _inputBuf: Uint8Array | null = null;

    /**
     * The offset into inputBuf, where input data starts.
     */
    private _inputOff: number = 0;

    /**
     * The end offset of the input data.
     */
    private _inputEnd: number = 0;

    /**
     * Set if previous match exists
     */
    private _prevAvailable: boolean = false;

    private _matchStart: number = 0;

    /**
     * Length of best match
     */
    private _matchLen: number = 0;

    private _pending: PendingBuffer;
    private _huffman: DeflaterHuffman;

    public inputCrc: Crc32;

    /**
     * Construct instance with pending buffer
     * @param pending Pending buffer to use
     * @param noAdlerCalculation Pending buffer to use
     */
    public constructor(pending: PendingBuffer) {
        this._pending = pending;
        this._huffman = new DeflaterHuffman(pending);
        this.inputCrc = new Crc32();

        this._window = new Uint8Array(2 * DeflaterConstants.wsize);
        this._head = new Int16Array(DeflaterConstants.hashSize);
        this._prev = new Int16Array(DeflaterConstants.wsize);

        // We start at index 1, to avoid an implementation deficiency, that
        // we cannot build a repeat pattern at index 0.
        this._blockStart = 1;
        this._strstart = 1;
    }

    /**
     * Reset internal state
     */
    public reset() {
        this._huffman.reset();
        this.inputCrc.reset();
        this._blockStart = 1;
        this._strstart = 1;
        this._lookahead = 0;
        this._prevAvailable = false;
        this._matchLen = DeflaterConstants.minMatch - 1;

        for (let i = 0; i < DeflaterConstants.hashSize; i++) {
            this._head[i] = 0;
        }

        for (let i = 0; i < DeflaterConstants.wsize; i++) {
            this._prev[i] = 0;
        }
    }

    private _updateHash() {
        this._insertHashIndex =
            (this._window[this._strstart] << DeflaterConstants.hashShift) ^ this._window[this._strstart + 1];
    }

    /**
     * Determines if more input is needed.
     * @returns Return true if input is needed via setInput
     */
    public needsInput(): boolean {
        return this._inputEnd === this._inputOff;
    }

    /**
     * Sets input data to be deflated.  Should only be called when <code>NeedsInput()</code>
     * returns true
     * @param buffer The buffer containing input data.
     * @param offset The offset of the first byte of data.
     * @param count The number of bytes of data to use as input.
     */
    public setInput(buffer: Uint8Array, offset: number, count: number) {
        const end = offset + count;
        this._inputBuf = buffer;
        this._inputOff = offset;
        this._inputEnd = end;
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
            const canFlush = flush && this._inputOff === this._inputEnd;
            progress = this._deflateSlow(canFlush, finish);
        } while (this._pending.isFlushed && progress); // repeat while we have no pending output and progress was made
        return progress;
    }

    private _deflateSlow(flush: boolean, finish: boolean): boolean {
        if (this._lookahead < DeflaterConstants.minLookahead && !flush) {
            return false;
        }

        while (this._lookahead >= DeflaterConstants.minLookahead || flush) {
            if (this._lookahead === 0) {
                if (this._prevAvailable) {
                    this._huffman.tallyLit(this._window[this._strstart - 1] & 0xff);
                }
                this._prevAvailable = false;

                // We are flushing everything
                this._huffman.flushBlock(this._window, this._blockStart, this._strstart - this._blockStart, finish);
                this._blockStart = this._strstart;
                return false;
            }

            if (this._strstart >= 2 * DeflaterConstants.wsize - DeflaterConstants.minLookahead) {
                /* slide window, as FindLongestMatch needs this.
                 * This should only happen when flushing and the window
                 * is almost full.
                 */
                this._slideWindow();
            }

            const prevMatch = this._matchStart;
            let prevLen = this._matchLen;
            if (this._lookahead >= DeflaterConstants.minMatch) {
                const hashHead = this._insertString();

                if (
                    hashHead !== 0 &&
                    this._strstart - hashHead <= DeflaterConstants.maxDist &&
                    this._findLongestMatch(hashHead)
                ) {
                    // longestMatch sets matchStart and matchLen

                    // Discard match if too small and too far away
                    if (
                        this._matchLen === DeflaterConstants.minMatch &&
                        this._strstart - this._matchStart > DeflaterEngine._tooFar
                    ) {
                        this._matchLen = DeflaterConstants.minMatch - 1;
                    }
                }
            }

            // previous match was better
            if (prevLen >= DeflaterConstants.minMatch && this._matchLen <= prevLen) {
                this._huffman.tallyDist(this._strstart - 1 - prevMatch, prevLen);
                prevLen -= 2;
                do {
                    this._strstart++;
                    this._lookahead--;
                    if (this._lookahead >= DeflaterConstants.minMatch) {
                        this._insertString();
                    }
                } while (--prevLen > 0);

                this._strstart++;
                this._lookahead--;
                this._prevAvailable = false;
                this._matchLen = DeflaterConstants.minMatch - 1;
            } else {
                if (this._prevAvailable) {
                    this._huffman.tallyLit(this._window[this._strstart - 1] & 0xff);
                }
                this._prevAvailable = true;
                this._strstart++;
                this._lookahead--;
            }

            if (this._huffman.isFull()) {
                let len = this._strstart - this._blockStart;
                if (this._prevAvailable) {
                    len--;
                }
                const lastBlock = finish && this._lookahead === 0 && !this._prevAvailable;
                this._huffman.flushBlock(this._window, this._blockStart, len, lastBlock);
                this._blockStart += len;
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
    private _findLongestMatch(curMatch: number): boolean {
        let match: number;
        let scan = this._strstart;
        // scanMax is the highest position that we can look at
        const scanMax = scan + Math.min(DeflaterConstants.maxMatch, this._lookahead) - 1;
        const limit = Math.max(scan - DeflaterConstants.maxDist, 0);

        const window = this._window;
        const prev = this._prev;
        let chainLength = this._maxChain;
        const niceLength = Math.min(this._niceLength, this._lookahead);

        this._matchLen = Math.max(this._matchLen, DeflaterConstants.minMatch - 1);

        if (scan + this._matchLen > scanMax) {
            return false;
        }

        let scanEnd1 = window[scan + this._matchLen - 1];
        let scanEnd = window[scan + this._matchLen];

        // Do not waste too much time if we already have a good match:
        if (this._matchLen >= this._goodLength) {
            chainLength >>= 2;
        }

        do {
            match = curMatch;
            scan = this._strstart;

            if (
                window[match + this._matchLen] !== scanEnd ||
                window[match + this._matchLen - 1] !== scanEnd1 ||
                window[match] !== window[scan] ||
                window[++match] !== window[++scan]
            ) {
                continue;
            }

            // scan is set to strstart+1 and the comparison passed, so
            // scanMax - scan is the maximum number of bytes we can compare.
            // below we compare 8 bytes at a time, so first we compare
            // (scanMax - scan) % 8 bytes, so the remainder is a multiple of 8

            switch ((scanMax - scan) % 8) {
                case 1:
                    if (window[++scan] === window[++match]) {
                        break;
                    }
                    break;

                case 2:
                    if (window[++scan] === window[++match] && window[++scan] === window[++match]) {
                        break;
                    }
                    break;

                case 3:
                    if (
                        window[++scan] === window[++match] &&
                        window[++scan] === window[++match] &&
                        window[++scan] === window[++match]
                    ) {
                        break;
                    }
                    break;

                case 4:
                    if (
                        window[++scan] === window[++match] &&
                        window[++scan] === window[++match] &&
                        window[++scan] === window[++match] &&
                        window[++scan] === window[++match]
                    ) {
                        break;
                    }
                    break;

                case 5:
                    if (
                        window[++scan] === window[++match] &&
                        window[++scan] === window[++match] &&
                        window[++scan] === window[++match] &&
                        window[++scan] === window[++match] &&
                        window[++scan] === window[++match]
                    ) {
                        break;
                    }
                    break;

                case 6:
                    if (
                        window[++scan] === window[++match] &&
                        window[++scan] === window[++match] &&
                        window[++scan] === window[++match] &&
                        window[++scan] === window[++match] &&
                        window[++scan] === window[++match] &&
                        window[++scan] === window[++match]
                    ) {
                        break;
                    }
                    break;

                case 7:
                    if (
                        window[++scan] === window[++match] &&
                        window[++scan] === window[++match] &&
                        window[++scan] === window[++match] &&
                        window[++scan] === window[++match] &&
                        window[++scan] === window[++match] &&
                        window[++scan] === window[++match] &&
                        window[++scan] === window[++match]
                    ) {
                        break;
                    }
                    break;
            }

            if (window[scan] === window[match]) {
                /* We check for insufficient lookahead only every 8th comparison;
                 * the 256th check will be made at strstart + 258 unless lookahead is
                 * exhausted first.
                 */
                do {
                    if (scan === scanMax) {
                        ++scan; // advance to first position not matched
                        ++match;

                        break;
                    }
                } while (
                    window[++scan] === window[++match] &&
                    window[++scan] === window[++match] &&
                    window[++scan] === window[++match] &&
                    window[++scan] === window[++match] &&
                    window[++scan] === window[++match] &&
                    window[++scan] === window[++match] &&
                    window[++scan] === window[++match] &&
                    window[++scan] === window[++match]
                );
            }

            if (scan - this._strstart > this._matchLen) {
                this._matchStart = curMatch;
                this._matchLen = scan - this._strstart;

                if (this._matchLen >= niceLength) {
                    break;
                }

                scanEnd1 = window[scan - 1];
                scanEnd = window[scan];
            }
            curMatch = prev[curMatch & DeflaterConstants.wmask] & 0xffff;
        } while (curMatch > limit && 0 !== --chainLength);

        return this._matchLen >= DeflaterConstants.minMatch;
    }

    /**
     * Inserts the current string in the head hash and returns the previous
     * value for this hash.
     * @returns The previous hash value
     */
    private _insertString(): number {
        const hash =
            ((this._insertHashIndex << DeflaterConstants.hashShift) ^
                this._window[this._strstart + (DeflaterConstants.minMatch - 1)]) &
            DeflaterConstants.hashMask;

        const match = this._head[hash];
        this._prev[this._strstart & DeflaterConstants.wmask] = match;
        this._head[hash] = this._strstart;
        this._insertHashIndex = hash;
        return match & 0xffff;
    }

    /**
     * Fill the window
     */
    public fillWindow() {
        /* If the window is almost full and there is insufficient lookahead,
         * move the upper half to the lower one to make room in the upper half.
         */
        if (this._strstart >= DeflaterConstants.wsize + DeflaterConstants.maxDist) {
            this._slideWindow();
        }

        /* If there is not enough lookahead, but still some input left,
         * read in the input
         */
        if (this._lookahead < DeflaterConstants.minLookahead && this._inputOff < this._inputEnd) {
            let more = 2 * DeflaterConstants.wsize - this._lookahead - this._strstart;

            if (more > this._inputEnd - this._inputOff) {
                more = this._inputEnd - this._inputOff;
            }

            this._window.set(
                this._inputBuf!.subarray(this._inputOff, this._inputOff + more),
                this._strstart + this._lookahead
            );
            this.inputCrc.update(this._inputBuf!, this._inputOff, more);

            this._inputOff += more;
            // this.totalIn += more;
            this._lookahead += more;
        }

        if (this._lookahead >= DeflaterConstants.minMatch) {
            this._updateHash();
        }
    }

    private _slideWindow() {
        this._window.set(
            this._window.subarray(DeflaterConstants.wsize, DeflaterConstants.wsize + DeflaterConstants.wsize),
            0
        );
        this._matchStart -= DeflaterConstants.wsize;
        this._strstart -= DeflaterConstants.wsize;
        this._blockStart -= DeflaterConstants.wsize;

        // Slide the hash table (could be avoided with 32 bit values
        // at the expense of memory usage).
        for (let i = 0; i < DeflaterConstants.hashSize; ++i) {
            const m = this._head[i] & 0xffff;
            this._head[i] = m >= DeflaterConstants.wsize ? m - DeflaterConstants.wsize : 0;
        }

        // Slide the prev table.
        for (let i = 0; i < DeflaterConstants.wsize; i++) {
            const m = this._prev[i] & 0xffff;
            this._prev[i] = m >= DeflaterConstants.wsize ? m - DeflaterConstants.wsize : 0;
        }
    }
}
