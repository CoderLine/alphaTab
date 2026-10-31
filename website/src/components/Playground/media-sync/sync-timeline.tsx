import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { useColorMode } from '@docusaurus/theme-common';
import type { MediaElementLike } from '@coderline/alphatab-ui';
import { PEAK_BUCKET, type AudioAnalysis } from './model/audio';
import { canToggle, moveMarker, toggleMarker } from './model/edit';
import { isSyncPoint, type SyncMarker } from './model/timeline';
import styles from './media-sync.module.scss';

const PAD = 24;
const RULER_HEIGHT = 20;
const MIN_ZOOM = 2;
const MAX_ZOOM = 600;
const DRAG_THRESHOLD_PX = 3;
const USER_SCROLL_GRACE_MS = 1500;

export const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

export interface SyncTimelineHandle {
    /** Changes the zoom while keeping the time at the viewport center in place. */
    zoomBy: (factor: number) => void;
    fit: () => void;
}

interface SyncTimelineProps {
    markers: SyncMarker[];
    durationMs: number;
    analysis: AudioAnalysis | null;
    media: MediaElementLike | null;
    zoom: number;
    onZoomChange: (zoom: number) => void;
    onCommit: (markers: SyncMarker[]) => void;
    handleRef?: React.Ref<SyncTimelineHandle>;
}

function formatRulerTime(ms: number, step: number): string {
    const total = ms / 1000;
    const minutes = Math.floor(total / 60);
    const seconds = total - minutes * 60;
    const text = step < 1 ? seconds.toFixed(step < 0.5 ? 2 : 1).padStart(step < 0.5 ? 5 : 4, '0') : String(Math.round(seconds)).padStart(2, '0');
    return `${minutes}:${text}`;
}

const RULER_STEPS = [0.1, 0.25, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300];

function readColors(el: Element) {
    const css = getComputedStyle(el);
    const v = (name: string) => css.getPropertyValue(name).trim();
    return { wave: v('--at-accent'), muted: v('--at-muted'), line: v('--at-line'), ink: v('--at-ink-soft') };
}

/** The scrollable media timeline: ruler, waveform, sync markers and playhead. */
export const SyncTimeline: React.FC<SyncTimelineProps> = ({
    markers,
    durationMs,
    analysis,
    media,
    zoom,
    onZoomChange,
    onCommit,
    handleRef,
}) => {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const playheadRef = useRef<HTMLDivElement>(null);
    const { colorMode } = useColorMode();
    const pxPerMs = zoom / 1000;
    const contentWidth = Math.ceil(PAD * 2 + durationMs * pxPerMs);

    const [preview, setPreview] = useState<SyncMarker[] | null>(null);
    const [selected, setSelected] = useState(0);
    const shown = preview ?? markers;
    const lastUserScroll = useRef(0);
    const zoomAnchor = useRef<{ time: number; offset: number } | null>(null);

    // ─── Zoom ─────────────────────────────────────────────────────
    const zoomAround = useCallback(
        (next: number, offset?: number) => {
            const scroller = scrollerRef.current;
            if (!scroller) { return; }
            const anchorOffset = offset ?? scroller.clientWidth / 2;
            zoomAnchor.current = { time: (scroller.scrollLeft + anchorOffset - PAD) / pxPerMs, offset: anchorOffset };
            onZoomChange(clampZoom(next));
        },
        [pxPerMs, onZoomChange],
    );

    useLayoutEffect(() => {
        const scroller = scrollerRef.current;
        const anchor = zoomAnchor.current;
        if (!scroller || !anchor) { return; }
        zoomAnchor.current = null;
        scroller.scrollLeft = PAD + anchor.time * pxPerMs - anchor.offset;
    }, [pxPerMs]);

    React.useImperativeHandle(
        handleRef,
        () => ({
            zoomBy: (factor) => zoomAround(zoom * factor),
            fit: () => {
                const scroller = scrollerRef.current;
                if (!scroller || durationMs <= 0) { return; }
                onZoomChange(clampZoom(((scroller.clientWidth - PAD * 2) / durationMs) * 1000));
                scroller.scrollLeft = 0;
            },
        }),
        [zoomAround, zoom, durationMs, onZoomChange],
    );

    useEffect(() => {
        const scroller = scrollerRef.current;
        if (!scroller) { return; }
        // Ctrl/⌘ + wheel zooms around the pointer; React's wheel listener is passive and cannot prevent the page zoom.
        const onWheel = (e: WheelEvent) => {
            if (!e.ctrlKey && !e.metaKey) { return; }
            e.preventDefault();
            const rect = scroller.getBoundingClientRect();
            zoomAround(zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15), e.clientX - rect.left);
        };
        scroller.addEventListener('wheel', onWheel, { passive: false });
        return () => scroller.removeEventListener('wheel', onWheel);
    }, [zoom, zoomAround]);

    // ─── Canvas: ruler + waveform for the visible range only ─────
    const colors = useRef<ReturnType<typeof readColors> | null>(null);
    useEffect(() => {
        colors.current = null;
    }, [colorMode]);

    const frame = useRef(0);
    const draw = useCallback(() => {
        const scroller = scrollerRef.current;
        const canvas = canvasRef.current;
        if (!scroller || !canvas) { return; }
        const width = scroller.clientWidth;
        const height = scroller.clientHeight;
        const dpr = window.devicePixelRatio || 1;
        if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx) { return; }
        colors.current ??= readColors(canvas);
        const c = colors.current;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);
        const left = scroller.scrollLeft;
        const timeAt = (x: number) => (left + x - PAD) / pxPerMs;

        // Ruler
        const step = RULER_STEPS.find((s) => s * zoom >= 80) ?? RULER_STEPS[RULER_STEPS.length - 1];
        const stepMs = step * 1000;
        ctx.font = '10px ui-monospace, "JetBrains Mono", Menlo, monospace';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = c.muted;
        ctx.strokeStyle = c.line;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let t = Math.max(0, Math.floor(timeAt(0) / stepMs) * stepMs); t <= Math.min(durationMs, timeAt(width)); t += stepMs) {
            const x = Math.round(PAD + t * pxPerMs - left) + 0.5;
            ctx.moveTo(x, RULER_HEIGHT - 6);
            ctx.lineTo(x, RULER_HEIGHT);
            ctx.fillText(formatRulerTime(t, step), x + 4, RULER_HEIGHT / 2);
        }
        ctx.moveTo(0, RULER_HEIGHT + 0.5);
        ctx.lineTo(width, RULER_HEIGHT + 0.5);
        ctx.stroke();

        // Waveform
        if (!analysis) { return; }
        const samplesPerPx = analysis.sampleRate / zoom;
        const level = Math.min(analysis.peaks.length - 1, Math.max(0, Math.floor(Math.log2(samplesPerPx / PEAK_BUCKET))));
        const peaks = analysis.peaks[level];
        const bucketSamples = PEAK_BUCKET * 2 ** level;
        const toBucket = (ms: number) => (ms / 1000) * (analysis.sampleRate / bucketSamples);
        const mid = RULER_HEIGHT + (height - RULER_HEIGHT) / 2;
        const half = (height - RULER_HEIGHT) / 2 - 6;
        ctx.fillStyle = c.wave;
        ctx.globalAlpha = 0.45;
        for (let x = 0; x < width; x++) {
            const from = Math.floor(toBucket(timeAt(x)));
            const to = Math.max(from + 1, Math.floor(toBucket(timeAt(x + 1))));
            if (to <= 0 || from >= peaks.length) { continue; }
            let peak = 0;
            for (let b = Math.max(0, from); b < Math.min(peaks.length, to); b++) { if (peaks[b] > peak) { peak = peaks[b]; } }
            const h = Math.max(1, peak * half);
            ctx.fillRect(x, mid - h, 1, h * 2);
        }
        ctx.globalAlpha = 1;
    }, [analysis, durationMs, pxPerMs, zoom]);

    const scheduleDraw = useCallback(() => {
        if (frame.current) { return; }
        frame.current = requestAnimationFrame(() => {
            frame.current = 0;
            draw();
        });
    }, [draw]);

    useEffect(() => {
        scheduleDraw();
    }, [scheduleDraw, colorMode]);

    useEffect(() => {
        const scroller = scrollerRef.current;
        if (!scroller) { return; }
        const observer = new ResizeObserver(scheduleDraw);
        observer.observe(scroller);
        return () => {
            observer.disconnect();
            cancelAnimationFrame(frame.current);
            frame.current = 0;
        };
    }, [scheduleDraw]);

    // ─── Playhead ─────────────────────────────────────────────────
    const placePlayhead = useCallback(
        (follow: boolean) => {
            const head = playheadRef.current;
            const scroller = scrollerRef.current;
            if (!head || !scroller || !media) { return; }
            const x = PAD + media.currentTime * 1000 * pxPerMs;
            head.style.transform = `translateX(${x}px)`;
            if (!follow || performance.now() - lastUserScroll.current < USER_SCROLL_GRACE_MS) { return; }
            const view = scroller.clientWidth;
            if (x < scroller.scrollLeft + view * 0.05 || x > scroller.scrollLeft + view * 0.85) {
                scroller.scrollLeft = x - view * 0.2;
            }
        },
        [media, pxPerMs],
    );

    useEffect(() => {
        if (!media) { return; }
        let raf = 0;
        const loop = () => {
            placePlayhead(true);
            raf = requestAnimationFrame(loop);
        };
        const start = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(loop);
        };
        const stop = () => {
            cancelAnimationFrame(raf);
            placePlayhead(false);
        };
        const update = () => placePlayhead(false);
        media.addEventListener('play', start);
        media.addEventListener('pause', stop);
        media.addEventListener('ended', stop);
        media.addEventListener('seeked', update);
        media.addEventListener('timeupdate', update);
        if (media.paused) { update(); }
        else { start(); }
        return () => {
            cancelAnimationFrame(raf);
            media.removeEventListener('play', start);
            media.removeEventListener('pause', stop);
            media.removeEventListener('ended', stop);
            media.removeEventListener('seeked', update);
            media.removeEventListener('timeupdate', update);
        };
    }, [media, placePlayhead]);

    const seek = (ms: number) => {
        if (media) { media.currentTime = Math.max(0, ms) / 1000; }
    };

    // ─── Marker interaction ──────────────────────────────────────
    const drag = useRef<{ index: number; startX: number; startTime: number; moved: boolean } | null>(null);
    const markerEls = useRef(new Map<number, HTMLButtonElement>());

    const beatSpacing = useMemo(() => {
        if (markers.length < 2) { return Infinity; }
        return ((markers[markers.length - 1].syncTime - markers[0].syncTime) / (markers.length - 1)) * pxPerMs;
    }, [markers, pxPerMs]);
    const showBeats = beatSpacing >= 8;
    const showBarLabels = beatSpacing * 4 >= 26;

    const select = (index: number) => {
        const clamped = Math.max(0, Math.min(markers.length - 1, index));
        setSelected(clamped);
        const el = markerEls.current.get(clamped);
        el?.focus({ preventScroll: true });
        el?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    };

    const onMarkerPointerDown = (e: React.PointerEvent, index: number) => {
        if (e.button !== 0) { return; }
        e.preventDefault();
        e.stopPropagation();
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        drag.current = { index, startX: e.clientX, startTime: markers[index].syncTime, moved: false };
        setSelected(index);
        (e.currentTarget as HTMLElement).focus({ preventScroll: true });
    };

    const onMarkerPointerMove = (e: React.PointerEvent) => {
        const d = drag.current;
        if (!d) { return; }
        const dx = e.clientX - d.startX;
        if (!d.moved && Math.abs(dx) < DRAG_THRESHOLD_PX) { return; }
        d.moved = true;
        setPreview(moveMarker(markers, d.index, d.startTime + dx / pxPerMs));
    };

    const onMarkerPointerUp = () => {
        const d = drag.current;
        drag.current = null;
        if (!d) { return; }
        if (d.moved && preview) { onCommit(preview); }
        else { seek(markers[d.index].syncTime); }
        setPreview(null);
    };

    const onMarkerKeyDown = (e: React.KeyboardEvent, index: number) => {
        const marker = markers[index];
        if (e.key === 'Escape' && drag.current) {
            drag.current = null;
            setPreview(null);
            return;
        }
        if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && e.altKey) {
            e.preventDefault();
            const delta = (e.shiftKey ? 100 : 10) * (e.key === 'ArrowLeft' ? -1 : 1);
            onCommit(moveMarker(markers, index, marker.syncTime + delta));
            return;
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            const direction = e.key === 'ArrowLeft' ? -1 : 1;
            let next = index + direction;
            // Shift jumps between sync points; hidden beat markers are skipped.
            while (
                next > 0 &&
                next < markers.length - 1 &&
                ((e.shiftKey && !isSyncPoint(markers[next])) || (!showBeats && markers[next].kind === 'beat' && !isSyncPoint(markers[next])))
            ) {
                next += direction;
            }
            select(next);
            return;
        }
        if (e.key === 'Home' || e.key === 'End') {
            e.preventDefault();
            select(e.key === 'Home' ? 0 : markers.length - 1);
            return;
        }
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (canToggle(markers, index)) { onCommit(toggleMarker(markers, index)); }
        }
    };

    return (
        <div
            ref={scrollerRef}
            className={styles.scroller}
            onScroll={() => {
                scheduleDraw();
            }}
            onPointerDown={() => {
                lastUserScroll.current = performance.now();
            }}
            onWheel={() => {
                lastUserScroll.current = performance.now();
            }}
        >
            <div className={styles.content} style={{ width: contentWidth }}>
                <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
                <div
                    className={styles.lane}
                    onPointerDown={(e) => {
                        if (e.target !== e.currentTarget || e.button !== 0) { return; }
                        const rect = e.currentTarget.getBoundingClientRect();
                        seek((e.clientX - rect.left - PAD) / pxPerMs);
                    }}
                    role="group"
                    aria-label="Sync points. Arrow keys select a marker, Alt+arrows move it, Enter toggles it."
                >
                    {shown.map((marker, index) => {
                        const active = isSyncPoint(marker);
                        if (!active && marker.kind === 'beat' && !showBeats) { return null; }
                        const x = PAD + marker.syncTime * pxPerMs;
                        const bar = marker.masterBarIndex + 1;
                        const repeat = marker.occurence > 0 ? `, repeat ${marker.occurence + 1}` : '';
                        const label =
                            marker.kind === 'end'
                                ? 'End of song'
                                : `Bar ${bar}${repeat}${marker.beat > 0 ? `, beat ${marker.beat + 1}` : ''}`;
                        const bpm = active ? ` · ♩=${marker.syncBpm!.toFixed(1)}` : '';
                        return (
                            <button
                                key={marker.id}
                                ref={(el) => {
                                    if (el) { markerEls.current.set(index, el); }
                                    else { markerEls.current.delete(index); }
                                }}
                                type="button"
                                tabIndex={index === selected ? 0 : -1}
                                className={clsx(
                                    styles.marker,
                                    active ? styles.markerSync : marker.kind === 'beat' ? styles.markerBeat : styles.markerBar,
                                    marker.kind === 'start' && styles.markerStart,
                                    marker.kind === 'end' && styles.markerEnd,
                                    index === selected && styles.markerSelected,
                                    preview && drag.current?.index === index && styles.markerDragging,
                                )}
                                style={{ transform: `translateX(${x}px)` }}
                                aria-label={`${label}${active ? ', sync point' : ''} at ${(marker.syncTime / 1000).toFixed(3)} s`}
                                aria-pressed={active}
                                title={`${label} · ${(marker.syncTime / 1000).toFixed(3)} s${bpm}\nDrag to move, double-click to ${active ? 'remove' : 'add'} sync point`}
                                onPointerDown={(e) => onMarkerPointerDown(e, index)}
                                onPointerMove={onMarkerPointerMove}
                                onPointerUp={onMarkerPointerUp}
                                onPointerCancel={() => {
                                    drag.current = null;
                                    setPreview(null);
                                }}
                                onDoubleClick={() => canToggle(markers, index) && onCommit(toggleMarker(markers, index))}
                                onKeyDown={(e) => onMarkerKeyDown(e, index)}
                                onFocus={() => setSelected(index)}
                            >
                                <span className={styles.markerLine} />
                                {(active || (marker.kind !== 'beat' && showBarLabels)) && (
                                    <span className={styles.markerLabel}>{marker.kind === 'end' ? 'end' : bar}</span>
                                )}
                            </button>
                        );
                    })}
                </div>
                {media && <div ref={playheadRef} className={styles.playhead} aria-hidden="true" />}
            </div>
        </div>
    );
};
