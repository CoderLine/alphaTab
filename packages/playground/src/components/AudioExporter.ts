import * as alphaTab from '@coderline/alphatab';
import { Paths } from '../util/Paths';
import type { TrackItem } from './TrackItem';

function downloadBlob(blob: Blob, filename: string): void {
    const a = document.createElement('a');
    a.download = filename;
    a.href = URL.createObjectURL(blob);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
}

export function exportGp7(api: alphaTab.AlphaTabApi): void {
    if (!api.score) {
        return;
    }
    const exporter = new alphaTab.exporter.Gp7Exporter();
    const data = exporter.export(api.score, api.settings);
    const filename = api.score.title.length > 0 ? `${api.score.title}.gp` : 'song.gp';
    downloadBlob(new Blob([data as Uint8Array<ArrayBuffer>]), filename);
}

async function fetchSoundFont(url: string): Promise<Uint8Array> {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to load soundfont '${url}': ${res.status} ${res.statusText}`);
    }
    return new Uint8Array(await res.arrayBuffer());
}

export async function exportAudio(api: alphaTab.AlphaTabApi, trackItems: readonly TrackItem[] = []): Promise<void> {
    if (!api.score) {
        return;
    }
    const options = new alphaTab.synth.AudioExportOptions();
    options.sampleRate = 44100;
    options.masterVolume = api.masterVolume;
    options.metronomeVolume = api.metronomeVolume;
    if (api.playbackRange) {
        options.playbackRange = api.playbackRange;
    }

    const soloed = new Set<number>();
    for (const item of trackItems) {
        const idx = item.track.index;
        const ratio = item.getVolume() / Math.max(1, item.track.playbackInfo.volume);
        options.trackVolume.set(idx, item.isMuted() ? 0 : ratio);
        if (item.isSoloed()) {
            soloed.add(idx);
        }
    }
    if (soloed.size > 0) {
        for (const t of api.score.tracks) {
            if (!soloed.has(t.index)) {
                options.trackVolume.set(t.index, 0);
            }
        }
    }

    options.soundFonts = [await fetchSoundFont(Paths.soundFont)];

    const exporter = await api.exportAudio(options);
    let generated: Float32Array | undefined;
    let totalSamples = 0;
    try {
        while (true) {
            const chunk = await exporter.render(500);
            if (!chunk) {
                break;
            }
            if (!generated) {
                generated = new Float32Array(options.sampleRate * (chunk.endTime / 1000) * 2);
            }
            const needed = totalSamples + chunk.samples.length;
            if (generated.length < needed) {
                const grown = new Float32Array(needed);
                grown.set(generated, 0);
                generated = grown;
            }
            generated.set(chunk.samples, totalSamples);
            totalSamples += chunk.samples.length;
        }
    } finally {
        exporter.destroy();
    }

    if (!generated) {
        return;
    }
    if (totalSamples < generated.length) {
        generated = generated.subarray(0, totalSamples);
    }
    const filename =
        api.score.title.length > 0
            ? `${api.score.title}_${options.sampleRate}_float32.pcm`
            : `song_${options.sampleRate}_float32.pcm`;
    const blob = new Blob([
        new Uint8Array<ArrayBuffer>(generated.buffer as ArrayBuffer, generated.byteOffset, generated.byteLength)
    ]);
    downloadBlob(blob, filename);
}
