import type * as alphaTab from '@coderline/alphatab';
import { describe, expect, it, vi } from 'vitest';
import { encodeWav, exportWav } from '../src/state/audio-export';
import { defaultPlayerView, defaultTrackMix } from '../src/state/store';
import { asApi, createFakeApi, scoreFromTex } from './fake-api';

function ascii(bytes: Uint8Array, offset: number, length: number): string {
    return String.fromCharCode(...bytes.subarray(offset, offset + length));
}

describe('encodeWav', () => {
    it('writes a 32-bit float stereo RIFF header followed by the samples', () => {
        const chunks = [new Float32Array([0.5, -0.5]), new Float32Array([1, -1, 0.25, -0.25])];
        const bytes = encodeWav(chunks, 44100);
        const view = new DataView(bytes.buffer);

        expect(bytes.length).toBe(44 + 6 * 4);
        expect(ascii(bytes, 0, 4)).toBe('RIFF');
        expect(view.getUint32(4, true)).toBe(36 + 6 * 4);
        expect(ascii(bytes, 8, 8)).toBe('WAVEfmt ');
        expect(view.getUint16(20, true)).toBe(3); // WAVE_FORMAT_IEEE_FLOAT
        expect(view.getUint16(22, true)).toBe(2);
        expect(view.getUint32(24, true)).toBe(44100);
        expect(view.getUint32(28, true)).toBe(44100 * 2 * 4);
        expect(view.getUint16(32, true)).toBe(8);
        expect(view.getUint16(34, true)).toBe(32);
        expect(ascii(bytes, 36, 4)).toBe('data');
        expect(view.getUint32(40, true)).toBe(6 * 4);
        expect(Array.from(new Float32Array(bytes.buffer.slice(44)))).toEqual([0.5, -0.5, 1, -1, 0.25, -0.25]);
    });
});

describe('exportWav', () => {
    function setup(chunkCount: number) {
        const api = createFakeApi();
        const score = scoreFromTex('\\track "A" \\staff 3.3.4 | \\track "B" \\staff 3.4.4');
        api.score = score;
        let rendered = 0;
        const exporter = {
            render: vi.fn(async () =>
                rendered < chunkCount
                    ? { samples: new Float32Array([rendered, -rendered]), currentTime: ++rendered * 500, endTime: chunkCount * 500 }
                    : undefined
            ),
            destroy: vi.fn()
        };
        api.exportAudio.mockResolvedValue(exporter);
        const state = {
            tracks: score.tracks,
            view: { ...defaultPlayerView, masterVolume: 0.8, transpose: 1 },
            trackMix: {
                0: { ...defaultTrackMix, volume: 0.5 },
                1: { ...defaultTrackMix, solo: true, transpose: -2 }
            }
        };
        return { api, exporter, state };
    }

    it('renders with the mix, reports progress and encodes the samples', async () => {
        const { api, exporter, state } = setup(2);
        const progress: number[] = [];
        const soundFont = new Uint8Array([1, 2, 3]);

        const wav = await exportWav(asApi(api), state, { onProgress: f => progress.push(f), soundFont });

        const options = api.exportAudio.mock.calls[0][0] as alphaTab.synth.AudioExportOptions;
        expect(options.masterVolume).toBe(0.8);
        expect(options.soundFonts).toEqual([soundFont]);
        // Track B is solo, so track A is silent.
        expect(options.trackVolume.get(0)).toBe(0);
        expect(options.trackVolume.get(1)).toBe(1);
        expect(options.trackTranspositionPitches.get(0)).toBe(1);
        expect(options.trackTranspositionPitches.get(1)).toBe(-1);
        expect(progress).toEqual([0.5, 1]);
        expect(wav.length).toBe(44 + 4 * 4);
        expect(exporter.destroy).toHaveBeenCalledOnce();
    });

    it('stops at an abort and rejects with an AbortError', async () => {
        const { api, exporter, state } = setup(10);
        const abort = new AbortController();
        exporter.render.mockImplementationOnce(async () => {
            abort.abort();
            return { samples: new Float32Array(2), currentTime: 500, endTime: 5000 };
        });

        await expect(exportWav(asApi(api), state, { signal: abort.signal })).rejects.toMatchObject({ name: 'AbortError' });
        expect(exporter.render).toHaveBeenCalledOnce();
        expect(exporter.destroy).toHaveBeenCalledOnce();
    });
});
