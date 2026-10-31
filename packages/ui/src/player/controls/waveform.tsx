import * as alphaTab from '@coderline/alphatab';
import { useAlphaTabApi, useAlphaTabEvent } from '@coderline/alphatab-react';
import clsx from 'clsx';
import type React from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { type AudioPeaks, decodeAudioPeaks, peaksForWidth } from '../../state/peaks';
import styles from './waveform.module.scss';

const BAR_WIDTH = 2;
const BAR_GAP = 1;

function backingTrackAudio(api: alphaTab.AlphaTabApi): Uint8Array | null {
    if (api.actualPlayerMode !== alphaTab.PlayerMode.EnabledBackingTrack) {
        return null;
    }
    return api.score?.backingTrack?.rawAudioFile ?? null;
}

function draw(canvas: HTMLCanvasElement, peaks: AudioPeaks): void {
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    const ctx = canvas.getContext('2d');
    if (!ctx || width === 0) {
        return;
    }
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const bars = Math.max(1, Math.floor(width / (BAR_WIDTH + BAR_GAP)));
    const level = peaksForWidth(peaks.peaks, bars);
    const half = height / 2;
    ctx.beginPath();
    for (let bar = 0; bar < bars; bar++) {
        const from = Math.floor((bar / bars) * level.length);
        const to = Math.max(from + 1, Math.floor(((bar + 1) / bars) * level.length));
        let peak = 0;
        for (let i = from; i < to && i < level.length; i++) {
            peak = Math.max(peak, level[i]);
        }
        const barHeight = Math.max(1, Math.round(peak * half) * 2);
        ctx.roundRect(bar * (BAR_WIDTH + BAR_GAP), half - barHeight / 2, BAR_WIDTH, barHeight, 1);
    }
    ctx.fillStyle = getComputedStyle(canvas).color;
    ctx.fill();
}

/**
 * The waveform of the backing track while the player plays it, with the playback position; a
 * click seeks there. Renders nothing for the synthesizer or without backing-track audio. Must be
 * rendered inside `<PlayerProvider>`.
 */
export const BackingTrackWaveform: React.FC<{ className?: string }> = ({ className }) => {
    const api = useAlphaTabApi();
    const [audio, setAudio] = useState<Uint8Array | null>(null);
    const [peaks, setPeaks] = useState<AudioPeaks | null>(null);
    const [position, setPosition] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const refresh = () => setAudio(api ? backingTrackAudio(api) : null);
    useEffect(refresh, [api]);
    useAlphaTabEvent(api, 'scoreLoaded', refresh);
    useAlphaTabEvent(api, 'playerReady', refresh);
    useAlphaTabEvent(api, 'playerStateChanged', refresh);
    useAlphaTabEvent(api, 'playerPositionChanged', e => setPosition(e.currentTime));

    useEffect(() => {
        setPeaks(null);
        if (!audio) {
            return;
        }
        let cancelled = false;
        decodeAudioPeaks(audio)
            .then(decoded => {
                if (!cancelled) {
                    setPeaks(decoded);
                }
            })
            .catch((e: unknown) => console.error('[alphaTab-ui] The backing track could not be decoded', e));
        return () => {
            cancelled = true;
        };
    }, [audio]);

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !peaks) {
            return;
        }
        draw(canvas, peaks);
        const observer = new ResizeObserver(() => draw(canvas, peaks));
        observer.observe(canvas);
        return () => observer.disconnect();
    }, [peaks]);

    if (!audio || !peaks) {
        return null;
    }
    const fraction = peaks.durationMs > 0 ? Math.min(1, Math.max(0, position / peaks.durationMs)) : 0;

    return (
        // biome-ignore lint/a11y/useKeyWithClickEvents: a pointer shortcut; the scrubber seeks by keyboard
        // biome-ignore lint/a11y/noStaticElementInteractions: see above
        <div
            className={clsx(styles.waveform, className)}
            onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                if (api && rect.width > 0) {
                    api.timePosition = ((e.clientX - rect.left) / rect.width) * peaks.durationMs;
                }
            }}>
            <canvas ref={canvasRef} className={styles.canvas} role="img" aria-label="Backing track waveform" />
            <div className={styles.cursor} style={{ left: `${fraction * 100}%` }} />
        </div>
    );
};
