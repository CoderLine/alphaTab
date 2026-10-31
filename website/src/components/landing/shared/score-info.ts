import type { model } from '@coderline/alphatab';

export const TRACK_COLORS = [
    'var(--at-accent)',
    'var(--at-track-purple)',
    'var(--at-track-green)',
    'var(--at-track-orange)',
];

const MAJOR_KEY_NAMES: Record<number, string> = {
    [-7]: 'Cb', [-6]: 'Gb', [-5]: 'Db', [-4]: 'Ab', [-3]: 'Eb', [-2]: 'Bb', [-1]: 'F',
    0: 'C',
    1: 'G', 2: 'D', 3: 'A', 4: 'E', 5: 'B', 6: 'F#', 7: 'C#',
};
const MINOR_KEY_NAMES: Record<number, string> = {
    [-7]: 'Ab', [-6]: 'Eb', [-5]: 'Bb', [-4]: 'F', [-3]: 'C', [-2]: 'G', [-1]: 'D',
    0: 'A',
    1: 'E', 2: 'B', 3: 'F#', 4: 'C#', 5: 'G#', 6: 'D#', 7: 'A#',
};
const PITCH_CLASSES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function formatKey(score: model.Score | null): string {
    const mb = score?.masterBars[0];
    if (!mb) return '—';
    const k = mb.keySignature as unknown as number;
    const type = mb.keySignatureType as unknown as number;
    const isMinor = type === 1;
    const name = (isMinor ? MINOR_KEY_NAMES : MAJOR_KEY_NAMES)[k];
    if (!name) return '—';
    return `${name} ${isMinor ? 'minor' : 'major'}`;
}

export function formatTuning(track: model.Track | undefined): string {
    const tuning = track?.staves[0]?.tuning;
    if (!tuning || tuning.length === 0) return '—';
    return tuning.slice().reverse().map((p) => PITCH_CLASSES[((p % 12) + 12) % 12]).join(' ');
}

export function formatCapo(track: model.Track | undefined): string {
    const capo = track?.staves[0]?.capo ?? 0;
    return capo > 0 ? String(capo) : '—';
}

/** Color of the track at `index`, cycling through the landing track palette. */
export function trackColor(index: number): string {
    return TRACK_COLORS[index % TRACK_COLORS.length];
}

