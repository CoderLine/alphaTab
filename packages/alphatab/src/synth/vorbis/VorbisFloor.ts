import { VorbisBitReader } from '@coderline/alphatab/synth/vorbis/VorbisBitReader';
import { VorbisCodebook } from '@coderline/alphatab/synth/vorbis/VorbisCodebook';

/**
 * A floor of type 1 (Vorbis I specification, section 7): a piecewise linear spectral envelope.
 * Floor type 0 is not supported, no encoder uses it since 2002.
 * @internal
 */
export class VorbisFloor {
    private static readonly _ranges = [256, 128, 86, 64];

    /**
     * The floor values as linear amplitude: `floor1_inverse_dB_table` (section 10.1) has a constant step of
     * about 0.547 dB from -140 dB to 0 dB. Computed with the step of its first entry it matches the
     * listed values within one float rounding step.
     */
    private static readonly _inverseDb: Float32Array = VorbisFloor._buildInverseDb();

    private readonly _partitionClasses: Int32Array;
    private readonly _classDimensions: Int32Array;
    private readonly _classBits: Int32Array;
    private readonly _classBooks: (VorbisCodebook | null)[] = [];
    /**
     * Up to 4 subclass books per class.
     */
    private readonly _subclassBooks: (VorbisCodebook | null)[] = [];
    private readonly _multiplier: number;
    private readonly _range: number;
    private readonly _yBits: number;
    private readonly _x: Int32Array;
    private readonly _sorted: Int32Array;
    private readonly _low: Int32Array;
    private readonly _high: Int32Array;
    private readonly _y: Int32Array;
    private readonly _used: Uint8Array;

    private static _buildInverseDb(): Float32Array {
        const table = new Float32Array(256);
        const step = -Math.log(1.0649863e-7) / 255;
        for (let i = 0; i < 256; i++) {
            table[i] = Math.exp(step * (i - 255));
        }
        return table;
    }

    public constructor(r: VorbisBitReader, books: VorbisCodebook[]) {
        const partitions = r.read(5);
        const partitionClasses = new Int32Array(partitions);
        let classes = 0;
        for (let i = 0; i < partitions; i++) {
            partitionClasses[i] = r.read(4);
            classes = Math.max(classes, partitionClasses[i] + 1);
        }
        this._partitionClasses = partitionClasses;

        this._classDimensions = new Int32Array(classes);
        this._classBits = new Int32Array(classes);
        for (let i = 0; i < classes; i++) {
            this._classDimensions[i] = r.read(3) + 1;
            const bits = r.read(2);
            this._classBits[i] = bits;
            this._classBooks.push(bits > 0 ? VorbisFloor._book(books, r.read(8)) : null);
            for (let j = 0; j < 4; j++) {
                this._subclassBooks.push(j < (1 << bits) ? VorbisFloor._book(books, r.read(8) - 1) : null);
            }
        }

        this._multiplier = r.read(2) + 1;
        this._range = VorbisFloor._ranges[this._multiplier - 1];
        this._yBits = VorbisBitReader.ilog(this._range - 1);

        const rangeBits = r.read(4);
        let posts = 2;
        for (let i = 0; i < partitions; i++) {
            posts += this._classDimensions[partitionClasses[i]];
        }
        if (posts > 65) {
            throw VorbisCodebook.invalid();
        }
        const x = new Int32Array(posts);
        x[1] = 1 << rangeBits;
        for (let i = 2; i < posts; i++) {
            x[i] = r.read(rangeBits);
        }
        this._x = x;

        // posts sorted by x and the neighbors used for the prediction (section 9.2.4, 9.2.5)
        const sorted = new Int32Array(posts);
        const low = new Int32Array(posts);
        const high = new Int32Array(posts);
        for (let i = 0; i < posts; i++) {
            let position = 0;
            low[i] = 0;
            high[i] = 1;
            for (let j = 0; j < posts; j++) {
                if (j !== i && x[j] === x[i]) {
                    throw VorbisCodebook.invalid();
                }
                if (x[j] < x[i]) {
                    position++;
                    if (j < i && x[j] > x[low[i]]) {
                        low[i] = j;
                    }
                } else if (j < i && x[j] > x[i] && x[j] < x[high[i]]) {
                    high[i] = j;
                }
            }
            sorted[position] = i;
        }
        this._sorted = sorted;
        this._low = low;
        this._high = high;
        this._y = new Int32Array(posts);
        this._used = new Uint8Array(posts);
    }

    private static _book(books: VorbisCodebook[], index: number): VorbisCodebook | null {
        if (index >= books.length) {
            throw VorbisCodebook.invalid();
        }
        return index < 0 ? null : books[index];
    }

    /**
     * Decodes the floor of a channel and renders it as linear amplitude curve (section 7.2.3, 7.2.4).
     * @param n The curve length (half the block size).
     * @returns false if the floor is unused in this packet (or the packet ended).
     */
    public decode(r: VorbisBitReader, n: number, curve: Float32Array): boolean {
        if (r.read(1) === 0) {
            return false;
        }

        const y = this._y;
        y[0] = r.read(this._yBits);
        y[1] = r.read(this._yBits);
        let offset = 2;
        for (let i = 0; i < this._partitionClasses.length; i++) {
            const partitionClass = this._partitionClasses[i];
            const bits = this._classBits[partitionClass];
            let value = 0;
            if (bits > 0) {
                value = this._classBooks[partitionClass]!.decode(r);
                if (value < 0) {
                    return false;
                }
            }
            const dimensions = this._classDimensions[partitionClass];
            for (let j = 0; j < dimensions; j++) {
                const book = this._subclassBooks[partitionClass * 4 + (value & ((1 << bits) - 1))];
                value = value >> bits;
                let post = 0;
                if (book !== null) {
                    post = book.decode(r);
                    if (post < 0) {
                        return false;
                    }
                }
                y[offset + j] = post;
            }
            offset += dimensions;
        }
        if (r.overrun) {
            return false;
        }

        // step 1: unwrap the values relative to the prediction from the neighbors
        const x = this._x;
        const used = this._used;
        const range = this._range;
        used[0] = 1;
        used[1] = 1;
        for (let i = 2; i < y.length; i++) {
            const low = this._low[i];
            const high = this._high[i];
            const predicted = VorbisFloor._renderPoint(x[low], y[low], x[high], y[high], x[i]);
            const value = y[i];
            const highRoom = range - predicted;
            const lowRoom = predicted;
            const room = (highRoom < lowRoom ? highRoom : lowRoom) * 2;
            if (value === 0) {
                used[i] = 0;
                y[i] = predicted;
            } else {
                used[low] = 1;
                used[high] = 1;
                used[i] = 1;
                if (value >= room) {
                    y[i] = highRoom > lowRoom ? value - lowRoom + predicted : predicted - value + highRoom - 1;
                } else if ((value & 1) === 1) {
                    y[i] = predicted - ((value + 1) >> 1);
                } else {
                    y[i] = predicted + (value >> 1);
                }
            }
        }

        // step 2: lines between the used posts in x order, values clamped as the specification suggests
        const multiplier = this._multiplier;
        let lx = 0;
        let ly = VorbisFloor._clamp(y[0], range) * multiplier;
        for (let i = 1; i < y.length; i++) {
            const post = this._sorted[i];
            if (used[post] === 1) {
                const hx = x[post];
                const hy = VorbisFloor._clamp(y[post], range) * multiplier;
                VorbisFloor._renderLine(lx, ly, hx, hy, n, curve);
                lx = hx;
                ly = hy;
            }
        }
        if (lx < n) {
            VorbisFloor._renderLine(lx, ly, n, ly, n, curve);
        }
        return true;
    }

    private static _clamp(y: number, range: number): number {
        return y < 0 ? 0 : y >= range ? range - 1 : y;
    }

    /**
     * The y value at `x` on the line from (x0, y0) to (x1, y1) with integer rounding (section 9.2.6).
     */
    private static _renderPoint(x0: number, y0: number, x1: number, y1: number, x: number): number {
        const dy = y1 - y0;
        const offset = Math.floor((Math.abs(dy) * (x - x0)) / (x1 - x0));
        return dy < 0 ? y0 - offset : y0 + offset;
    }

    /**
     * Sets the curve from x0 to x1 (exclusive, but not beyond n) to the values on the line (section 9.2.7).
     */
    private static _renderLine(x0: number, y0: number, x1: number, y1: number, n: number, curve: Float32Array) {
        const inverseDb = VorbisFloor._inverseDb;
        const dy = y1 - y0;
        const adx = x1 - x0;
        const base = (dy / adx) | 0;
        const sy = dy < 0 ? base - 1 : base + 1;
        const ady = Math.abs(dy) - Math.abs(base) * adx;
        const end = Math.min(x1, n);
        let y = y0;
        let error = 0;
        if (x0 < end) {
            curve[x0] = inverseDb[y];
        }
        for (let x = x0 + 1; x < end; x++) {
            error += ady;
            if (error >= adx) {
                error -= adx;
                y += sy;
            } else {
                y += base;
            }
            curve[x] = inverseDb[y];
        }
    }
}
