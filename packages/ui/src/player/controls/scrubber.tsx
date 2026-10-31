import React from 'react';
import type { TempoMarker, LoopRangeBars } from '../../state/store';

interface ScrubberProps {
    totalBars?: number;
    currentBar?: number;
    compact?: boolean;
    tempoMarkers?: TempoMarker[];
    loopRange?: LoopRangeBars | null;
    onSeek?: (fraction: number) => void;
}

export const Scrubber: React.FC<ScrubberProps> = ({
    totalBars = 64,
    currentBar = 0,
    compact = false,
    tempoMarkers,
    loopRange,
    onSeek,
}) => {
    const W = compact ? 400 : 600;
    const tempoH = compact ? 0 : 12;
    const trackY = compact ? 8 : 22;
    const labelY = compact ? 16 : 32;
    const H = compact ? 22 : 38;
    const safeTotal = Math.max(1, totalBars);
    const xOf = (bar: number) => (Math.max(0, Math.min(bar, safeTotal)) / safeTotal) * W;
    const cursorX = xOf(Math.max(0, Math.min(currentBar, safeTotal)));
    const labelStops = [0, 16, 32, 48, 64].filter((b) => b > 0 && b < safeTotal);
    // Drop tempo markers whose label would collide with the previously kept one.
    // Scores with many close-spaced tempo automations would otherwise stack
    // their labels into unreadable overlaps.
    const MIN_TEMPO_LABEL_GAP = 60;
    const tempos: TempoMarker[] = [];
    if (tempoMarkers) {
        let lastX = -Infinity;
        for (const t of tempoMarkers) {
            if (t.atBar >= safeTotal) { continue; }
            const x = xOf(t.atBar);
            if (x - lastX < MIN_TEMPO_LABEL_GAP) { continue; }
            tempos.push(t);
            lastX = x;
        }
    }

    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const [drag, setDrag] = React.useState(false);

    const seekAtClientX = React.useCallback(
        (clientX: number) => {
            const node = wrapperRef.current;
            if (!node || !onSeek) { return; }
            const r = node.getBoundingClientRect();
            const f = Math.min(Math.max((clientX - r.left) / r.width, 0), 1);
            onSeek(f);
        },
        [onSeek],
    );

    React.useEffect(() => {
        if (!drag) { return; }
        const move = (e: PointerEvent) => seekAtClientX(e.clientX);
        const up = () => setDrag(false);
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
        return () => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);
        };
    }, [drag, seekAtClientX]);

    return (
        <div
            ref={wrapperRef}
            role={onSeek ? 'slider' : undefined}
            aria-label={onSeek ? 'Playback position' : undefined}
            aria-valuemin={onSeek ? 0 : undefined}
            aria-valuemax={onSeek ? safeTotal : undefined}
            aria-valuenow={onSeek ? Math.max(0, Math.min(currentBar, safeTotal)) : undefined}
            tabIndex={onSeek ? 0 : undefined}
            style={{ width: '100%', cursor: onSeek ? 'pointer' : undefined, touchAction: 'none' }}
            onPointerDown={(e) => {
                if (!onSeek) { return; }
                setDrag(true);
                seekAtClientX(e.clientX);
            }}
        >
            <svg
                viewBox={`0 0 ${W} ${H}`}
                preserveAspectRatio="none"
                style={{ display: 'block', width: '100%', height: `${H}px`, overflow: 'visible' }}
                aria-hidden="true"
            >
                {!compact &&
                    tempos.map((tm, i) => {
                        const x = xOf(tm.atBar);
                        return (
                            <g key={i}>
                                <line
                                    x1={x}
                                    x2={x}
                                    y1={tempoH - 2}
                                    y2={trackY - 1}
                                    stroke="var(--at-muted)"
                                    strokeWidth={0.6}
                                    opacity={0.5}
                                    strokeDasharray="1 2"
                                />
                                <g transform={`translate(${x + 4}, ${tempoH - 4})`}>
                                    <text fontFamily="Georgia, serif" fontSize="9" fill="var(--at-muted)">
                                        ♪
                                    </text>
                                    <text x={6} fontFamily="var(--at-font-mono)" fontSize="8" fill="var(--at-muted)">
                                        = {Math.round(tm.bpm)}
                                    </text>
                                </g>
                            </g>
                        );
                    })}

                {loopRange && (
                    <>
                        <rect
                            x={xOf(loopRange.from)}
                            y={trackY - 6}
                            width={Math.max(0, xOf(loopRange.to) - xOf(loopRange.from))}
                            height={12}
                            fill="var(--at-accent)"
                            opacity={0.14}
                            rx={2}
                        />
                        <line
                            x1={xOf(loopRange.from)}
                            x2={xOf(loopRange.from)}
                            y1={trackY - 6}
                            y2={trackY + 6}
                            stroke="var(--at-accent)"
                            strokeWidth={0.8}
                            strokeDasharray="2 2"
                            opacity={0.7}
                        />
                        <line
                            x1={xOf(loopRange.to)}
                            x2={xOf(loopRange.to)}
                            y1={trackY - 6}
                            y2={trackY + 6}
                            stroke="var(--at-accent)"
                            strokeWidth={0.8}
                            strokeDasharray="2 2"
                            opacity={0.7}
                        />
                    </>
                )}

                <line x1={0} x2={W} y1={trackY} y2={trackY} stroke="var(--at-line)" strokeWidth={2} strokeLinecap="round" />
                <line
                    x1={0}
                    x2={cursorX}
                    y1={trackY}
                    y2={trackY}
                    stroke="var(--at-accent)"
                    strokeWidth={2}
                    strokeLinecap="round"
                />

                {Array.from({ length: safeTotal + 1 }).map((_, b) => {
                    const x = xOf(b);
                    const major = b % 16 === 0;
                    const mid = b % 4 === 0;
                    const h = major ? 5 : mid ? 3 : 1.5;
                    const op = major ? 0.8 : mid ? 0.5 : 0.28;
                    return (
                        <line
                            key={b}
                            x1={x}
                            x2={x}
                            y1={trackY + 2}
                            y2={trackY + 2 + h}
                            stroke="var(--at-muted)"
                            strokeWidth={0.7}
                            opacity={op}
                        />
                    );
                })}

                {labelStops.map((b) => (
                    <text
                        key={b}
                        x={xOf(b)}
                        y={labelY + 3}
                        fontFamily="var(--at-font-mono)"
                        fontSize="7"
                        fill="var(--at-muted)"
                        textAnchor="middle"
                    >
                        {b}
                    </text>
                ))}

                <circle cx={cursorX} cy={trackY} r={5} fill="var(--at-accent)" opacity={0.18} />
                <line
                    x1={cursorX}
                    x2={cursorX}
                    y1={trackY - 10}
                    y2={trackY + 10}
                    stroke="var(--at-accent)"
                    strokeWidth={1.2}
                />
                <circle cx={cursorX} cy={trackY} r={3} fill="var(--at-accent)" />
                <circle cx={cursorX} cy={trackY} r={1.4} fill="var(--at-accent-ink)" />
            </svg>
        </div>
    );
};
