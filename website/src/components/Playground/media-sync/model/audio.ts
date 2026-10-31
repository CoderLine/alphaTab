import { buildPeaks } from '@coderline/alphatab-ui';
import { findSongRange } from './song-range';

export { PEAK_BUCKET } from '@coderline/alphatab-ui';

/** Decoded media audio, reduced to what the waveform and silence detection need. */
export interface AudioAnalysis {
    durationMs: number;
    sampleRate: number;
    /** Peak amplitude (0..1, normalized to the loudest sample) per `PEAK_BUCKET` samples, per level; level n merges 2^n buckets. */
    peaks: Float32Array[];
    /** Where the music starts and ends in ms, ignoring leading/trailing silence. */
    songRange: [number, number];
}

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
