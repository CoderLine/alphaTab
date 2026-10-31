import type { VorbisBitReader } from '@coderline/alphatab/synth/vorbis/VorbisBitReader';
import { VorbisCodebook } from '@coderline/alphatab/synth/vorbis/VorbisCodebook';

/**
 * A residue of type 0, 1 or 2 (Vorbis I specification, section 8): the VQ coded spectral fine structure.
 * @internal
 */
export class VorbisResidue {
    private readonly _type: number;
    private readonly _begin: number;
    private readonly _end: number;
    private readonly _partitionSize: number;
    private readonly _classifications: number;
    private readonly _classBook: VorbisCodebook;
    /**
     * The book per classification and pass (8 passes), null if the pass has no book.
     */
    private readonly _books: (VorbisCodebook | null)[] = [];
    /**
     * The decoded classifications per vector and partition.
     */
    private readonly _classes: Int32Array;
    private readonly _classStride: number;
    /**
     * The interleaved vector of type 2 and the matching arguments for decoding it.
     */
    private readonly _interleaved: Float32Array;
    private readonly _interleavedVectors: Float32Array[];
    private readonly _interleavedSkip: Uint8Array = new Uint8Array(1);

    public constructor(r: VorbisBitReader, type: number, books: VorbisCodebook[], channels: number, halfBlock: number) {
        this._type = type;
        this._begin = r.read(24);
        this._end = r.read(24);
        this._partitionSize = r.read(24) + 1;
        this._classifications = r.read(6) + 1;
        const classBook = r.read(8);
        if (classBook >= books.length) {
            throw VorbisCodebook.invalid();
        }
        this._classBook = books[classBook];
        const classDimensions = this._classBook.dimensions;
        if (classDimensions === 0 || Math.pow(this._classifications, classDimensions) > this._classBook.entries) {
            throw VorbisCodebook.invalid();
        }

        const cascades = new Int32Array(this._classifications);
        for (let i = 0; i < cascades.length; i++) {
            const lowBits = r.read(3);
            cascades[i] = r.read(1) === 1 ? (r.read(5) << 3) | lowBits : lowBits;
        }
        for (let i = 0; i < cascades.length; i++) {
            for (let pass = 0; pass < 8; pass++) {
                let book: VorbisCodebook | null = null;
                if ((cascades[i] & (1 << pass)) !== 0) {
                    const index = r.read(8);
                    // books need a VQ lookup and must fill a partition exactly
                    if (
                        index >= books.length ||
                        books[index].values === null ||
                        this._partitionSize % books[index].dimensions !== 0
                    ) {
                        throw VorbisCodebook.invalid();
                    }
                    book = books[index];
                }
                this._books.push(book);
            }
        }

        // type 2 decodes all channels as one interleaved vector
        const vectors = type === 2 ? 1 : channels;
        const size = type === 2 ? halfBlock * channels : halfBlock;
        const partitions = Math.floor((Math.min(this._end, size) - Math.min(this._begin, size)) / this._partitionSize);
        this._classStride = Math.max(0, partitions) + classDimensions;
        this._classes = new Int32Array(vectors * this._classStride);
        this._interleaved = new Float32Array(type === 2 && channels > 1 ? size : 0);
        this._interleavedVectors = [this._interleaved];
    }

    /**
     * Decodes the residue vectors of a submap (section 8.6.2), the vectors must be zeroed.
     * @param vectors The vectors of the channels in the submap.
     * @param skip Per vector 1 if it should not be decoded (its floor is unused).
     * @param count The number of vectors in the submap.
     * @param n The vector length (half the block size).
     */
    public decode(r: VorbisBitReader, vectors: Float32Array[], skip: Uint8Array, count: number, n: number) {
        if (this._type !== 2 || count === 1) {
            this._decodeVectors(r, vectors, skip, count, n, this._type === 0 ? 0 : 1);
            return;
        }

        let decode = false;
        for (let i = 0; i < count; i++) {
            if (skip[i] === 0) {
                decode = true;
            }
        }
        if (!decode) {
            return;
        }
        const interleaved = this._interleaved;
        const size = n * count;
        interleaved.fill(0, 0, size);
        this._decodeVectors(r, this._interleavedVectors, this._interleavedSkip, 1, size, 1);
        for (let i = 0; i < n; i++) {
            for (let c = 0; c < count; c++) {
                vectors[c][i] = interleaved[i * count + c];
            }
        }
    }

    private _decodeVectors(
        r: VorbisBitReader,
        vectors: Float32Array[],
        skip: Uint8Array,
        count: number,
        size: number,
        type: number
    ) {
        const begin = Math.min(this._begin, size);
        const partitionSize = this._partitionSize;
        const partitions = Math.floor((Math.min(this._end, size) - begin) / partitionSize);
        const classBook = this._classBook;
        const classesPerWord = classBook.dimensions;
        const classifications = this._classifications;
        const classes = this._classes;
        const stride = this._classStride;

        for (let pass = 0; pass < 8; pass++) {
            let partition = 0;
            while (partition < partitions) {
                if (pass === 0) {
                    for (let v = 0; v < count; v++) {
                        if (skip[v] === 0) {
                            let word = classBook.decode(r);
                            if (word < 0) {
                                return;
                            }
                            for (let i = classesPerWord - 1; i >= 0; i--) {
                                classes[v * stride + partition + i] = word % classifications;
                                word = Math.floor(word / classifications);
                            }
                        }
                    }
                }
                for (let i = 0; i < classesPerWord && partition < partitions; i++) {
                    for (let v = 0; v < count; v++) {
                        if (skip[v] === 0) {
                            const book = this._books[classes[v * stride + partition] * 8 + pass];
                            if (
                                book !== null &&
                                !VorbisResidue._decodePartition(
                                    r,
                                    book,
                                    vectors[v],
                                    begin + partition * partitionSize,
                                    partitionSize,
                                    type
                                )
                            ) {
                                // end of packet, keep what was decoded so far
                                return;
                            }
                        }
                    }
                    partition++;
                }
            }
        }
    }

    /**
     * Adds the VQ vectors of one partition (section 8.6.3, 8.6.4).
     * @returns false if the packet ended.
     */
    private static _decodePartition(
        r: VorbisBitReader,
        book: VorbisCodebook,
        vector: Float32Array,
        offset: number,
        partitionSize: number,
        type: number
    ): boolean {
        const dimensions = book.dimensions;
        const values = book.values!;
        if (type === 0) {
            // type 0 interleaves the vector values with a step of partitionSize / dimensions
            const step = partitionSize / dimensions;
            for (let i = 0; i < step; i++) {
                const entry = book.decode(r);
                if (entry < 0) {
                    return false;
                }
                for (let j = 0; j < dimensions; j++) {
                    vector[offset + i + j * step] += values[entry * dimensions + j];
                }
            }
        } else {
            for (let i = 0; i < partitionSize; i += dimensions) {
                const entry = book.decode(r);
                if (entry < 0) {
                    return false;
                }
                for (let j = 0; j < dimensions; j++) {
                    vector[offset + i + j] += values[entry * dimensions + j];
                }
            }
        }
        return true;
    }
}
