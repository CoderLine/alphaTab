import { FormatError } from '@coderline/alphatab/FormatError';
import { VorbisBitReader } from '@coderline/alphatab/synth/vorbis/VorbisBitReader';
import { VorbisCodebook } from '@coderline/alphatab/synth/vorbis/VorbisCodebook';
import { VorbisFloor } from '@coderline/alphatab/synth/vorbis/VorbisFloor';
import { VorbisResidue } from '@coderline/alphatab/synth/vorbis/VorbisResidue';

/**
 * A channel mapping (Vorbis I specification, section 4.2.4).
 * @record
 * @internal
 */
export interface VorbisMapping {
    /**
     * The submap per channel.
     */
    mux: Int32Array;
    /**
     * The floor per submap.
     */
    floors: VorbisFloor[];
    /**
     * The residue per submap.
     */
    residues: VorbisResidue[];
    /**
     * The magnitude and angle channel per coupling step.
     */
    magnitudes: Int32Array;
    angles: Int32Array;
}

/**
 * A packet mode (Vorbis I specification, section 4.2.4).
 * @record
 * @internal
 */
export interface VorbisMode {
    isLong: boolean;
    mapping: VorbisMapping;
}

/**
 * The decoder configuration from the setup header of a Vorbis stream (Vorbis I specification, section 4.2.4).
 * It is not changed by decoding packets with it.
 * @internal
 */
export class VorbisSetup {
    public readonly channels: number;
    public readonly blockSize0: number;
    public readonly blockSize1: number;
    public readonly modes: VorbisMode[] = [];
    public readonly modeBits: number;

    /**
     * Whether the packet is a Vorbis header of the given type (section 4.2.1).
     */
    public static isHeader(data: Uint8Array, start: number, end: number, type: number): boolean {
        return (
            end - start >= 7 &&
            data[start] === type &&
            data[start + 1] === 0x76 &&
            data[start + 2] === 0x6f &&
            data[start + 3] === 0x72 &&
            data[start + 4] === 0x62 &&
            data[start + 5] === 0x69 &&
            data[start + 6] === 0x73
        );
    }

    /**
     * Parses the setup header for the channels and block sizes of the identification header.
     */
    public constructor(
        channels: number,
        blockSize0: number,
        blockSize1: number,
        data: Uint8Array,
        setupStart: number,
        setupEnd: number
    ) {
        this.channels = channels;
        this.blockSize0 = blockSize0;
        this.blockSize1 = blockSize1;
        if (!VorbisSetup.isHeader(data, setupStart, setupEnd, 5)) {
            throw VorbisCodebook.invalid();
        }
        const r = new VorbisBitReader();
        r.reset(data, setupStart + 7, setupEnd);

        const books: VorbisCodebook[] = [];
        for (let i = r.read(8) + 1; i > 0; i--) {
            books.push(new VorbisCodebook(r));
        }

        // time domain transforms are placeholders which must be zero
        for (let i = r.read(6) + 1; i > 0; i--) {
            if (r.read(16) !== 0) {
                throw VorbisCodebook.invalid();
            }
        }

        const floors: VorbisFloor[] = [];
        for (let i = r.read(6) + 1; i > 0; i--) {
            const type = r.read(16);
            if (type === 0) {
                throw new FormatError('Vorbis floor type 0 is not supported');
            }
            if (type !== 1) {
                throw VorbisCodebook.invalid();
            }
            floors.push(new VorbisFloor(r, books));
        }

        const residues: VorbisResidue[] = [];
        for (let i = r.read(6) + 1; i > 0; i--) {
            const type = r.read(16);
            if (type > 2) {
                throw VorbisCodebook.invalid();
            }
            residues.push(new VorbisResidue(r, type, books, this.channels, this.blockSize1 >> 1));
        }

        const mappings: VorbisMapping[] = [];
        for (let i = r.read(6) + 1; i > 0; i--) {
            mappings.push(this._readMapping(r, floors, residues));
        }

        for (let i = r.read(6) + 1; i > 0; i--) {
            const isLong = r.read(1) === 1;
            const windowType = r.read(16);
            const transformType = r.read(16);
            const mapping = r.read(8);
            if (windowType !== 0 || transformType !== 0 || mapping >= mappings.length) {
                throw VorbisCodebook.invalid();
            }
            this.modes.push({ isLong, mapping: mappings[mapping] });
        }
        this.modeBits = VorbisBitReader.ilog(this.modes.length - 1);

        // framing bit
        if (r.read(1) !== 1 || r.overrun) {
            throw VorbisCodebook.invalid();
        }
    }

    private _readMapping(r: VorbisBitReader, floors: VorbisFloor[], residues: VorbisResidue[]): VorbisMapping {
        const channels = this.channels;
        if (r.read(16) !== 0) {
            throw VorbisCodebook.invalid();
        }
        const submaps = r.read(1) === 1 ? r.read(4) + 1 : 1;

        const steps = r.read(1) === 1 ? r.read(8) + 1 : 0;
        const channelBits = VorbisBitReader.ilog(channels - 1);
        const magnitudes = new Int32Array(steps);
        const angles = new Int32Array(steps);
        for (let i = 0; i < steps; i++) {
            magnitudes[i] = r.read(channelBits);
            angles[i] = r.read(channelBits);
            if (magnitudes[i] === angles[i] || magnitudes[i] >= channels || angles[i] >= channels) {
                throw VorbisCodebook.invalid();
            }
        }

        if (r.read(2) !== 0) {
            throw VorbisCodebook.invalid();
        }

        const mux = new Int32Array(channels);
        if (submaps > 1) {
            for (let i = 0; i < channels; i++) {
                mux[i] = r.read(4);
                if (mux[i] >= submaps) {
                    throw VorbisCodebook.invalid();
                }
            }
        }

        const mappingFloors: VorbisFloor[] = [];
        const mappingResidues: VorbisResidue[] = [];
        for (let i = 0; i < submaps; i++) {
            // unused time configuration
            r.read(8);
            const floor = r.read(8);
            const residue = r.read(8);
            if (floor >= floors.length || residue >= residues.length) {
                throw VorbisCodebook.invalid();
            }
            mappingFloors.push(floors[floor]);
            mappingResidues.push(residues[residue]);
        }

        return { mux, floors: mappingFloors, residues: mappingResidues, magnitudes, angles };
    }
}
