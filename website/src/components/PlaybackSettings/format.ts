import {
    formatMegabytes,
    type PlaybackPreparation,
    type SoundFontEntry,
    type SoundFontState,
} from '@site/src/alphatab-react';

export function formatPercent(loaded: number, total: number): string {
    return total > 0 ? `${Math.min(100, Math.round((loaded / total) * 100))} %` : '…';
}

export function soundFontStatusText(entry: SoundFontEntry, state: SoundFontState): string {
    switch (state.status) {
        case 'stored':
            return 'Downloaded';
        case 'downloading':
            return `Downloading ${formatPercent(state.loaded, state.total)}`;
        case 'sessionOnly':
            return 'Not saved offline';
        case 'error':
            return 'Download failed';
        case 'available':
            return `Download · ${formatMegabytes(entry.sizeBytes)}`;
    }
}

export function preparationText(preparing: PlaybackPreparation): string {
    const pct = formatPercent(preparing.loaded, preparing.total);
    return preparing.kind === 'backingTrack' ? `Preparing backing track ${pct}` : `Loading SoundFont ${pct}`;
}
