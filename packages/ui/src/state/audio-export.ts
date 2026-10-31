import type { AlphaTabApi } from '@coderline/alphatab';
import { defaultTrackMix, type PlayerStoreState } from './store';
import { playbackPreferences, soundFontLibrary } from './playback';
import type { AlphaTabModule } from '@site/src/alphatab-react/module';

const SAMPLE_RATE = 44100;
const CHUNK_MS = 500;

/**
 * Renders the song with the synthesizer, applying the current mix (volumes, mute/solo, transposition),
 * metronome and playback range, and encodes it as a 32-bit float stereo WAV file.
 */
export async function exportWav(
    api: AlphaTabApi,
    module: AlphaTabModule,
    state: Pick<PlayerStoreState, 'tracks' | 'trackMix' | 'view'>,
    onProgress: (fraction: number) => void,
    signal: AbortSignal,
): Promise<Uint8Array> {
    const options = new module.synth.AudioExportOptions();
    options.sampleRate = SAMPLE_RATE;
    options.useSyncPoints = false;
    options.masterVolume = state.view.masterVolume;
    options.metronomeVolume = state.view.metronome ? 1 : 0;
    if (api.playbackRange) { options.playbackRange = api.playbackRange; }
    // The site loads SoundFonts itself, so the synthesizer settings carry none the exporter could use.
    options.soundFonts = [await soundFontLibrary.load(playbackPreferences.getSnapshot().soundFontId)];

    const anySolo = state.tracks.some((t) => state.trackMix[t.index]?.solo);
    for (const track of state.tracks) {
        const mix = state.trackMix[track.index] ?? defaultTrackMix;
        const audible = !mix.mute && (!anySolo || mix.solo);
        options.trackVolume.set(track.index, audible ? mix.volume : 0);
        options.trackTranspositionPitches.set(track.index, state.view.transpose + mix.transpose);
    }

    const exporter = await api.exportAudio(options);
    const chunks: Float32Array[] = [];
    try {
        while (!signal.aborted) {
            const chunk = await exporter.render(CHUNK_MS);
            if (!chunk) { break; }
            chunks.push(chunk.samples);
            if (chunk.endTime > 0) { onProgress(Math.min(1, chunk.currentTime / chunk.endTime)); }
        }
    } finally {
        exporter.destroy();
    }
    if (signal.aborted) { throw new DOMException('Export cancelled', 'AbortError'); }
    return encodeWav(chunks, SAMPLE_RATE);
}

/** Interleaved stereo float samples → WAVE_FORMAT_IEEE_FLOAT file. */
function encodeWav(chunks: Float32Array[], sampleRate: number): Uint8Array {
    const channels = 2;
    const bytesPerSample = 4;
    const sampleCount = chunks.reduce((n, c) => n + c.length, 0);
    const dataSize = sampleCount * bytesPerSample;
    const bytes = new Uint8Array(44 + dataSize);
    const view = new DataView(bytes.buffer);
    const ascii = (offset: number, text: string) => {
        for (let i = 0; i < text.length; i++) { bytes[offset + i] = text.charCodeAt(i); }
    };
    ascii(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    ascii(8, 'WAVE');
    ascii(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 3, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * channels * bytesPerSample, true);
    view.setUint16(32, channels * bytesPerSample, true);
    view.setUint16(34, bytesPerSample * 8, true);
    ascii(36, 'data');
    view.setUint32(40, dataSize, true);
    let offset = 44;
    for (const chunk of chunks) {
        bytes.set(new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength), offset);
        offset += chunk.byteLength;
    }
    return bytes;
}
