import { DeflateFormat } from '@coderline/alphatab/zip/DeflateFormat';

/**
 * Compresses data into a raw DEFLATE stream (RFC 1951).
 *
 * LZ77 matches are found with hash chains and one step of lazy evaluation (RFC 1951 section 4),
 * using the search limits of zlib's default compression level.
 * Every block is written as stored, fixed or dynamic Huffman block, whichever is smallest.
 * Dynamic blocks use length-limited Huffman codes: optimal code lengths are computed with the
 * in-place algorithm of Moffat and Katajainen, over-long codes are then limited by rebalancing
 * the code space.
 *
 * See the rules in DeflateFormat for the integer handling.
 * @internal
 */
export class Deflater {
    private static readonly _maxSymbols = 16384;

    // hash chains over 3-byte sequences, head and prev hold position + 1 (0 ends a chain)
    private _head = new Int32Array(32768);
    private _prev = new Int32Array(32768);

    // the LZ77 symbols of the current block: literal byte or match length, and the match distance (0 for literals)
    private _symbols = new Int32Array(Deflater._maxSymbols);
    private _distances = new Int32Array(Deflater._maxSymbols);
    private _symbolCount = 0;
    private _literalFrequencies = new Int32Array(286);
    private _distanceFrequencies = new Int32Array(30);

    // the dynamic codes of the current block
    private _literalLengths = new Uint8Array(286);
    private _literalCodes = new Int32Array(286);
    private _distanceLengths = new Uint8Array(30);
    private _distanceCodes = new Int32Array(30);
    private _codeLengthLengths = new Uint8Array(19);
    private _codeLengthCodes = new Int32Array(19);
    private _codeLengthFrequencies = new Int32Array(19);
    private _allLengths = new Uint8Array(316);
    // the run-length encoded code lengths, packed as symbol | repeatExtraBits << 5
    private _codeLengthTokens = new Int32Array(316);

    private _fixedLiteralLengths: Uint8Array;
    private _fixedLiteralCodes = new Int32Array(288);
    private _fixedDistanceLengths: Uint8Array;
    private _fixedDistanceCodes = new Int32Array(32);

    // length (3-258) to length code, and (distance - 1) to distance code (see _distanceCode)
    private _lengthCodes = new Uint8Array(259);
    private _distanceCodeLookup = new Uint8Array(512);

    private _output = new Uint8Array(0);
    private _outputPos = 0;
    private _bitBuffer = 0;
    private _bitCount = 0;

    public constructor() {
        const fixed = DeflateFormat.fixedCodeLengths();
        this._fixedLiteralLengths = fixed.subarray(0, 288);
        this._fixedDistanceLengths = fixed.subarray(288, 320);
        DeflateFormat.canonicalCodes(this._fixedLiteralLengths, this._fixedLiteralCodes);
        DeflateFormat.canonicalCodes(this._fixedDistanceLengths, this._fixedDistanceCodes);

        const lengthTable = DeflateFormat.lengthTable;
        for (let code = 0; code < 29; code++) {
            const base = lengthTable[code] >> 4;
            const count = 1 << (lengthTable[code] & 15);
            for (let i = 0; i < count; i++) {
                this._lengthCodes[base + i] = code;
            }
        }

        const distanceTable = DeflateFormat.distanceTable;
        for (let code = 0; code < 30; code++) {
            const base = (distanceTable[code] >> 4) - 1;
            const count = 1 << (distanceTable[code] & 15);
            for (let i = 0; i < count; i++) {
                const d = base + i;
                this._distanceCodeLookup[d < 256 ? d : 256 + (d >> 7)] = code;
            }
        }
    }

    /**
     * Compresses the given data into a raw DEFLATE stream.
     * @param data The data to compress.
     * @returns The compressed data.
     */
    public deflate(data: Uint8Array): Uint8Array {
        const n = data.length;
        this._output = new Uint8Array((n >> 2) + 256);
        this._outputPos = 0;
        this._bitBuffer = 0;
        this._bitCount = 0;
        this._head.fill(0);
        this._symbolCount = 0;
        this._literalFrequencies.fill(0);
        this._distanceFrequencies.fill(0);

        // the block covers the input from blockStart up to consumed (the bytes covered by its symbols)
        let blockStart = 0;
        let consumed = 0;

        // lazy evaluation: the byte before pos is pending, either as literal or as start of the match prevLength/prevDistance
        let hasPending = false;
        let prevLength = 0;
        let prevDistance = 0;

        let pos = 0;
        while (pos < n) {
            let match = 0;
            if (n - pos >= 3) {
                const candidate = this._insert(data, pos);
                // a long enough pending match is taken without looking for a better one
                if (candidate >= 0 && prevLength < 16) {
                    match = this._findMatch(data, pos, candidate, prevLength);
                }
            }

            if (prevLength >= 3 && match === 0) {
                // the pending match is at least as good as the one starting here
                this._tallyMatch(prevLength, prevDistance);
                consumed = pos - 1 + prevLength;
                for (let p = pos + 1; p < consumed; p++) {
                    if (n - p >= 3) {
                        this._insert(data, p);
                    }
                }
                pos = consumed;
                hasPending = false;
                prevLength = 0;
            } else {
                if (hasPending) {
                    this._tallyLiteral(data[pos - 1]);
                    consumed = pos;
                }
                hasPending = true;
                prevLength = match & 511;
                prevDistance = match >> 9;
                pos++;
            }

            // a block never covers more than 65535 bytes, so it always fits a single stored block
            if (this._symbolCount === Deflater._maxSymbols || consumed - blockStart > 65535 - 258) {
                this._writeBlock(data, blockStart, consumed, 0);
                blockStart = consumed;
            }
        }
        if (hasPending) {
            this._tallyLiteral(data[pos - 1]);
            consumed = pos;
        }
        this._writeBlock(data, blockStart, consumed, 1);

        if (this._bitCount > 0) {
            this._output[this._outputPos++] = this._bitBuffer & 0xff;
        }

        const result = new Uint8Array(this._outputPos);
        result.set(this._output.subarray(0, this._outputPos), 0);
        this._output = new Uint8Array(0);
        return result;
    }

    /**
     * Inserts the 3-byte sequence at pos into the hash chains.
     * @returns The previous position with the same hash or -1.
     */
    private _insert(data: Uint8Array, pos: number): number {
        const hash = ((data[pos] << 10) ^ (data[pos + 1] << 5) ^ data[pos + 2]) & 32767;
        const candidate = this._head[hash];
        this._prev[pos & 32767] = candidate;
        this._head[hash] = pos + 1;
        return candidate - 1;
    }

    /**
     * Searches the hash chain for the longest match at pos which is longer than the pending match.
     * @returns The match as `distance << 9 | length` or 0 if there is none.
     */
    private _findMatch(data: Uint8Array, pos: number, candidate: number, prevLength: number): number {
        const maxLength = Math.min(258, data.length - pos);
        let best = prevLength >= 3 ? prevLength : 2;
        if (best >= maxLength) {
            return 0;
        }
        const nice = Math.min(128, maxLength);
        // positions in the window are newer than pos - 32768: the prev slot of pos - 32768 was just reused for pos
        const limit = Math.max(pos - 32768, -1);
        let chain = prevLength >= 8 ? 32 : 128;
        let bestDistance = 0;
        let c = candidate;
        while (c > limit && chain > 0) {
            chain--;
            if (data[c + best] === data[pos + best] && data[c] === data[pos] && data[c + 1] === data[pos + 1]) {
                let length = 2;
                while (length < maxLength && data[c + length] === data[pos + length]) {
                    length++;
                }
                if (length > best) {
                    best = length;
                    bestDistance = pos - c;
                    if (length >= nice) {
                        break;
                    }
                }
            }
            const next = this._prev[c & 32767] - 1;
            if (next >= c) {
                break;
            }
            c = next;
        }
        // short matches far away cost more than the literals
        if (bestDistance === 0 || (best === 3 && bestDistance > 4096)) {
            return 0;
        }
        return (bestDistance << 9) | best;
    }

    private _tallyLiteral(literal: number) {
        const i = this._symbolCount++;
        this._symbols[i] = literal;
        this._distances[i] = 0;
        this._literalFrequencies[literal]++;
    }

    private _tallyMatch(length: number, distance: number) {
        const i = this._symbolCount++;
        this._symbols[i] = length;
        this._distances[i] = distance;
        this._literalFrequencies[257 + this._lengthCodes[length]]++;
        this._distanceFrequencies[this._distanceCode(distance)]++;
    }

    private _distanceCode(distance: number): number {
        const d = distance - 1;
        return this._distanceCodeLookup[d < 256 ? d : 256 + (d >> 7)];
    }

    /**
     * Writes the tallied symbols covering data[start..end) as the smallest of a stored, fixed or dynamic block.
     */
    private _writeBlock(data: Uint8Array, start: number, end: number, isFinal: number) {
        const literalFrequencies = this._literalFrequencies;
        const distanceFrequencies = this._distanceFrequencies;
        const literalLengths = this._literalLengths;
        const distanceLengths = this._distanceLengths;
        const codeLengthLengths = this._codeLengthLengths;
        const lengthTable = DeflateFormat.lengthTable;
        const distanceTable = DeflateFormat.distanceTable;
        const order = DeflateFormat.codeLengthOrder;

        literalFrequencies[256] = 1;
        Deflater.buildCodeLengths(literalFrequencies, literalLengths, 15);
        Deflater.buildCodeLengths(distanceFrequencies, distanceLengths, 15);

        let literalCount = 286;
        while (literalCount > 257 && literalLengths[literalCount - 1] === 0) {
            literalCount--;
        }
        let distanceCount = 30;
        while (distanceCount > 1 && distanceLengths[distanceCount - 1] === 0) {
            distanceCount--;
        }
        const tokenCount = this._encodeCodeLengths(literalCount, distanceCount);
        Deflater.buildCodeLengths(this._codeLengthFrequencies, codeLengthLengths, 7);
        let codeLengthCount = 19;
        while (codeLengthCount > 4 && codeLengthLengths[order[codeLengthCount - 1]] === 0) {
            codeLengthCount--;
        }

        // exact sizes in bits
        let extraBits = 0;
        let dynamicBits = 17 + 3 * codeLengthCount;
        let fixedBits = 3;
        for (let i = 0; i < 286; i++) {
            const f = literalFrequencies[i];
            dynamicBits += f * literalLengths[i];
            fixedBits += f * this._fixedLiteralLengths[i];
            if (i > 256) {
                extraBits += f * (lengthTable[i - 257] & 15);
            }
        }
        for (let i = 0; i < 30; i++) {
            const f = distanceFrequencies[i];
            dynamicBits += f * distanceLengths[i];
            fixedBits += f * 5;
            extraBits += f * (distanceTable[i] & 15);
        }
        for (let i = 0; i < tokenCount; i++) {
            const symbol = this._codeLengthTokens[i] & 31;
            dynamicBits += codeLengthLengths[symbol] + Deflater._repeatBits(symbol);
        }
        dynamicBits += extraBits;
        fixedBits += extraBits;
        const storedBits = 3 + ((8 - ((this._bitCount + 3) & 7)) & 7) + 32 + (end - start) * 8;

        if (storedBits <= fixedBits && storedBits <= dynamicBits) {
            this._ensureCapacity((storedBits >> 3) + 8);
            this._writeBits(isFinal, 3);
            if (this._bitCount > 0) {
                this._output[this._outputPos++] = this._bitBuffer & 0xff;
            }
            this._bitBuffer = 0;
            this._bitCount = 0;
            const length = end - start;
            const nlength = ~length & 0xffff;
            const output = this._output;
            output[this._outputPos++] = length & 0xff;
            output[this._outputPos++] = length >> 8;
            output[this._outputPos++] = nlength & 0xff;
            output[this._outputPos++] = nlength >> 8;
            output.set(data.subarray(start, end), this._outputPos);
            this._outputPos += length;
        } else if (fixedBits <= dynamicBits) {
            this._ensureCapacity((fixedBits >> 3) + 8);
            this._writeBits(isFinal | 2, 3);
            this._writeSymbols(
                this._fixedLiteralLengths,
                this._fixedLiteralCodes,
                this._fixedDistanceLengths,
                this._fixedDistanceCodes
            );
        } else {
            this._ensureCapacity((dynamicBits >> 3) + 8);
            const codeLengthCodes = this._codeLengthCodes;
            DeflateFormat.canonicalCodes(literalLengths, this._literalCodes);
            DeflateFormat.canonicalCodes(distanceLengths, this._distanceCodes);
            DeflateFormat.canonicalCodes(codeLengthLengths, codeLengthCodes);

            this._writeBits(isFinal | 4, 3);
            this._writeBits(literalCount - 257, 5);
            this._writeBits(distanceCount - 1, 5);
            this._writeBits(codeLengthCount - 4, 4);
            for (let i = 0; i < codeLengthCount; i++) {
                this._writeBits(codeLengthLengths[order[i]], 3);
            }
            for (let i = 0; i < tokenCount; i++) {
                const token = this._codeLengthTokens[i];
                const symbol = token & 31;
                this._writeBits(codeLengthCodes[symbol], codeLengthLengths[symbol]);
                this._writeBits(token >> 5, Deflater._repeatBits(symbol));
            }
            this._writeSymbols(literalLengths, this._literalCodes, distanceLengths, this._distanceCodes);
        }

        this._symbolCount = 0;
        literalFrequencies.fill(0);
        distanceFrequencies.fill(0);
    }

    private static _repeatBits(codeLengthSymbol: number): number {
        return codeLengthSymbol === 16 ? 2 : codeLengthSymbol === 17 ? 3 : codeLengthSymbol === 18 ? 7 : 0;
    }

    private _writeSymbols(
        literalLengths: Uint8Array,
        literalCodes: Int32Array,
        distanceLengths: Uint8Array,
        distanceCodes: Int32Array
    ) {
        const lengthTable = DeflateFormat.lengthTable;
        const distanceTable = DeflateFormat.distanceTable;
        const count = this._symbolCount;
        for (let i = 0; i < count; i++) {
            const symbol = this._symbols[i];
            const distance = this._distances[i];
            if (distance === 0) {
                this._writeBits(literalCodes[symbol], literalLengths[symbol]);
            } else {
                const lengthCode = this._lengthCodes[symbol];
                this._writeBits(literalCodes[257 + lengthCode], literalLengths[257 + lengthCode]);
                let entry = lengthTable[lengthCode];
                this._writeBits(symbol - (entry >> 4), entry & 15);

                const distanceCode = this._distanceCode(distance);
                this._writeBits(distanceCodes[distanceCode], distanceLengths[distanceCode]);
                entry = distanceTable[distanceCode];
                this._writeBits(distance - (entry >> 4), entry & 15);
            }
        }
        this._writeBits(literalCodes[256], literalLengths[256]);
    }

    /**
     * Run-length encodes the literal/length and distance code lengths as one sequence (RFC 1951 3.2.7)
     * into the code length tokens and counts the code length symbol frequencies.
     * @returns The number of tokens.
     */
    private _encodeCodeLengths(literalCount: number, distanceCount: number): number {
        const lengths = this._allLengths;
        lengths.set(this._literalLengths.subarray(0, literalCount), 0);
        lengths.set(this._distanceLengths.subarray(0, distanceCount), literalCount);
        const total = literalCount + distanceCount;
        const tokens = this._codeLengthTokens;
        const frequencies = this._codeLengthFrequencies;
        frequencies.fill(0);

        let count = 0;
        let i = 0;
        while (i < total) {
            const value = lengths[i];
            let run = 1;
            while (i + run < total && lengths[i + run] === value) {
                run++;
            }
            i += run;

            if (value === 0) {
                // 18: 11-138 zeros, 17: 3-10 zeros
                while (run >= 11) {
                    const r = Math.min(run, 138);
                    tokens[count++] = 18 | ((r - 11) << 5);
                    frequencies[18]++;
                    run -= r;
                }
                if (run >= 3) {
                    tokens[count++] = 17 | ((run - 3) << 5);
                    frequencies[17]++;
                    run = 0;
                }
            } else {
                // 16: repeat the previous length 3-6 times
                tokens[count++] = value;
                frequencies[value]++;
                run--;
                while (run >= 3) {
                    const r = Math.min(run, 6);
                    tokens[count++] = 16 | ((r - 3) << 5);
                    frequencies[16]++;
                    run -= r;
                }
            }
            while (run > 0) {
                tokens[count++] = value;
                frequencies[value]++;
                run--;
            }
        }
        return count;
    }

    /**
     * Computes length-limited Huffman code lengths for the given symbol frequencies (at most 2^22 per symbol).
     * At least two symbols get a code, the resulting code is always complete.
     * @param frequencies The frequency per symbol.
     * @param lengths Receives the code length per symbol (0 for unused symbols).
     * @param limit The maximum code length.
     */
    public static buildCodeLengths(frequencies: Int32Array, lengths: Uint8Array, limit: number) {
        const symbolCount = frequencies.length;
        lengths.fill(0);

        // used symbols sorted by frequency, the symbol makes the order total (same result on all platforms)
        const keys = new Int32Array(symbolCount);
        let n = 0;
        for (let s = 0; s < symbolCount; s++) {
            if (frequencies[s] > 0) {
                keys[n++] = frequencies[s] * 512 + s;
            }
        }
        // like zlib, use at least two codes: a single symbol would need a code of zero bits
        for (let s = 0; n < 2; s++) {
            if (frequencies[s] === 0) {
                keys[n++] = 512 + s;
            }
        }
        // insertion sort, there are at most 286 symbols
        for (let i = 1; i < n; i++) {
            const key = keys[i];
            let j = i - 1;
            while (j >= 0 && keys[j] > key) {
                keys[j + 1] = keys[j];
                j--;
            }
            keys[j + 1] = key;
        }

        // Moffat and Katajainen: in-place calculation of minimum-redundancy codes
        const a = new Int32Array(n);
        for (let i = 0; i < n; i++) {
            a[i] = keys[i] >> 9;
        }
        // phase 1: weights of the internal nodes, which are replaced by their parent index once used
        a[0] += a[1];
        let root = 0;
        let leaf = 2;
        for (let node = 1; node < n - 1; node++) {
            if (leaf >= n || a[root] < a[leaf]) {
                a[node] = a[root];
                a[root++] = node;
            } else {
                a[node] = a[leaf++];
            }
            if (leaf >= n || (root < node && a[root] < a[leaf])) {
                a[node] += a[root];
                a[root++] = node;
            } else {
                a[node] += a[leaf++];
            }
        }
        // phase 2: depth of the internal nodes
        a[n - 2] = 0;
        for (let node = n - 3; node >= 0; node--) {
            a[node] = a[a[node]] + 1;
        }
        // phase 3: depth of the leaves
        let available = 1;
        let used = 0;
        let depth = 0;
        root = n - 2;
        let next = n - 1;
        while (available > 0) {
            while (root >= 0 && a[root] === depth) {
                used++;
                root--;
            }
            while (available > used) {
                a[next--] = depth;
                available--;
            }
            available = 2 * used;
            depth++;
            used = 0;
        }

        // count the codes per length, limiting over-long codes
        const counts = new Int32Array(limit + 1);
        let overflow = false;
        for (let i = 0; i < n; i++) {
            if (a[i] > limit) {
                counts[limit]++;
                overflow = true;
            } else {
                counts[a[i]]++;
            }
        }
        if (overflow) {
            // the clamped code is over-subscribed: until the code space (Kraft sum) fits exactly, replace a leaf at the
            // limit and the deepest shorter leaf by two leaves one level below that leaf
            let kraft = 0;
            for (let l = 1; l <= limit; l++) {
                kraft += counts[l] << (limit - l);
            }
            while (kraft > 1 << limit) {
                counts[limit]--;
                for (let l = limit - 1; l > 0; l--) {
                    if (counts[l] > 0) {
                        counts[l]--;
                        counts[l + 1] += 2;
                        break;
                    }
                }
                kraft--;
            }
        }

        // the longest codes go to the least frequent symbols
        let k = 0;
        for (let l = limit; l > 0; l--) {
            for (let c = counts[l]; c > 0; c--) {
                lengths[keys[k++] & 511] = l;
            }
        }
    }

    private _ensureCapacity(bytes: number) {
        const needed = this._outputPos + bytes;
        if (needed > this._output.length) {
            const grown = new Uint8Array(Math.max(this._output.length * 2, needed));
            grown.set(this._output.subarray(0, this._outputPos), 0);
            this._output = grown;
        }
    }

    private _writeBits(value: number, count: number) {
        this._bitBuffer = this._bitBuffer | (value << this._bitCount);
        this._bitCount += count;
        while (this._bitCount >= 8) {
            this._output[this._outputPos++] = this._bitBuffer & 0xff;
            this._bitBuffer = this._bitBuffer >> 8;
            this._bitCount -= 8;
        }
    }
}
