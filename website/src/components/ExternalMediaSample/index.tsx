import React, { useEffect, useRef } from "react";
import type * as alphaTab from "@coderline/alphatab";
import {
    AlphaTabPlayer,
    AlphaTabCanvas,
    useAlphaTabApi,
} from "@site/src/alphatab-react";
import CodeBlock from '@theme/CodeBlock';
import styles from './styles.module.scss';

export type ExternalMediaSampleProps = {
    /** Render a copy-pasteable code block below the demo. Defaults to `true`. */
    showCode?: boolean
}

const ExternalMediaBridge: React.FC<{ audio: React.RefObject<HTMLAudioElement | null> }> = ({ audio }) => {
    const api = useAlphaTabApi();
    const updateTimer = useRef<number>(0);

    useEffect(() => {
        if (!api || !audio.current) return;
        const audioEl = audio.current;

        // alphaTab works in milliseconds while HTML5 audio works with seconds

        // handler for alphaTab -> audio tag updates
        const handler: alphaTab.synth.IExternalMediaHandler = {
            get backingTrackDuration() {
                const duration = audioEl.duration ?? 0;
                return Number.isFinite(duration) ? duration * 1000 : 0;
            },
            get playbackRate() {
                return audioEl.playbackRate ?? 1;
            },
            set playbackRate(value) {
                audioEl.playbackRate = value;
            },
            get masterVolume() {
                return audioEl.volume ?? 1;
            },
            set masterVolume(value) {
                audioEl.volume = value;
            },
            seekTo(time) {
                audioEl.currentTime = (time * audioEl.playbackRate) / 1000;
            },
            play() {
                audioEl.play();
            },
            pause() {
                audioEl.pause();
            },
        };

        // handlers for audio tag -> alphaTab updates
        const onTimeUpdate = () => {
            (api.player!.output as alphaTab.synth.IExternalMediaSynthOutput).updatePosition(
                (audioEl.currentTime / audioEl.playbackRate) * 1000,
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
            api.masterVolume = audioEl.volume;
        };
        const onRateChange = () => {
            api.playbackSpeed = audioEl.playbackRate;
        };

        audioEl.addEventListener('timeupdate', onTimeUpdate);
        audioEl.addEventListener('seeked', onSeeked);
        audioEl.addEventListener('play', onPlay);
        audioEl.addEventListener('pause', onPause);
        audioEl.addEventListener('ended', onEnded);
        audioEl.addEventListener('volumechange', onVolumeChange);
        audioEl.addEventListener('ratechange', onRateChange);

        (api.player!.output as alphaTab.synth.IExternalMediaSynthOutput).handler = handler;

        return () => {
            window.clearInterval(updateTimer.current);
            audioEl.removeEventListener('timeupdate', onTimeUpdate);
            audioEl.removeEventListener('seeked', onSeeked);
            audioEl.removeEventListener('play', onPlay);
            audioEl.removeEventListener('pause', onPause);
            audioEl.removeEventListener('ended', onEnded);
            audioEl.removeEventListener('volumechange', onVolumeChange);
            audioEl.removeEventListener('ratechange', onRateChange);
        };
    }, [api, audio]);

    return null;
};

export const ExternalMediaSample: React.FC<ExternalMediaSampleProps> = ({ showCode = true }) => {
    const audio = useRef<HTMLAudioElement>(null);

    return (
        <div className={styles.wrapper}>
            <audio ref={audio} src="/files/Bach_Prelude_BWV999_original.ogg" controls={true} autoPlay={false} />
            <AlphaTabPlayer
                file="/files/Bach_Prelude_BWV999.gp"
                settings={{ player: { playerMode: 'EnabledExternalMedia' } }}
            >
                <ExternalMediaBridge audio={audio} />
                <AlphaTabCanvas />
            </AlphaTabPlayer>
            {showCode && <CodeBlock language="typescript" title="TypeScript Code for this sample">
                {[
                    "const audio = document.querySelector('#audio-element');",
                    "let updateTimer = 0;",
                    "",
                    "const settings = new alphaTab.Settings();",
                    "// enable the external media control",
                    "settings.player.playerMode = alphaTab.PlayerMode.EnabledExternalMedia;",
                    "",
                    "const api= new alphaTab.AlphaTabApi('#element', settings);",
                    "",
                    "// Note: alphaTab works in milliseconds while HTML5 audio works with seconds",
                    "",
                    "//",
                    "// handler for alphaTab -> audio tag updates",
                    "const handler: alphaTab.synth.IExternalMediaHandler = {",
                    "    get backingTrackDuration() {",
                    "        const duration = audio.duration;",
                    "        return Number.isFinite(duration) ? duration * 1000 : 0;",
                    "    },",
                    "    get playbackRate() {",
                    "        return audio.playbackRate;",
                    "    },",
                    "    set playbackRate(value) {",
                    "        audio.playbackRate = value;",
                    "    },",
                    "    get masterVolume() {",
                    "        return audio.volume;",
                    "    },",
                    "    set masterVolume(value) {",
                    "        audio.volume = value;",
                    "    },",
                    "    seekTo(time) {",
                    "        audio.currentTime = (time * audio.playbackRate) / 1000;",
                    "    },",
                    "    play() {",
                    "        audio.play();",
                    "    },",
                    "    pause() {",
                    "        audio.pause();",
                    "    }",
                    "};",
                    "(api.player!.output as alphaTab.synth.IExternalMediaSynthOutput).handler = handler;",
                    "",
                    "//",
                    "// handlers for audio tag -> alphaTab updates",
                    "const onTimeUpdate = () => {",
                    "    (api.player!.output as alphaTab.synth.IExternalMediaSynthOutput).updatePosition(",
                    "        (audio.currentTime / audio.playbackRate) * 1000",
                    "    );",
                    "}",
                    "",
                    "// time updates",
                    "audio.addEventListener('timeupdate', onTimeUpdate);",
                    "audio.addEventListener('seeked', onTimeUpdate);",
                    "audio.addEventListener('play', () => {",
                    "    window.clearInterval(updateTimer);",
                    "    newApi.play();",
                    "    updateTimer = window.setInterval(onTimeUpdate, 50);",
                    "});",
                    "",
                    "// state updates",
                    "audio.addEventListener('pause', () => {",
                    "    newApi.pause();",
                    "    window.clearInterval(updateTimer.current);",
                    "});",
                    "audio.addEventListener('ended', () => {",
                    "    newApi.pause();",
                    "    window.clearInterval(updateTimer.current);",
                    "});",
                    "audio.addEventListener('volumechange', () => {",
                    "    newApi.masterVolume = audio.volume;",
                    "});",
                    "audio.addEventListener('ratechange', () => {",
                    "    newApi.playbackSpeed = audio.playbackRate;",
                    "});",
                ].join('\n')}
            </CodeBlock>}
        </div>
    );
};
