/** Decoded media audio, reduced to what the waveform and silence detection need. */
export interface AudioAnalysis {
    durationMs: number;
    sampleRate: number;
    /** Peak amplitude (0..1, normalized to the loudest sample) per `PEAK_BUCKET` samples, per level; level n merges 2^n buckets. */
    peaks: Float32Array[];
    /** Where the music starts and ends in ms, ignoring leading/trailing silence. */
    songRange: [number, number];
}

export const PEAK_BUCKET = 128;
const DECODE_SAMPLE_RATE = 22050;

/** Decodes `bytes` off the audio output (no AudioContext is opened) and analyses it. */
export async function analyseAudio(bytes: Uint8Array): Promise<AudioAnalysis> {
    const context = new OfflineAudioContext(1, 1, DECODE_SAMPLE_RATE);
    const buffer = await context.decodeAudioData(bytes.slice().buffer as ArrayBuffer);
    const left = buffer.getChannelData(0);
    const right = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : left;
    return {
        durationMs: buffer.duration * 1000,
        sampleRate: buffer.sampleRate,
        peaks: buildPeaks(left, right),
        songRange: findSongRange(left, right, buffer.sampleRate),
    };
}

export function buildPeaks(left: Float32Array, right: Float32Array): Float32Array[] {
    const count = Math.ceil(left.length / PEAK_BUCKET);
    const base = new Float32Array(count);
    let loudest = 0;
    for (let b = 0; b < count; b++) {
        let peak = 0;
        const end = Math.min(left.length, (b + 1) * PEAK_BUCKET);
        for (let i = b * PEAK_BUCKET; i < end; i++) {
            const v = Math.max(Math.abs(left[i]), Math.abs(right[i]));
            if (v > peak) peak = v;
        }
        base[b] = peak;
        if (peak > loudest) loudest = peak;
    }
    if (loudest > 0) for (let b = 0; b < count; b++) base[b] /= loudest;

    const levels = [base];
    while (levels[levels.length - 1].length > 1) {
        const prev = levels[levels.length - 1];
        const next = new Float32Array(Math.ceil(prev.length / 2));
        for (let i = 0; i < next.length; i++) next[i] = Math.max(prev[2 * i], prev[2 * i + 1] ?? 0);
        levels.push(next);
    }
    return levels;
}

/**
 * Finds the first and last stretch of at least a second of sound (gaps under 200 ms allowed),
 * searching at most 10 s or 10% from either end.
 */
export function findSongRange(left: Float32Array, right: Float32Array, sampleRate: number): [number, number] {
    const audible = 1 * sampleRate;
    const allowedGap = 0.2 * sampleRate;
    const threshold = 0.001;
    const searchLength = Math.min(10 * sampleRate, left.length * 0.1);
    const loud = (i: number) => Math.abs(left[i]) >= threshold || Math.abs(right[i]) >= threshold;

    const scan = (from: number, to: number, step: 1 | -1): number => {
        let sectionStart = from;
        let sound = 0;
        let silence = 0;
        for (let i = from; step > 0 ? i < to : i >= to; i += step) {
            if (loud(i)) {
                if (sound === 0) sectionStart = i;
                sound++;
                silence = 0;
            } else {
                silence++;
            }
            if (silence > allowedGap) {
                sectionStart = i + step;
                sound = 0;
                silence = 0;
            } else if (sound > audible) {
                return sectionStart;
            }
        }
        return to;
    };

    const start = scan(0, searchLength, 1);
    const end = scan(left.length - 1, left.length - searchLength, -1);
    return [(start / sampleRate) * 1000, (end / sampleRate) * 1000];
}
