/** Formats milliseconds as `mm:ss`; non-positive or non-finite input reads `00:00`. */
export function formatTime(ms: number): string {
    if (!Number.isFinite(ms) || ms <= 0) {
        return '00:00';
    }
    const total = Math.floor(ms / 1000);
    const mm = Math.floor(total / 60)
        .toString()
        .padStart(2, '0');
    const ss = (total % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
}

/** Formats a byte count as megabytes, with one decimal below 10 MB. */
export function formatMegabytes(bytes: number): string {
    const mb = bytes / (1024 * 1024);
    return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
}

/** Formats a download progress as a whole percentage; `…` while the total is unknown. */
export function formatPercent(loaded: number, total: number): string {
    return total > 0 ? `${Math.min(100, Math.round((loaded / total) * 100))} %` : '…';
}
