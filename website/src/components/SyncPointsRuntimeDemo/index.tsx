import React, { useEffect, useRef, useState } from 'react';
import type * as alphaTab from '@coderline/alphatab';
import {
    AlphaTabPlayer,
    AlphaTabCanvas,
    useAlphaTabApi,
    useAlphaTabEvent,
} from '@site/src/alphatab-react';
import styles from './styles.module.scss';

/**
 * Sync-points-at-runtime demo: shows FlatSyncPoint application on a live
 * alphaTab instance driven by an HTML5 <audio> element. Two preset shapes
 * are exposed so the reader can flip between them and hear the cursor
 * ride the audio differently.
 *
 * - "Linear" stretches the 4 score bars evenly across the audio duration.
 * - "Back-loaded" spends 70% of the audio on the first 2 bars and 30% on
 *   the last 2 bars — a nonlinear map that visibly changes how the cursor
 *   advances relative to the constant-tempo audio.
 */
type Shape = 'linear' | 'backloaded';

const SCORE_URL = '/files/Bach_Prelude_BWV999.gp';
const AUDIO_URL = '/files/Bach_Prelude_BWV999_original.ogg';

const buildPoints = (
    shape: Shape,
    barCount: number,
    mediaDurationMs: number,
): alphaTab.model.FlatSyncPoint[] => {
    const anchors: number[] = [];
    if (shape === 'linear') {
        for (let i = 0; i < barCount; i++) {
            anchors.push((i / barCount) * mediaDurationMs);
        }
    } else {
        // 70% of media covers first half of bars, 30% covers second half.
        const half = Math.floor(barCount / 2);
        for (let i = 0; i < half; i++) {
            anchors.push((i / half) * mediaDurationMs * 0.7);
        }
        for (let i = half; i < barCount; i++) {
            anchors.push(mediaDurationMs * 0.7 + ((i - half) / (barCount - half)) * mediaDurationMs * 0.3);
        }
    }
    const points: alphaTab.model.FlatSyncPoint[] = anchors.map((ms, i) => ({
        barIndex: i,
        barPosition: 0,
        barOccurence: 0,
        millisecondOffset: ms,
    } as alphaTab.model.FlatSyncPoint));
    // Tail anchor at end-of-last-bar.
    points.push({
        barIndex: barCount - 1,
        barPosition: 1,
        barOccurence: 0,
        millisecondOffset: mediaDurationMs,
    } as alphaTab.model.FlatSyncPoint);
    return points;
};

const InnerBridge: React.FC<{
    audio: React.RefObject<HTMLAudioElement | null>;
    shape: Shape;
}> = ({ audio, shape }) => {
    const api = useAlphaTabApi();
    const updateTimer = useRef<number>(0);
    const scoreLoadedRef = useRef(false);
    const durationMsRef = useRef(0);

    const applyShape = () => {
        if (!api || !api.score || durationMsRef.current <= 0 || !scoreLoadedRef.current) return;
        const points = buildPoints(shape, api.score.masterBars.length, durationMsRef.current);
        api.score.applyFlatSyncPoints(points);
        api.updateSyncPoints();
    };

    useAlphaTabEvent('scoreLoaded', () => {
        scoreLoadedRef.current = true;
        applyShape();
    });

    // Reapply whenever the shape prop changes.
    useEffect(() => { applyShape(); }, [shape, api]);

    // Wire the HTML5-audio ↔ alphaTab bridge (same shape as ExternalMediaSample).
    useEffect(() => {
        if (!api || !audio.current) return;
        const el = audio.current;
        const handler: alphaTab.synth.IExternalMediaHandler = {
            get backingTrackDuration() {
                const d = el.duration ?? 0;
                return Number.isFinite(d) ? d * 1000 : 0;
            },
            get playbackRate() { return el.playbackRate ?? 1; },
            set playbackRate(v) { el.playbackRate = v; },
            get masterVolume() { return el.volume ?? 1; },
            set masterVolume(v) { el.volume = v; },
            seekTo(t) { el.currentTime = t / 1000; },
            play() { el.play(); },
            pause() { el.pause(); },
        };
        const onTimeUpdate = () => {
            (api.player!.output as alphaTab.synth.IExternalMediaSynthOutput).updatePosition(el.currentTime * 1000);
        };
        const onSeeked = () => onTimeUpdate();
        const onPlay = () => {
            window.clearInterval(updateTimer.current);
            api.play();
            updateTimer.current = window.setInterval(onTimeUpdate, 50);
        };
        const onPause = () => { api.pause(); window.clearInterval(updateTimer.current); };
        const onEnded = () => { api.pause(); window.clearInterval(updateTimer.current); };
        const onLoadedMeta = () => {
            const d = el.duration;
            if (Number.isFinite(d) && d > 0) {
                durationMsRef.current = d * 1000;
                applyShape();
            }
        };
        onLoadedMeta();
        el.addEventListener('timeupdate', onTimeUpdate);
        el.addEventListener('seeked', onSeeked);
        el.addEventListener('play', onPlay);
        el.addEventListener('pause', onPause);
        el.addEventListener('ended', onEnded);
        el.addEventListener('loadedmetadata', onLoadedMeta);
        el.addEventListener('durationchange', onLoadedMeta);
        (api.player!.output as alphaTab.synth.IExternalMediaSynthOutput).handler = handler;
        return () => {
            window.clearInterval(updateTimer.current);
            el.removeEventListener('timeupdate', onTimeUpdate);
            el.removeEventListener('seeked', onSeeked);
            el.removeEventListener('play', onPlay);
            el.removeEventListener('pause', onPause);
            el.removeEventListener('ended', onEnded);
            el.removeEventListener('loadedmetadata', onLoadedMeta);
            el.removeEventListener('durationchange', onLoadedMeta);
        };
    }, [api, audio]);

    return null;
};

export const SyncPointsRuntimeDemo: React.FC = () => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [shape, setShape] = useState<Shape>('linear');
    return (
        <div className={styles.wrapper}>
            <audio ref={audioRef} src={AUDIO_URL} controls />
            <div className={styles.controls}>
                <label>
                    <input
                        type="radio"
                        name="shape"
                        checked={shape === 'linear'}
                        onChange={() => setShape('linear')}
                    />
                    <span>Linear map</span>
                </label>
                <label>
                    <input
                        type="radio"
                        name="shape"
                        checked={shape === 'backloaded'}
                        onChange={() => setShape('backloaded')}
                    />
                    <span>Back-loaded (70/30)</span>
                </label>
                <span className={styles.badge}>
                    Playing: <code>{shape}</code> — flip while paused or during playback; the cursor re-aligns immediately.
                </span>
            </div>
            <AlphaTabPlayer
                file={SCORE_URL}
                settings={{ player: { playerMode: 'EnabledExternalMedia' } }}
            >
                <InnerBridge audio={audioRef} shape={shape} />
                <AlphaTabCanvas />
            </AlphaTabPlayer>
        </div>
    );
};
