import React from 'react';
import type { TempoMarker, LoopRangeBars } from '../../state/store';

export interface ScrubberProps {
    totalBars?: number;
    /** Zero-based bar the playback is in. */
    currentBar?: number;
    compact?: boolean;
    tempoMarkers?: TempoMarker[];
    loopRange?: LoopRangeBars | null;
    /** Seeks to a fraction of the song, 0..1, on pointer input. Without it the scrubber is display only. */
    onSeek?: (fraction: number) => void;
    /** Seeks to the start of a zero-based bar on keyboard input; falls back to `onSeek`. */
    onSeekBar?: (bar: number) => void;
}

/** Bars a Page Up or Page Down press moves. */
const PAGE_BARS = 4;

/** Layout width until the scrubber is measured, e.g. while rendered on the server. */
const FALLBACK_WIDTH = 600;
const FALLBACK_WIDTH_COMPACT = 400;

/** Distances in CSS pixels; the drawing is never scaled. */
const MIN_TICK_GAP = 4;
const MIN_LABEL_GAP = 48;
const LABEL_PADDING = 16;
const MIN_TEMPO_LABEL_GAP = 8;
const TEMPO_LABEL_OFFSET = 4;
const TEMPO_BPM_X = 6;
/** Advance of a digit in the monospace font, relative to the font size. */
const MONO_ADVANCE = 0.6;

/** The smallest power of two that is at least `value`. */
function powerOfTwoAtLeast(value: number): number {
    return 2 ** Math.max(0, Math.ceil(Math.log2(Math.max(1, value))));
}

function useWidth(ref: React.RefObject<HTMLElement | null>, fallback: number): number {
    const [width, setWidth] = React.useState(fallback);
    React.useLayoutEffect(() => {
        const node = ref.current;
        if (!node) { return; }
        const update = () => {
            const w = node.getBoundingClientRect().width;
            if (w > 0) { setWidth(w); }
        };
        update();
        if (typeof ResizeObserver === 'undefined') { return; }
        const observer = new ResizeObserver(update);
        observer.observe(node);
        return () => observer.disconnect();
    }, [ref]);
    return width;
}

/**
 * The song timeline with bar ticks, tempo markers and the loop range. With `onSeek` it is a slider:
 * pointer drags seek continuously; the arrow keys move by a bar, Page Up and Page Down by four,
 * Home and End to the first and last bar.
 *
 * It draws at its rendered width: tick and bar-number density follow the space a bar gets, labels
 * show one-based bar numbers at the start of their bar.
 */
export const Scrubber: React.FC<ScrubberProps> = ({
    totalBars = 64,
    currentBar = 0,
    compact = false,
    tempoMarkers,
    loopRange,
    onSeek,
    onSeekBar,
}) => {
    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const W = useWidth(wrapperRef, compact ? FALLBACK_WIDTH_COMPACT : FALLBACK_WIDTH);
    const tempoH = compact ? 0 : 12;
    const trackY = compact ? 8 : 22;
    const labelY = compact ? 21 : 36;
    const labelFontSize = compact ? 7 : 8;
    const H = compact ? 22 : 38;
    const safeTotal = Math.max(1, totalBars);
    const xOf = (bar: number) => (Math.max(0, Math.min(bar, safeTotal)) / safeTotal) * W;
    const cursorX = xOf(Math.max(0, Math.min(currentBar, safeTotal)));

    // The ruler only changes with the size, not with the playback position.
    const ruler = React.useMemo(() => {
        const barWidth = W / safeTotal;
        const digitWidth = labelFontSize * MONO_ADVANCE;
        const widestLabel = String(safeTotal).length * digitWidth;
        const labelStep = powerOfTwoAtLeast(Math.max(MIN_LABEL_GAP, widestLabel + LABEL_PADDING) / barWidth);
        const tickStep = Math.min(labelStep, powerOfTwoAtLeast(MIN_TICK_GAP / barWidth));
        const midStep = Math.max(tickStep, labelStep / 4);
        const x = (bar: number) => (bar / safeTotal) * W;

        const ticks: React.ReactNode[] = [];
        for (let b = 0; b <= safeTotal; b += tickStep) {
            const major = b % labelStep === 0;
            const mid = !major && b % midStep === 0;
            const h = major ? 5 : mid ? 3 : 1.5;
            const op = major ? 0.8 : mid ? 0.5 : 0.28;
            ticks.push(
                <line
                    key={`t${b}`}
                    x1={x(b)}
                    x2={x(b)}
                    y1={trackY + 2}
                    y2={trackY + 2 + h}
                    stroke="var(--at-muted)"
                    strokeWidth={1}
                    opacity={op}
                />,
            );
        }

        // Labels center under their tick but stay inside the scrubber at both ends.
        const labels: React.ReactNode[] = [];
        for (let b = 0; b < safeTotal; b += labelStep) {
            const text = String(b + 1);
            const half = (text.length * digitWidth) / 2;
            labels.push(
                <text
                    key={`l${b}`}
                    x={Math.max(half, Math.min(x(b), W - half))}
                    y={labelY}
                    fontFamily="var(--at-font-mono)"
                    fontSize={labelFontSize}
                    fill="var(--at-muted)"
                    textAnchor="middle"
                >
                    {text}
                </text>,
            );
        }

        // A tempo label sits right of its marker, or left of it where it would leave the scrubber.
        // Markers whose label would collide with the previously kept one are dropped: scores with
        // many close-spaced tempo automations would otherwise stack their labels into unreadable overlaps.
        const tempos: React.ReactNode[] = [];
        if (!compact && tempoMarkers) {
            let lastRight = -Infinity;
            for (const t of tempoMarkers) {
                if (t.atBar >= safeTotal) { continue; }
                const bpm = Math.round(t.bpm);
                const mx = x(Math.max(0, t.atBar));
                const labelWidth = TEMPO_BPM_X + `= ${bpm}`.length * 8 * MONO_ADVANCE;
                const flip = mx + TEMPO_LABEL_OFFSET + labelWidth > W;
                const left = flip ? mx - TEMPO_LABEL_OFFSET - labelWidth : mx + TEMPO_LABEL_OFFSET;
                if (left < 0 || left - lastRight < MIN_TEMPO_LABEL_GAP) { continue; }
                lastRight = left + labelWidth;
                tempos.push(
                    <g key={`m${t.atBar}`}>
                        <line
                            x1={mx}
                            x2={mx}
                            y1={tempoH - 2}
                            y2={trackY - 1}
                            stroke="var(--at-muted)"
                            strokeWidth={0.6}
                            opacity={0.5}
                            strokeDasharray="1 2"
                        />
                        <g transform={`translate(${left}, ${tempoH - 4})`}>
                            <text fontFamily="Georgia, serif" fontSize="9" fill="var(--at-muted)">
                                ♪
                            </text>
                            <text x={TEMPO_BPM_X} fontFamily="var(--at-font-mono)" fontSize="8" fill="var(--at-muted)">
                                = {bpm}
                            </text>
                        </g>
                    </g>,
                );
            }
        }
        return { ticks, labels, tempos };
    }, [W, safeTotal, compact, tempoMarkers, tempoH, trackY, labelY, labelFontSize]);

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

    const lastBar = safeTotal - 1;
    const shownBar = Math.max(0, Math.min(currentBar, lastBar));
    const seekBar = (bar: number) => {
        const target = Math.max(0, Math.min(bar, lastBar));
        if (onSeekBar) { onSeekBar(target); }
        else { onSeek?.(target / safeTotal); }
    };
    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const target =
            e.key === 'ArrowRight' || e.key === 'ArrowUp' ? shownBar + 1 :
            e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? shownBar - 1 :
            e.key === 'PageUp' ? shownBar + PAGE_BARS :
            e.key === 'PageDown' ? shownBar - PAGE_BARS :
            e.key === 'Home' ? 0 :
            e.key === 'End' ? lastBar :
            null;
        if (target === null) { return; }
        e.preventDefault();
        seekBar(target);
    };
    const slider = onSeek
        ? {
              role: 'slider',
              'aria-label': 'Playback position',
              'aria-valuemin': 1,
              'aria-valuemax': safeTotal,
              'aria-valuenow': shownBar + 1,
              'aria-valuetext': `Bar ${shownBar + 1} of ${safeTotal}`,
              tabIndex: 0,
              onKeyDown,
              onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
                  setDrag(true);
                  seekAtClientX(e.clientX);
              },
          }
        : {};

    return (
        <div
            ref={wrapperRef}
            style={{ width: '100%', cursor: onSeek ? 'pointer' : undefined, touchAction: 'none' }}
            {...slider}
        >
            {/* The viewBox matches the measured width; only the fallback width before measuring stretches. */}
            <svg
                viewBox={`0 0 ${W} ${H}`}
                preserveAspectRatio="none"
                style={{ display: 'block', width: '100%', height: `${H}px`, overflow: 'visible' }}
                aria-hidden="true"
            >
                {ruler.tempos}

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

                {ruler.ticks}
                {ruler.labels}

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
