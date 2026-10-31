/** Formats milliseconds as `mm:ss`; non-positive or non-finite input reads `00:00`. */
export function formatTime(ms: number): string {
    if (!Number.isFinite(ms) || ms <= 0) { return '00:00'; }
    const total = Math.floor(ms / 1000);
    const mm = Math.floor(total / 60).toString().padStart(2, '0');
    const ss = (total % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
}
