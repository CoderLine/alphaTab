/** Samples per entry of the finest peak level. */
export const PEAK_BUCKET = 128;
const DECODE_SAMPLE_RATE = 22050;

/** Decoded audio reduced to what a waveform needs. */
export interface AudioPeaks {
    durationMs: number;
    sampleRate: number;
    /** See {@link buildPeaks}. */
    peaks: Float32Array[];
}

/**
 * Peak amplitudes of a stereo signal for drawing it at any width: level 0 holds the peak of every
 * {@link PEAK_BUCKET} samples over both channels, normalized to the loudest one (0..1); level `n`
 * merges two entries of level `n - 1`, down to a single entry. Silence stays all zero.
 */
export function buildPeaks(left: Float32Array, right: Float32Array): Float32Array[] {
    const count = Math.ceil(left.length / PEAK_BUCKET);
    const base = new Float32Array(count);
    let loudest = 0;
    for (let b = 0; b < count; b++) {
        let peak = 0;
        const end = Math.min(left.length, (b + 1) * PEAK_BUCKET);
        for (let i = b * PEAK_BUCKET; i < end; i++) {
            const v = Math.max(Math.abs(left[i]), Math.abs(right[i]));
            if (v > peak) {
                peak = v;
            }
        }
        base[b] = peak;
        if (peak > loudest) {
            loudest = peak;
        }
    }
    if (loudest > 0) {
        for (let b = 0; b < count; b++) {
            base[b] /= loudest;
        }
    }

    const levels = [base];
    while (levels[levels.length - 1].length > 1) {
        const prev = levels[levels.length - 1];
        const next = new Float32Array(Math.ceil(prev.length / 2));
        for (let i = 0; i < next.length; i++) {
            next[i] = Math.max(prev[2 * i], prev[2 * i + 1] ?? 0);
        }
        levels.push(next);
    }
    return levels;
}

/** The coarsest level of {@link buildPeaks} output that still has at least `count` entries. */
export function peaksForWidth(levels: readonly Float32Array[], count: number): Float32Array {
    let chosen = levels[0];
    for (const level of levels) {
        if (level.length < count) {
            break;
        }
        chosen = level;
    }
    return chosen;
}

/** Decodes audio in any format the browser supports, without opening an audio output, into peaks. */
export async function decodeAudioPeaks(bytes: Uint8Array): Promise<AudioPeaks> {
    const context = new OfflineAudioContext(1, 1, DECODE_SAMPLE_RATE);
    const buffer = await context.decodeAudioData(bytes.slice().buffer as ArrayBuffer);
    const left = buffer.getChannelData(0);
    const right = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : left;
    return { durationMs: buffer.duration * 1000, sampleRate: buffer.sampleRate, peaks: buildPeaks(left, right) };
}
