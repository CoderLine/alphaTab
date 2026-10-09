import { FormatError } from '@coderline/alphatab/FormatError';
import { VorbisBitReader } from '@coderline/alphatab/synth/vorbis/VorbisBitReader';

/**
 * A Vorbis codebook (Vorbis I specification, section 3): a Huffman code for the entries and
 * optionally a vector of values per entry (VQ lookup).
 *
 * Codewords are assigned in entry order, each one gets the lowest free codeword of its length.
 * They are kept in a binary tree, two child links per node: `> 0` a node, `< 0` the leaf `~entry`, `0` a free slot.
 * Every node knows the shallowest depth of a free slot below it, so an assignment follows a single path.
 *
 * Decoding looks up the next {@link _tableBits} bits in a table holding `entry << 5 | length` for
 * shorter codewords and `~node` to continue in the tree for longer ones. `0` marks bits no codeword starts with.
 * @internal
 */
export class VorbisCodebook {
    private static readonly _maxTableBits = 10;
    private static readonly _noFreeSlot = 255;

    public readonly dimensions: number;
    public readonly entries: number;
    /**
     * The vector values per entry (`entries * dimensions`), or null if the codebook has no VQ lookup.
     */
    public readonly values: Float32Array | null = null;

    private _table: Int32Array;
    private _tableBits: number;
    private _tree: Int32Array;

    public static invalid(): FormatError {
        return new FormatError('Invalid Vorbis stream');
    }

    public constructor(r: VorbisBitReader) {
        if (r.read(24) !== 0x564342) {
            throw VorbisCodebook.invalid();
        }
        const dimensions = r.read(16);
        const entries = r.read(24);
        if (VorbisBitReader.ilog(dimensions) + VorbisBitReader.ilog(entries) > 24) {
            throw VorbisCodebook.invalid();
        }
        this.dimensions = dimensions;
        this.entries = entries;

        // codeword lengths, 0 = unused entry
        const lengths = new Uint8Array(entries);
        let used = 0;
        let maxLength = 0;
        if (r.read(1) === 1) {
            let length = r.read(5) + 1;
            while (used < entries) {
                const count = r.read(VorbisBitReader.ilog(entries - used));
                if (length > 32 || used + count > entries) {
                    throw VorbisCodebook.invalid();
                }
                for (let i = 0; i < count; i++) {
                    lengths[used + i] = length;
                }
                if (count > 0) {
                    used += count;
                    maxLength = length;
                }
                length++;
            }
        } else {
            const sparse = r.read(1);
            if (r.remaining < entries * (sparse === 1 ? 1 : 5)) {
                throw VorbisCodebook.invalid();
            }
            for (let i = 0; i < entries; i++) {
                if (sparse === 0 || r.read(1) === 1) {
                    const length = r.read(5) + 1;
                    lengths[i] = length;
                    maxLength = Math.max(maxLength, length);
                    used++;
                }
            }
        }

        if (used < 2) {
            // a single used entry has a 1 bit codeword, both bit values decode to it (errata 20150226),
            // without any used entry every decode fails
            let entry = 0;
            while (entry < entries && lengths[entry] === 0) {
                entry++;
            }
            if (used === 1 && maxLength !== 1) {
                throw VorbisCodebook.invalid();
            }
            this._tableBits = used;
            this._table = new Int32Array(used + 1);
            this._table[0] = used === 1 ? (entry << 5) | 1 : 0;
            this._table[used] = this._table[0];
            this._tree = new Int32Array(0);
        } else {
            this._tableBits = Math.min(maxLength, VorbisCodebook._maxTableBits);
            this._table = new Int32Array(1 << this._tableBits);
            this._tree = new Int32Array(2 * used);
            this._assignCodewords(lengths, used);
        }

        const lookupType = r.read(4);
        if (lookupType > 2 || (lookupType > 0 && dimensions === 0)) {
            throw VorbisCodebook.invalid();
        }
        if (lookupType > 0) {
            const minimum = VorbisCodebook._readFloat(r);
            const delta = VorbisCodebook._readFloat(r);
            const valueBits = r.read(4) + 1;
            const sequence = r.read(1) === 1;
            const lookupValues =
                lookupType === 1 ? VorbisCodebook._lookup1Values(entries, dimensions) : entries * dimensions;
            if (lookupValues * valueBits > r.remaining) {
                throw VorbisCodebook.invalid();
            }
            const multiplicands = new Int32Array(lookupValues);
            for (let i = 0; i < lookupValues; i++) {
                multiplicands[i] = r.read(valueBits);
            }

            const values = new Float32Array(entries * dimensions);
            for (let entry = 0; entry < entries; entry++) {
                let last = 0;
                let divisor = 1;
                for (let d = 0; d < dimensions; d++) {
                    const offset = entry * dimensions + d;
                    const index = lookupType === 1 ? Math.floor(entry / divisor) % lookupValues : offset;
                    values[offset] = multiplicands[index] * delta + minimum + last;
                    if (sequence) {
                        last = values[offset];
                    }
                    divisor *= lookupValues;
                }
            }
            this.values = values;
        }
    }

    private _assignCodewords(lengths: Uint8Array, used: number) {
        const noFreeSlot = VorbisCodebook._noFreeSlot;
        const tree = this._tree;
        const table = this._table;
        const tableBits = this._tableBits;
        // shallowest depth of a free slot below each node
        const free = new Uint8Array(used);
        const path = new Int32Array(33);
        free[0] = 1;
        let nodes = 1;

        for (let entry = 0; entry < lengths.length; entry++) {
            const length = lengths[entry];
            if (length === 0) {
                continue;
            }

            // descend towards the leftmost free slot at depth `length`
            let node = 0;
            let depth = 0;
            let index = 0;
            while (true) {
                path[depth] = node;
                let side = 0;
                if (VorbisCodebook._freeDepth(tree, free, node, 0, depth) > length) {
                    side = 1;
                    if (VorbisCodebook._freeDepth(tree, free, node, 1, depth) > length) {
                        // over-subscribed code
                        throw VorbisCodebook.invalid();
                    }
                }
                const slot = 2 * node + side;
                if (depth < tableBits) {
                    index = index | (side << depth);
                }
                depth++;
                if (depth === length) {
                    tree[slot] = ~entry;
                    break;
                }

                let child = tree[slot];
                if (child === 0) {
                    // a complete code has `used - 1` nodes
                    if (nodes === used) {
                        throw VorbisCodebook.invalid();
                    }
                    child = nodes++;
                    tree[slot] = child;
                    free[child] = depth + 1;
                    if (depth === tableBits) {
                        table[index] = ~child;
                    }
                }
                node = child;
            }

            if (length <= tableBits) {
                for (let i = index; i < table.length; i += 1 << length) {
                    table[i] = (entry << 5) | length;
                }
            }

            for (let d = depth - 1; d >= 0; d--) {
                const n = path[d];
                free[n] = Math.min(
                    VorbisCodebook._freeDepth(tree, free, n, 0, d),
                    VorbisCodebook._freeDepth(tree, free, n, 1, d)
                );
            }
        }

        // under-populated code
        if (free[0] !== noFreeSlot) {
            throw VorbisCodebook.invalid();
        }
    }

    private static _freeDepth(tree: Int32Array, free: Uint8Array, node: number, side: number, depth: number): number {
        const child = tree[2 * node + side];
        return child === 0 ? depth + 1 : child < 0 ? VorbisCodebook._noFreeSlot : free[child];
    }

    /**
     * Reads the next entry number (scalar context).
     * @returns The entry or -1 if the packet ended or the bits match no codeword.
     */
    public decode(r: VorbisBitReader): number {
        const bits = this._tableBits;
        const value = this._table[r.peek(bits)];
        if (value > 0) {
            r.skip(value & 31);
            return r.overrun ? -1 : value >> 5;
        }
        if (value === 0) {
            return -1;
        }
        r.skip(bits);
        const tree = this._tree;
        let node = ~value;
        while (true) {
            const child = tree[2 * node + r.read(1)];
            if (child < 0) {
                return r.overrun ? -1 : ~child;
            }
            if (child === 0) {
                return -1;
            }
            node = child;
        }
    }

    /**
     * Unpacks a codebook float: 21 bits mantissa, 10 bits exponent, 1 bit sign (Vorbis I specification, section 9.2.2).
     */
    private static _readFloat(r: VorbisBitReader): number {
        const mantissa = r.read(21);
        const exponent = r.read(10);
        const value = mantissa * Math.pow(2, exponent - 788);
        return r.read(1) === 1 ? -value : value;
    }

    /**
     * The greatest value whose `dimensions`-th power is not greater than `entries` (Vorbis I specification, section 9.2.3).
     */
    private static _lookup1Values(entries: number, dimensions: number): number {
        let value = Math.floor(Math.exp(Math.log(entries) / dimensions));
        while (VorbisCodebook._power(value + 1, dimensions) <= entries) {
            value++;
        }
        while (value > 0 && VorbisCodebook._power(value, dimensions) > entries) {
            value--;
        }
        return value;
    }

    private static _power(base: number, exponent: number): number {
        let result = 1;
        // entries are below 2^24, stop once above
        for (let i = 0; i < exponent && result <= 16777216; i++) {
            result *= base;
        }
        return result;
    }
}
