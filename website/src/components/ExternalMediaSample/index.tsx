import React, { useEffect, useRef } from "react";
import type * as alphaTab from "@coderline/alphatab";
import {
    AlphaTabPlayer,
    AlphaTabCanvas,
    useAlphaTabApi,
    useAlphaTabEvent,
} from "@site/src/alphatab-react";
import CodeBlock from '@theme/CodeBlock';
import styles from './styles.module.scss';

/**
 * Bach_Prelude_BWV999.gp is a 4-bar excerpt in 3/4 at tempo 80 → 9s of
 * score-time. The paired Bach_Prelude_BWV999.mp4 is ~10.22s. Without any
 * sync points on the score, the alphaTab cursor plays at score-tempo and
 * drifts ~12% ahead of the video. This helper applies linear sync points
 * that stretch the score's masterbars evenly across the media's actual
 * duration, so the cursor visibly rides the video.
 */
const applyLinearSyncPoints = (
    api: alphaTab.AlphaTabApi,
    mediaDurationMs: number,
) => {
    const score = api.score;
    if (!score || !mediaDurationMs || !Number.isFinite(mediaDurationMs)) { return; }
    const barCount = score.masterBars.length;
    if (barCount === 0) { return; }
    const points: alphaTab.model.FlatSyncPoint[] = [];
    for (let i = 0; i < barCount; i++) {
        points.push({
            barIndex: i,
            barPosition: 0,
            barOccurence: 0,
            millisecondOffset: (i / barCount) * mediaDurationMs,
        } as alphaTab.model.FlatSyncPoint);
    }
    // Anchor the tail so the last bar spans to the end of the media instead
    // of dangling.
    points.push({
        barIndex: barCount - 1,
        barPosition: 1,
        barOccurence: 0,
        millisecondOffset: mediaDurationMs,
    } as alphaTab.model.FlatSyncPoint);
    score.applyFlatSyncPoints(points);
    api.updateSyncPoints();
};

export type ExternalMediaSampleProps = {
    /** Which media element to use for the sync source. Defaults to `'audio'`. */
    mediaType?: 'audio' | 'video';
    /** URL of the media file. Defaults to the bundled Bach recording. */
    mediaSrc?: string;
    /** URL of the score to render. Defaults to the bundled Bach score. */
    scoreFile?: string;
    /** Render a copy-pasteable code block below the demo. Defaults to `true`. */
    showCode?: boolean;
}

const ExternalMediaBridge: React.FC<{
    media: React.RefObject<HTMLMediaElement | null>;
}> = ({ media }) => {
    const api = useAlphaTabApi();
    const updateTimer = useRef<number>(0);

    // Apply linear sync points once BOTH the score is loaded and the media
    // element has reported a valid duration. The two events race, so cache
    // whichever half arrives first and fire once both are present.
    const scoreLoadedRef = useRef(false);
    const durationMsRef = useRef(0);
    const syncAppliedRef = useRef(false);
    const tryApplySync = () => {
        if (!api || syncAppliedRef.current) { return; }
        if (!scoreLoadedRef.current || durationMsRef.current <= 0) { return; }
        applyLinearSyncPoints(api, durationMsRef.current);
        syncAppliedRef.current = true;
    };
    useAlphaTabEvent('scoreLoaded', () => {
        scoreLoadedRef.current = true;
        tryApplySync();
    });
    useEffect(() => {
        const el = media.current;
        if (!el) { return; }
        const onLoadedMeta = () => {
            const d = el.duration;
            if (Number.isFinite(d) && d > 0) {
                durationMsRef.current = d * 1000;
                tryApplySync();
            }
        };
        // Might already be ready
        onLoadedMeta();
        el.addEventListener('loadedmetadata', onLoadedMeta);
        el.addEventListener('durationchange', onLoadedMeta);
        return () => {
            el.removeEventListener('loadedmetadata', onLoadedMeta);
            el.removeEventListener('durationchange', onLoadedMeta);
        };
    }, [api, media]);

    useEffect(() => {
        if (!api || !media.current) { return; }
        const el = media.current;

        // alphaTab works in milliseconds while HTML5 media elements work in seconds

        // handler for alphaTab -> media element updates
        const handler: alphaTab.synth.IExternalMediaHandler = {
            get backingTrackDuration() {
                const duration = el.duration ?? 0;
                return Number.isFinite(duration) ? duration * 1000 : 0;
            },
            get playbackRate() {
                return el.playbackRate ?? 1;
            },
            set playbackRate(value) {
                el.playbackRate = value;
            },
            get masterVolume() {
                return el.volume ?? 1;
            },
            set masterVolume(value) {
                el.volume = value;
            },
            seekTo(time) {
                el.currentTime = (time * el.playbackRate) / 1000;
            },
            play() {
                el.play();
            },
            pause() {
                el.pause();
            },
        };

        // handlers for media element -> alphaTab updates
        const onTimeUpdate = () => {
            (api.player!.output as alphaTab.synth.IExternalMediaSynthOutput).updatePosition(
                (el.currentTime / el.playbackRate) * 1000,
            );
        };

        const onSeeked = () => onTimeUpdate();
        const onPlay = () => {
            window.clearInterval(updateTimer.current);
            api.play();
            updateTimer.current = window.setInterval(onTimeUpdate, 50);
        };
        const onPause = () => {
            api.pause();
            window.clearInterval(updateTimer.current);
        };
        const onEnded = () => {
            api.pause();
            window.clearInterval(updateTimer.current);
        };
        const onVolumeChange = () => {
            api.masterVolume = el.volume;
        };
        const onRateChange = () => {
            api.playbackSpeed = el.playbackRate;
        };

        el.addEventListener('timeupdate', onTimeUpdate);
        el.addEventListener('seeked', onSeeked);
        el.addEventListener('play', onPlay);
        el.addEventListener('pause', onPause);
        el.addEventListener('ended', onEnded);
        el.addEventListener('volumechange', onVolumeChange);
        el.addEventListener('ratechange', onRateChange);

        (api.player!.output as alphaTab.synth.IExternalMediaSynthOutput).handler = handler;

        return () => {
            window.clearInterval(updateTimer.current);
            el.removeEventListener('timeupdate', onTimeUpdate);
            el.removeEventListener('seeked', onSeeked);
            el.removeEventListener('play', onPlay);
            el.removeEventListener('pause', onPause);
            el.removeEventListener('ended', onEnded);
            el.removeEventListener('volumechange', onVolumeChange);
            el.removeEventListener('ratechange', onRateChange);
        };
    }, [api, media]);

    return null;
};

const DEFAULT_SCORE = '/files/Bach_Prelude_BWV999.gp';
const DEFAULT_AUDIO = '/files/Bach_Prelude_BWV999_original.ogg';
const DEFAULT_VIDEO = '/files/features/Bach_Prelude_BWV999.mp4';

export const ExternalMediaSample: React.FC<ExternalMediaSampleProps> = ({
    mediaType = 'audio',
    mediaSrc,
    scoreFile = DEFAULT_SCORE,
    showCode = true,
}) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const src = mediaSrc ?? (mediaType === 'video' ? DEFAULT_VIDEO : DEFAULT_AUDIO);
    const mediaRef = mediaType === 'video' ? videoRef : audioRef;

    return (
        <div className={styles.wrapper}>
            {mediaType === 'video' ? (
                <video ref={videoRef} src={src} controls playsInline className={styles.video} />
            ) : (
                <audio ref={audioRef} src={src} controls autoPlay={false} />
            )}
            <AlphaTabPlayer
                file={scoreFile}
                settings={{ player: { playerMode: 'EnabledExternalMedia' } }}
            >
                <ExternalMediaBridge media={mediaRef} />
                <AlphaTabCanvas />
            </AlphaTabPlayer>
            {showCode && <CodeBlock language="typescript" title="TypeScript Code for this sample">
                {[
                    `const media = document.querySelector('#${mediaType}-element');`,
                    "let updateTimer = 0;",
                    "",
                    "const settings = new alphaTab.Settings();",
                    "// enable the external media control",
                    "settings.player.playerMode = alphaTab.PlayerMode.EnabledExternalMedia;",
                    "",
                    "const api = new alphaTab.AlphaTabApi('#element', settings);",
                    "",
                    "// Note: alphaTab works in milliseconds while HTML5 media elements work in seconds",
                    "",
                    "// handler for alphaTab -> media element updates",
                    "const handler: alphaTab.synth.IExternalMediaHandler = {",
                    "    get backingTrackDuration() {",
                    "        const duration = media.duration;",
                    "        return Number.isFinite(duration) ? duration * 1000 : 0;",
                    "    },",
                    "    get playbackRate() { return media.playbackRate; },",
                    "    set playbackRate(value) { media.playbackRate = value; },",
                    "    get masterVolume() { return media.volume; },",
                    "    set masterVolume(value) { media.volume = value; },",
                    "    seekTo(time) {",
                    "        media.currentTime = (time * media.playbackRate) / 1000;",
                    "    },",
                    "    play() { media.play(); },",
                    "    pause() { media.pause(); },",
                    "};",
                    "(api.player!.output as alphaTab.synth.IExternalMediaSynthOutput).handler = handler;",
                    "",
                    "// media element -> alphaTab position updates",
                    "const onTimeUpdate = () => {",
                    "    (api.player!.output as alphaTab.synth.IExternalMediaSynthOutput).updatePosition(",
                    "        (media.currentTime / media.playbackRate) * 1000",
                    "    );",
                    "};",
                    "",
                    "media.addEventListener('timeupdate', onTimeUpdate);",
                    "media.addEventListener('seeked', onTimeUpdate);",
                    "media.addEventListener('play', () => {",
                    "    window.clearInterval(updateTimer);",
                    "    api.play();",
                    "    updateTimer = window.setInterval(onTimeUpdate, 50);",
                    "});",
                    "media.addEventListener('pause', () => {",
                    "    api.pause();",
                    "    window.clearInterval(updateTimer);",
                    "});",
                    "media.addEventListener('volumechange', () => { api.masterVolume = media.volume; });",
                    "media.addEventListener('ratechange', () => { api.playbackSpeed = media.playbackRate; });",
                ].join('\n')}
            </CodeBlock>}
        </div>
    );
};
