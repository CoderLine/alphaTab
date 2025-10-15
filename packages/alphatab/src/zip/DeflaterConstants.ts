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
 * This class contains constants used for deflation.
 * 
 * @internal
 */
export class DeflaterConstants {
    public static readonly maxWbits: number = 15;
    public static readonly wsize: number = 1 << DeflaterConstants.maxWbits;
    public static readonly wmask: number = DeflaterConstants.wsize - 1;

    public static readonly minMatch: number = 3;
    public static readonly maxMatch: number = 258;

    public static readonly defaultMemLevel: number = 8;
    public static readonly pendingBufSize: number = 1 << (DeflaterConstants.defaultMemLevel + 8);

    public static readonly hashBits: number = DeflaterConstants.defaultMemLevel + 7;
    public static readonly hashSize: number = 1 << DeflaterConstants.hashBits;
    public static readonly hashShift: number =
        (DeflaterConstants.hashBits + DeflaterConstants.minMatch - 1) / DeflaterConstants.minMatch;
    public static readonly hashMask: number = DeflaterConstants.hashSize - 1;

    public static readonly minLookahead: number = DeflaterConstants.maxMatch + DeflaterConstants.minMatch + 1;
    public static readonly maxDist: number = DeflaterConstants.wsize - DeflaterConstants.minLookahead;
}
