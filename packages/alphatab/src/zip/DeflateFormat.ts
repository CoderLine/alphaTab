/**
 * The parts of the DEFLATE format (RFC 1951) shared by Inflater and Deflater:
 * the length and distance code tables, the code length alphabet order, the fixed Huffman code
 * and the canonical Huffman code assignment.
 *
 * alphaTab is transpiled to C# and Kotlin where `number` becomes a `double` and every bit operation
 * converts its operands to a 32-bit integer. To produce identical results on all platforms, the
 * DEFLATE code follows these rules:
 * - values taking part in bit operations stay within [0, 2^31) (CRC-32 uses signed values instead),
 * - no `>>>` (it becomes a signed shift), use `(x >> n) & mask` where needed,
 * - bit buffers hold less than 24 bits and never get negative values OR'ed in,
 * - no compound bit assignments (`x >>= n`): the C# output does not convert a variable right side,
 * - no local names reused in nested scopes (not allowed in C#),
 * - typed arrays only receive in-range values (bytes are masked, tables are `Int32Array`),
 * - integer division only through shifts,
 * - no reads past the end of an array, `subarray` ends are clamped by the caller.
 *
 * @internal
 */
export class DeflateFormat {
    /**
     * The base value and number of extra bits per length code (symbols 257-285),
     * packed as `base << 4 | extraBits`.
     */
    public static readonly lengthTable: Int32Array = DeflateFormat._buildTable(29, 2, 3);

    /**
     * The base value and number of extra bits per distance code (symbols 0-29),
     * packed as `base << 4 | extraBits`.
     */
    public static readonly distanceTable: Int32Array = DeflateFormat._buildTable(30, 1, 1);

    /**
     * The order in which the code lengths of the code length alphabet are stored (RFC 1951 3.2.7).
     */
    public static readonly codeLengthOrder: Uint8Array = new Uint8Array([
        16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15
    ]);

    /**
     * RFC 1951 3.2.5: the codes come in groups of `1 << groupShift` codes sharing the same number
     * of extra bits, starting with zero extra bits for the first two groups.
     * Each code covers `1 << extraBits` values following the previous one.
     */
    private static _buildTable(count: number, groupShift: number, firstBase: number): Int32Array {
        const table = new Int32Array(count);
        let base = firstBase;
        for (let i = 0; i < count; i++) {
            const extraBits = Math.max(0, (i >> groupShift) - 1);
            table[i] = (base << 4) | extraBits;
            base += 1 << extraBits;
        }
        if (count === 29) {
            // the last length code is the special case 258 without extra bits
            table[28] = 258 << 4;
        }
        return table;
    }

    /**
     * Creates the code lengths of the fixed Huffman code (RFC 1951 3.2.6):
     * 288 literal/length codes followed by 32 distance codes.
     */
    public static fixedCodeLengths(): Uint8Array {
        const lengths = new Uint8Array(320);
        for (let i = 0; i < 320; i++) {
            lengths[i] = i < 144 ? 8 : i < 256 ? 9 : i < 280 ? 7 : i < 288 ? 8 : 5;
        }
        return lengths;
    }

    /**
     * Assigns the canonical Huffman codes for the given code lengths (RFC 1951 3.2.2) and stores
     * them bit-reversed, the order in which they are sent in the LSB-first bit stream.
     * @param lengths The code length per symbol (0 = unused symbol, max 15).
     * @param codes Receives the bit-reversed code per symbol.
     * @returns The unused code space in units of 2^-15: 0 for a complete code, a positive value for
     * an incomplete code and a negative value for an over-subscribed (invalid) code.
     */
    public static canonicalCodes(lengths: Uint8Array, codes: Int32Array): number {
        const count = lengths.length;
        const lengthCounts = new Int32Array(16);
        for (let i = 0; i < count; i++) {
            lengthCounts[lengths[i]]++;
        }

        const nextCode = new Int32Array(16);
        let code = 0;
        let left = 1 << 15;
        for (let length = 1; length < 16; length++) {
            code = (code + (length > 1 ? lengthCounts[length - 1] : 0)) << 1;
            nextCode[length] = code;
            left -= lengthCounts[length] << (15 - length);
        }

        for (let i = 0; i < count; i++) {
            const length = lengths[i];
            if (length !== 0) {
                let c = nextCode[length];
                nextCode[length] = c + 1;
                let reversed = 0;
                for (let k = 0; k < length; k++) {
                    reversed = (reversed << 1) | (c & 1);
                    c = c >> 1;
                }
                codes[i] = reversed;
            }
        }
        return left;
    }
}
