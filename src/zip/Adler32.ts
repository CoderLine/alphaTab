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
 * Computes Adler32 checksum for a stream of data. An Adler32
 * checksum is not as reliable as a CRC32 checksum, but a lot faster to
 * compute.
 *
 * The specification for Adler32 may be found in RFC 1950.
 * ZLIB Compressed Data Format Specification version 3.3)
 */
export class Adler32 {

    /**
     * largest prime smaller than 65536
     */
    private static readonly Base: number = 65521;


    /**
     * Returns the Adler32 data checksum computed so far.
     */
    public value: number = 1;

    /**
     * Initialise a default instance of Adler32
     */
    public constructor() {
        this.reset();
    }

    /**
     * Resets the Adler32 data checksum as if no update was ever called.
     */
    public reset() {
        this.value = 1;
    }

    /**
     * Update Adler32 data checksum based on a portion of a block of data
     * @param data The array containing the data to add
     * @param offset Range start for data (inclusive)
     * @param count The number of bytes to checksum starting from offset
     */
    public update(data: Uint8Array, offset: number, count: number) {
        //(By Per Bothner)
        let s1 = this.value & 0xFFFF;
        let s2 = this.value >> 16;
        while (count > 0) {
            // We can defer the modulo operation:
            // s1 maximally grows from 65521 to 65521 + 255 * 3800
            // s2 maximally grows by 3800 * median(s1) = 2090079800 < 2^31
            let n = 3800;
            if (n > count) {
                n = count;
            }
            count -= n;
            while (--n >= 0) {
                s1 = s1 + (data[offset++] & 0xff);
                s2 = s2 + s1;
            }
            s1 %= Adler32.Base;
            s2 %= Adler32.Base;
        }
        this.value = (s2 << 16) | s1;
    }
}