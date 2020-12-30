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
import { DeflaterEngine } from "./DeflaterEngine";
import { PendingBuffer } from "./PendingBuffer";

/**
 * This is the Deflater class.  The deflater class compresses input
 * with the deflate algorithm described in RFC 1951.  It has several
 * compression levels and three different strategies described below.
 * 
 * This class is <i>not</i> thread safe.  This is inherent in the API, due
 * to the split of deflate and setInput.
 * 
 * author of the original java version : Jochen Hoenicke
 */
export class Deflater {
    /*
     * The Deflater can do the following state transitions:
     *
     * (1) -> INIT_STATE   ----> INIT_FINISHING_STATE ---.
     *        /  | (2)      (5)                          |
     *       /   v          (5)                          |
     *   (3)| SETDICT_STATE ---> SETDICT_FINISHING_STATE |(3)
     *       \   | (3)                 |        ,--------'
     *        |  |                     | (3)   /
     *        v  v          (5)        v      v
     * (1) -> BUSY_STATE   ----> FINISHING_STATE
     *                                | (6)
     *                                v
     *                           FINISHED_STATE
     *    \_____________________________________/
     *                    | (7)
     *                    v
     *               CLOSED_STATE
     *
     * (1) If we should produce a header we start in INIT_STATE, otherwise
     *     we start in BUSY_STATE.
     * (2) A dictionary may be set only when we are in INIT_STATE, then
     *     we change the state as indicated.
     * (3) Whether a dictionary is set or not, on the first call of deflate
     *     we change to BUSY_STATE.
     * (4) -- intentionally left blank -- :)
     * (5) FINISHING_STATE is entered, when flush() is called to indicate that
     *     there is no more INPUT.  There are also states indicating, that
     *     the header wasn't written yet.
     * (6) FINISHED_STATE is entered, when everything has been flushed to the
     *     internal pending output buffer.
     * (7) At any time (7)
     *
     */

    private static readonly IsFlushing: number = 0x04;
    private static readonly IsFinishing: number = 0x08;

    private static readonly BusyState: number = 0x10;
    private static readonly FlushingState: number = 0x14;
    private static readonly FinishingState: number = 0x1c;
    private static readonly FinishedState: number = 0x1e;

    private _state: number = 0;
    private _pending: PendingBuffer;
    private _engine: DeflaterEngine;

    public get inputCrc(): number {
        return this._engine.inputCrc.value;
    }

    /**
     * Creates a new deflater with given compression level
     * @param level the compression level, a value between NO_COMPRESSION and BEST_COMPRESSION.
     * beginning and the adler checksum at the end of the output.  This is
     * useful for the GZIP/PKZIP formats.
     */
    public constructor() {
        this._pending = new PendingBuffer(DeflaterConstants.PENDING_BUF_SIZE);
        this._engine = new DeflaterEngine(this._pending);
        this.reset();
    }

    /**
     * Returns true, if the input buffer is empty.
     * You should then call setInput().
     * NOTE: This method can also return true when the stream
     * was finished.
     */
    public get isNeedingInput() {
        return this._engine.needsInput();
    }

    /**
     * Returns true if the stream was finished and no more output bytes
     * are available.
     */
    public get isFinished() {
        return (this._state == Deflater.FinishedState) && this._pending.isFlushed;
    }

    /**
     * Resets the deflater. The deflater acts afterwards as if it was
     * just created with the same compression level and strategy as it
     * had before.
     */
    public reset() {
        this._state = Deflater.BusyState;
        this._pending.reset();
        this._engine.reset();
    }

    /**
     * Sets the data which should be compressed next.  This should be
     * only called when needsInput indicates that more input is needed.
     * The given byte array should not be changed, before needsInput() returns
     * true again.
     * @param input the buffer containing the input data.
     * @param offset the start of the data.
     * @param count the number of data bytes of input.
     */
    public setInput(input: Uint8Array, offset: number, count: number) {
        this._engine.setInput(input, offset, count);
    }

    /**
     * Deflates the current input block to the given array.
     * @param output Buffer to store the compressed data.
     * @param offset Offset into the output array.
     * @param length The maximum number of bytes that may be stored.
     * @returns The number of compressed bytes added to the output, or 0 if either
     * needsInput() or finished() returns true or length is zero.
     */
    public deflate(output: Uint8Array, offset: number, length: number): number {
        let origLength = length;

        for (; ;) {
            let count = this._pending.flush(output, offset, length);
            offset += count;
            length -= count;

            if (length == 0 || this._state == Deflater.FinishedState) {
                break;
            }

            if (!this._engine.deflate((this._state & Deflater.IsFlushing) != 0, (this._state & Deflater.IsFinishing) != 0)) {
                switch (this._state) {
                    case Deflater.BusyState:
                        // We need more input now
                        return origLength - length;

                    case Deflater.FlushingState:
                        /* We have to supply some lookahead.  8 bit lookahead
                            * is needed by the zlib inflater, and we must fill
                            * the next byte, so that all bits are flushed.
                            */
                        let neededbits = 8 + ((-this._pending.bitCount) & 7);
                        while (neededbits > 0) {
                            /* write a static tree block consisting solely of
                                * an EOF:
                                */
                            this._pending.writeBits(2, 10);
                            neededbits -= 10;
                        }
                        this._state = Deflater.BusyState;
                        break;

                    case Deflater.FinishingState:
                        this._pending.alignToByte();
                        this._state = Deflater.FinishedState;
                        break;
                }
            }
        }
        return origLength - length;

    }

    /**
     * Finishes the deflater with the current input block.  It is an error
     * to give more input after this method was called.  This method must
     * be called to force all bytes to be flushed.    
     */
    public finish() {
        this._state |= (Deflater.IsFlushing | Deflater.IsFinishing);
    }
}
