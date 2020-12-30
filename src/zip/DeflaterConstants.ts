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
 */
export class DeflaterConstants {
    public static readonly MAX_WBITS: number = 15;
    public static readonly WSIZE: number = 1 << DeflaterConstants.MAX_WBITS;
    public static readonly WMASK: number = DeflaterConstants.WSIZE - 1;

    public static readonly MIN_MATCH: number = 3;
    public static readonly MAX_MATCH: number = 258;

    public static readonly DEFAULT_MEM_LEVEL: number = 8;
    public static readonly PENDING_BUF_SIZE: number = 1 << (DeflaterConstants.DEFAULT_MEM_LEVEL + 8);

    public static readonly HASH_BITS: number = DeflaterConstants.DEFAULT_MEM_LEVEL + 7;
    public static readonly HASH_SIZE: number = 1 << DeflaterConstants.HASH_BITS;
    public static readonly HASH_SHIFT: number = (DeflaterConstants.HASH_BITS + DeflaterConstants.MIN_MATCH - 1) / DeflaterConstants.MIN_MATCH;
    public static readonly HASH_MASK: number = DeflaterConstants.HASH_SIZE - 1;

    public static readonly MIN_LOOKAHEAD: number = DeflaterConstants.MAX_MATCH + DeflaterConstants.MIN_MATCH + 1;
    public static readonly MAX_DIST: number = DeflaterConstants.WSIZE - DeflaterConstants.MIN_LOOKAHEAD;
}