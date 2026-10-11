import { Mdct } from '@coderline/alphatab/synth/vorbis/Mdct';
import { OggReader } from '@coderline/alphatab/synth/vorbis/OggReader';
import { VorbisBitReader } from '@coderline/alphatab/synth/vorbis/VorbisBitReader';
import { VorbisCodebook } from '@coderline/alphatab/synth/vorbis/VorbisCodebook';
import { type VorbisMode, VorbisSetup } from '@coderline/alphatab/synth/vorbis/VorbisSetup';

/**
 * A decoded Vorbis stream.
 * @record
 * @internal
 */
export interface VorbisStream {
    channels: number;
    sampleRate: number;
    /**
     * The samples, interleaved if there are multiple channels.
     */
    samples: Float32Array;
}

/**
 * @record
 * @internal
 */
interface VorbisSetupCacheEntry {
    channels: number;
    blockSizes: number;
    setup: Uint8Array;
    value: VorbisSetup;
}

/**
 * Decodes Ogg Vorbis streams like the samples of SF3 soundfonts (Vorbis I specification, section 4.3).
 *
 * An instance keeps the parsed setups, the MDCTs and the window slopes, as all samples of a soundfont
 * share a few setups. Decoding is not thread-safe, use one instance per thread.
 * @internal
 */
export class VorbisDecoder {
    private static readonly _maxCachedSetups = 16;

    private _setups: VorbisSetupCacheEntry[] = [];
    private _nextSetup: number = 0;
    private _mdcts: Map<number, Mdct> = new Map<number, Mdct>();
    private _slopes: Map<number, Float32Array> = new Map<number, Float32Array>();
    private _reader: VorbisBitReader = new VorbisBitReader();

    // per stream buffers, reused while the channels and block size stay the same
    private _channels: number = 0;
    private _half: number = 0;
    private _spectra: Float32Array[] = [];
    private _curves: Float32Array[] = [];
    private _tails: Float32Array[] = [];
    private _bundle: Float32Array[] = [];
    private _bundleSkip: Uint8Array = new Uint8Array(0);
    private _used: Uint8Array = new Uint8Array(0);
    private _noResidue: Uint8Array = new Uint8Array(0);
    private _block: Float32Array = new Float32Array(0);
    private _work: Float32Array = new Float32Array(0);

    /**
     * Decodes the first logical bitstream in the given Ogg data.
     */
    public decode(data: Uint8Array, offset: number, length: number): VorbisStream {
        const ogg = OggReader.read(data, offset, length);
        const body = ogg.data;
        const ends = ogg.ends;
        const granules = ogg.granules;
        // identification header (section 4.2.2), byte aligned
        if (ends.length < 3 || ends[0] < 30 || !VorbisSetup.isHeader(body, 0, ends[0], 1)) {
            throw VorbisCodebook.invalid();
        }
        const channels = body[11];
        const sampleRate = body[12] + body[13] * 256 + body[14] * 65536 + body[15] * 16777216;
        const blockSizes = body[28];
        if (
            (body[7] | body[8] | body[9] | body[10]) !== 0 ||
            channels === 0 ||
            sampleRate === 0 ||
            (blockSizes & 15) < 6 ||
            (blockSizes & 15) > blockSizes >> 4 ||
            blockSizes >> 4 > 13 ||
            (body[29] & 1) === 0 ||
            !VorbisSetup.isHeader(body, ends[0], ends[1], 3)
        ) {
            throw VorbisCodebook.invalid();
        }
        const setup = this._setup(channels, blockSizes, body, ends[1], ends[2]);
        const blockSize0 = setup.blockSize0;
        const half = setup.blockSize1 >> 1;
        this._prepare(channels, half);

        // the output ends at the last granule position, limited to what the packets can produce
        let last = ends.length - 1;
        while (last >= 3 && granules[last] < 0) {
            last--;
        }
        const finalGranule = last >= 3 ? granules[last] : -1;
        const bound = Math.max(0, ends.length - 4) * half;
        const capacity = finalGranule >= 0 && finalGranule < bound ? finalGranule : bound;
        let output = new Float32Array(capacity * channels);

        const r = this._reader;
        const block = this._block;
        let written = 0;
        let decoded = 0;
        // granule position minus decoded frames, known with the first granule position
        let granuleOffset = 0;
        let hasGranuleOffset = false;
        let previous = 0;
        for (let p = 3; p < ends.length; p++) {
            r.reset(body, ends[p - 1], ends[p]);
            if (r.read(1) !== 0) {
                continue;
            }
            const modeNumber = r.read(setup.modeBits);
            if (modeNumber >= setup.modes.length) {
                continue;
            }
            const mode = setup.modes[modeNumber];
            let n = blockSize0;
            let rightSlope = blockSize0 >> 1;
            if (mode.isLong) {
                n = half * 2;
                // the left slope follows the actual previous block, not the flag
                r.read(1);
                if (r.read(1) === 1) {
                    rightSlope = half;
                }
            }
            if (r.overrun) {
                continue;
            }
            this._decodeSpectra(r, mode, channels, n >> 1);

            // overlap-add from the center of the previous block to the center of this one (section 4.3.8)
            const frames = previous === 0 ? 0 : (previous + n) / 4;
            const count = Math.max(0, Math.min(frames, capacity - written));
            const mdct = this._mdct(n);
            for (let c = 0; c < channels; c++) {
                if (this._used[c] === 1) {
                    mdct.inverse(this._spectra[c], block, this._work);
                } else {
                    block.fill(0, 0, n);
                }
                this._overlap(n, previous, rightSlope, this._tails[c], output, written, count, channels, c);
            }
            written += count;
            decoded += frames;
            previous = n;

            if (!hasGranuleOffset && granules[p] >= 0) {
                hasGranuleOffset = true;
                granuleOffset = granules[p] - decoded;
                // a stream starting before granule 0 drops the leading samples, unless it ends on the same page
                if (granuleOffset < 0 && p < last) {
                    const drop = Math.min(-granuleOffset, written) * channels;
                    for (let i = drop; i < written * channels; i++) {
                        output[i - drop] = output[i];
                    }
                    written -= drop / channels;
                }
            }
        }

        if (finalGranule >= 0) {
            written = Math.max(0, Math.min(written, finalGranule - Math.max(granuleOffset, 0)));
        }
        if (written * channels < output.length) {
            const trimmed = new Float32Array(written * channels);
            trimmed.set(output.subarray(0, trimmed.length), 0);
            output = trimmed;
        }
        return { channels, sampleRate, samples: output };
    }

    /**
     * Decodes the floors and residues of a packet into the spectra of all channels (sections 4.3.2 - 4.3.6).
     */
    private _decodeSpectra(r: VorbisBitReader, mode: VorbisMode, channels: number, n: number) {
        const mapping = mode.mapping;
        const spectra = this._spectra;
        const used = this._used;
        const noResidue = this._noResidue;
        for (let c = 0; c < channels; c++) {
            spectra[c].fill(0, 0, n);
            const isUsed = mapping.floors[mapping.mux[c]].decode(r, n, this._curves[c]);
            used[c] = isUsed ? 1 : 0;
            noResidue[c] = isUsed ? 0 : 1;
        }

        // coupled channels need the residue if one of them has a floor
        const magnitudes = mapping.magnitudes;
        const angles = mapping.angles;
        for (let i = 0; i < magnitudes.length; i++) {
            if (noResidue[magnitudes[i]] === 0 || noResidue[angles[i]] === 0) {
                noResidue[magnitudes[i]] = 0;
                noResidue[angles[i]] = 0;
            }
        }

        for (let submap = 0; submap < mapping.residues.length; submap++) {
            let count = 0;
            for (let c = 0; c < channels; c++) {
                if (mapping.mux[c] === submap) {
                    this._bundle[count] = spectra[c];
                    this._bundleSkip[count] = noResidue[c];
                    count++;
                }
            }
            mapping.residues[submap].decode(r, this._bundle, this._bundleSkip, count, n);
        }

        // inverse square polar coupling
        for (let i = magnitudes.length - 1; i >= 0; i--) {
            const magnitude = spectra[magnitudes[i]];
            const angle = spectra[angles[i]];
            for (let j = 0; j < n; j++) {
                const m = magnitude[j];
                const a = angle[j];
                if (m > 0) {
                    if (a > 0) {
                        angle[j] = m - a;
                    } else {
                        angle[j] = m;
                        magnitude[j] = m + a;
                    }
                } else if (a > 0) {
                    angle[j] = m + a;
                } else {
                    angle[j] = m;
                    magnitude[j] = m - a;
                }
            }
        }

        // apply the floors, channels with an unused floor stay silent
        for (let c = 0; c < channels; c++) {
            if (used[c] === 1) {
                const spectrum = spectra[c];
                const curve = this._curves[c];
                for (let j = 0; j < n; j++) {
                    spectrum[j] *= curve[j];
                }
            }
        }
    }

    /**
     * Windows the block, adds its left half to the tail of the previous block for the output and keeps its right half as new tail.
     * @param n The block size.
     * @param previous The size of the previous block, 0 if this is the first block.
     * @param rightSlope The length of the right window slope.
     * @param count The number of output frames to write.
     */
    private _overlap(
        n: number,
        previous: number,
        rightSlope: number,
        tail: Float32Array,
        output: Float32Array,
        written: number,
        count: number,
        channels: number,
        channel: number
    ) {
        const block = this._block;
        // block sizes are powers of two, the divisions are exact
        const quarter = n / 4;

        if (previous > 0) {
            // the block's left half starts at the center of the previous block's right slope
            const leftSlope = Math.min(previous, n) / 2;
            const leftWindow = this._slope(leftSlope);
            const start = previous / 4 - leftSlope / 2;
            const shift = quarter - previous / 4;
            let j = 0;
            let o = written * channels + channel;
            for (; j < Math.min(start, count); j++) {
                output[o] = tail[j];
                o += channels;
            }
            for (; j < Math.min(start + leftSlope, count); j++) {
                output[o] = tail[j] + block[j + shift] * leftWindow[j - start];
                o += channels;
            }
            for (; j < count; j++) {
                output[o] = tail[j] + block[j + shift];
                o += channels;
            }
        }

        const center = n / 2;
        const rightWindow = this._slope(rightSlope);
        const slopeStart = quarter - rightSlope / 2;
        const slopeEnd = quarter + rightSlope / 2;
        for (let m = 0; m < slopeStart; m++) {
            tail[m] = block[center + m];
        }
        for (let m = slopeStart; m < slopeEnd; m++) {
            tail[m] = block[center + m] * rightWindow[slopeEnd - 1 - m];
        }
        tail.fill(0, slopeEnd, tail.length);
    }

    private _prepare(channels: number, half: number) {
        if (this._channels === channels && this._half === half) {
            return;
        }
        this._channels = channels;
        this._half = half;
        this._spectra = [];
        this._curves = [];
        this._tails = [];
        this._bundle = [];
        for (let c = 0; c < channels; c++) {
            this._spectra.push(new Float32Array(half));
            this._curves.push(new Float32Array(half));
            this._tails.push(new Float32Array(half));
            this._bundle.push(this._spectra[c]);
        }
        this._bundleSkip = new Uint8Array(channels);
        this._used = new Uint8Array(channels);
        this._noResidue = new Uint8Array(channels);
        this._block = new Float32Array(half * 2);
        this._work = new Float32Array(half);
    }

    private _mdct(n: number): Mdct {
        let mdct = this._mdcts.get(n);
        if (!mdct) {
            mdct = new Mdct(n);
            this._mdcts.set(n, mdct);
        }
        return mdct;
    }

    /**
     * The rising window slope `sin(pi/2 * sin^2((i + 0.5) / length * pi/2))` (section 4.3.1).
     */
    private _slope(length: number): Float32Array {
        let slope = this._slopes.get(length);
        if (!slope) {
            slope = new Float32Array(length);
            for (let i = 0; i < length; i++) {
                const x = Math.sin((((i + 0.5) / length) * Math.PI) / 2);
                slope[i] = Math.sin((Math.PI / 2) * x * x);
            }
            this._slopes.set(length, slope);
        }
        return slope;
    }

    /**
     * Returns the parsed setup header, parsing it only if it is not cached.
     */
    private _setup(channels: number, blockSizes: number, body: Uint8Array, start: number, end: number): VorbisSetup {
        for (const cached of this._setups) {
            if (
                cached.channels === channels &&
                cached.blockSizes === blockSizes &&
                VorbisDecoder._equals(cached.setup, body, start, end)
            ) {
                return cached.value;
            }
        }

        const value = new VorbisSetup(channels, 1 << (blockSizes & 15), 1 << (blockSizes >> 4), body, start, end);
        const setup = new Uint8Array(end - start);
        setup.set(body.subarray(start, end), 0);
        const entry: VorbisSetupCacheEntry = { channels, blockSizes, setup, value };
        if (this._setups.length < VorbisDecoder._maxCachedSetups) {
            this._setups.push(entry);
        } else {
            this._setups[this._nextSetup] = entry;
            this._nextSetup = (this._nextSetup + 1) % VorbisDecoder._maxCachedSetups;
        }
        return value;
    }

    private static _equals(cached: Uint8Array, data: Uint8Array, start: number, end: number): boolean {
        if (cached.length !== end - start) {
            return false;
        }
        for (let i = 0; i < cached.length; i++) {
            if (cached[i] !== data[start + i]) {
                return false;
            }
        }
        return true;
    }
}
