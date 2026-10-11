import { FormatError } from '@coderline/alphatab/FormatError';
import type { IReadable } from '@coderline/alphatab/io/IReadable';
import { DeflateFormat } from '@coderline/alphatab/zip/DeflateFormat';

/**
 * Decompresses raw DEFLATE streams (RFC 1951) from a readable.
 *
 * Huffman codes are decoded with a single lookup table per code, indexed by the next
 * (bit-reversed) bits of the stream. Entries hold `symbol << 4 | codeLength`, a zero entry
 * marks bits no code starts with.
 *
 * Bytes are only read from the input when the current step needs them. After every step at most
 * 7 bits stay buffered, so the inflater never reads beyond the end of the compressed stream and the
 * input is positioned right after it when done.
 *
 * Invalid input is rejected like zlib does, see the rules in DeflateFormat for the integer handling.
 * @internal
 */
export class Inflater {
    private _input: IReadable;
    private _bitBuffer: number = 0;
    private _bitCount: number = 0;
    private _literals: Int32Array | null = null;
    private _distances: Int32Array | null = null;
    private _fixedLiterals: Int32Array | null = null;
    private _fixedDistances: Int32Array | null = null;

    public constructor(input: IReadable) {
        this._input = input;
    }

    private static _invalid(): FormatError {
        return new FormatError('Invalid deflate data');
    }

    /**
     * Decompresses the DEFLATE stream starting at the current position of the input.
     * @param sizeHint The expected size of the decompressed data (0 if unknown), used for the initial buffer size.
     * @param maxSize The maximum allowed size of the decompressed data.
     * @returns The decompressed data or null if it would exceed the given maximum size.
     */
    public inflate(sizeHint: number, maxSize: number): Uint8Array | null {
        this._bitBuffer = 0;
        this._bitCount = 0;

        // the hint comes from the file, so it only decides the initial size up to a sane limit
        let output: Uint8Array = new Uint8Array(Math.min(Math.min(sizeHint > 0 ? sizeHint : 65536, maxSize), 1048576));
        let pos = 0;

        const lengthTable = DeflateFormat.lengthTable;
        const distanceTable = DeflateFormat.distanceTable;

        let isFinal = 0;
        do {
            isFinal = this._readBits(1);
            const type = this._readBits(2);
            if (type === 0) {
                // stored block: the buffered bits are the rest of the current byte, skip to the byte boundary
                this._bitBuffer = 0;
                this._bitCount = 0;
                const length = this._readBits(16);
                if ((length ^ this._readBits(16)) !== 0xffff) {
                    throw Inflater._invalid();
                }
                if (pos + length > output.length) {
                    const grown = Inflater._grow(output, pos, pos + length, maxSize);
                    if (!grown) {
                        return null;
                    }
                    output = grown;
                }
                if (this._input.read(output, pos, length) !== length) {
                    throw Inflater._invalid();
                }
                pos += length;
            } else {
                if (type === 1) {
                    if (!this._fixedLiterals) {
                        const lengths = DeflateFormat.fixedCodeLengths();
                        this._fixedLiterals = Inflater._buildTable(lengths.subarray(0, 288), false);
                        this._fixedDistances = Inflater._buildTable(lengths.subarray(288, 320), false);
                    }
                    this._literals = this._fixedLiterals;
                    this._distances = this._fixedDistances;
                } else if (type === 2) {
                    this._readDynamicTables();
                } else {
                    throw Inflater._invalid();
                }

                const literals = this._literals!;
                const distances = this._distances!;
                while (true) {
                    let symbol = this._decodeSymbol(literals);
                    if (symbol < 256) {
                        if (pos === output.length) {
                            const grown = Inflater._grow(output, pos, pos + 1, maxSize);
                            if (!grown) {
                                return null;
                            }
                            output = grown;
                        }
                        output[pos++] = symbol;
                    } else if (symbol === 256) {
                        break;
                    } else {
                        symbol -= 257;
                        if (symbol >= 29) {
                            throw Inflater._invalid();
                        }
                        let entry = lengthTable[symbol];
                        const length = (entry >> 4) + this._readBits(entry & 15);

                        symbol = this._decodeSymbol(distances);
                        if (symbol >= 30) {
                            throw Inflater._invalid();
                        }
                        entry = distanceTable[symbol];
                        const distance = (entry >> 4) + this._readBits(entry & 15);
                        if (distance > pos) {
                            throw Inflater._invalid();
                        }

                        const end = pos + length;
                        if (end > output.length) {
                            const grown = Inflater._grow(output, pos, end, maxSize);
                            if (!grown) {
                                return null;
                            }
                            output = grown;
                        }
                        // byte-wise to support overlapping copies (distance < length)
                        let from = pos - distance;
                        while (pos < end) {
                            output[pos++] = output[from++];
                        }
                    }
                }
            }
        } while (isFinal === 0);

        if (pos === output.length) {
            return output;
        }
        const result = new Uint8Array(pos);
        result.set(output.subarray(0, pos), 0);
        return result;
    }

    private static _grow(output: Uint8Array, length: number, needed: number, maxSize: number): Uint8Array | null {
        if (needed > maxSize) {
            return null;
        }
        const grown = new Uint8Array(Math.min(Math.max(output.length * 2, needed), maxSize));
        grown.set(output.subarray(0, length), 0);
        return grown;
    }

    /**
     * Reads the code length code and the literal/length and distance code lengths of a dynamic block (RFC 1951 3.2.7).
     */
    private _readDynamicTables() {
        const literalCount = this._readBits(5) + 257;
        const distanceCount = this._readBits(5) + 1;
        const codeLengthCount = this._readBits(4) + 4;
        if (literalCount > 286 || distanceCount > 30) {
            throw Inflater._invalid();
        }

        const order = DeflateFormat.codeLengthOrder;
        const codeLengths = new Uint8Array(19);
        for (let k = 0; k < codeLengthCount; k++) {
            codeLengths[order[k]] = this._readBits(3);
        }
        const codeLengthTable = Inflater._buildTable(codeLengths, true);

        // literal/length and distance code lengths form one sequence, repeats may cross from one into the other
        const total = literalCount + distanceCount;
        const lengths = new Uint8Array(total);
        let i = 0;
        while (i < total) {
            const symbol = this._decodeSymbol(codeLengthTable);
            if (symbol < 16) {
                lengths[i++] = symbol;
            } else {
                let value = 0;
                let repeat = 0;
                if (symbol === 16) {
                    if (i === 0) {
                        throw Inflater._invalid();
                    }
                    value = lengths[i - 1];
                    repeat = 3 + this._readBits(2);
                } else if (symbol === 17) {
                    repeat = 3 + this._readBits(3);
                } else {
                    repeat = 11 + this._readBits(7);
                }
                const end = i + repeat;
                if (end > total) {
                    throw Inflater._invalid();
                }
                while (i < end) {
                    lengths[i++] = value;
                }
            }
        }

        // a block without end-of-block code cannot be terminated
        if (lengths[256] === 0) {
            throw Inflater._invalid();
        }

        this._literals = Inflater._buildTable(lengths.subarray(0, literalCount), false);
        this._distances = Inflater._buildTable(lengths.subarray(literalCount, total), false);
    }

    /**
     * Builds the decoding table for a Huffman code given by its code lengths.
     * Like zlib, incomplete codes are only accepted if they consist of a single code of length 1
     * (or no code at all), and never for the code length code.
     */
    private static _buildTable(lengths: Uint8Array, isCodeLengthCode: boolean): Int32Array {
        const count = lengths.length;
        const codes = new Int32Array(count);
        const left = DeflateFormat.canonicalCodes(lengths, codes);
        let maxLength = 0;
        for (let i = 0; i < count; i++) {
            if (lengths[i] > maxLength) {
                maxLength = lengths[i];
            }
        }
        if (left < 0 || (left > 0 && (isCodeLengthCode || maxLength > 1))) {
            throw Inflater._invalid();
        }

        const size = 1 << maxLength;
        const table = new Int32Array(size);
        for (let symbol = 0; symbol < count; symbol++) {
            const length = lengths[symbol];
            if (length !== 0) {
                // every index starting with the code decodes to the symbol
                const entry = (symbol << 4) | length;
                const step = 1 << length;
                for (let i = codes[symbol]; i < size; i += step) {
                    table[i] = entry;
                }
            }
        }
        return table;
    }

    private _decodeSymbol(table: Int32Array): number {
        while (true) {
            // bits not read yet are zero, the entry is reliable once its code length is covered by read bits
            const entry = table[this._bitBuffer & (table.length - 1)];
            const length = entry & 15;
            if (length !== 0 && length <= this._bitCount) {
                this._bitBuffer = this._bitBuffer >> length;
                this._bitCount -= length;
                return entry >> 4;
            }
            if (length === 0 && 1 << this._bitCount >= table.length) {
                throw Inflater._invalid();
            }
            this._readByte();
        }
    }

    private _readBits(count: number): number {
        while (this._bitCount < count) {
            this._readByte();
        }
        const value = this._bitBuffer & ((1 << count) - 1);
        this._bitBuffer = this._bitBuffer >> count;
        this._bitCount -= count;
        return value;
    }

    private _readByte() {
        const b = this._input.readByte();
        if (b < 0) {
            throw Inflater._invalid();
        }
        this._bitBuffer = this._bitBuffer | (b << this._bitCount);
        this._bitCount += 8;
    }
}
