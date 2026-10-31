import * as alphaTab from '@coderline/alphatab';
import type { AlphaTabApi } from '@coderline/alphatab';

/** Offers `data` to the user as a file download. Browser only. */
export function downloadBytes(fileName: string, data: Uint8Array | string, mimeType = 'application/octet-stream'): void {
    const blob = new Blob([data as BlobPart], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    // Revoking synchronously can cancel the download in some browsers.
    setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** `name.ext` → `name.<extension>`; keeps names without extension and names empty ones `score`. */
export function withExtension(fileName: string, extension: string): string {
    const base = fileName.replace(/\.[^./]+$/, '');
    return `${base || 'score'}.${extension}`;
}

function loadedScore(api: AlphaTabApi): alphaTab.model.Score {
    if (!api.score) {
        throw new Error('No score is loaded');
    }
    return api.score;
}

/** The loaded score as Guitar Pro 7+ file, including its backing track and sync points. */
export function exportGp7(api: AlphaTabApi): Uint8Array {
    return new alphaTab.exporter.Gp7Exporter().export(loadedScore(api), api.settings);
}

/** The loaded score as alphaTex. */
export function exportAlphaTex(api: AlphaTabApi): string {
    return new alphaTab.exporter.AlphaTexExporter().exportToString(loadedScore(api), api.settings);
}

/** Offers the MIDI of the loaded score as download, as `api.downloadMidi` does. */
export function downloadMidi(api: AlphaTabApi, format: alphaTab.midi.MidiFileFormat): void {
    api.downloadMidi(format);
}
