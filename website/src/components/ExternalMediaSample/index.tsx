import * as alphaTab from "@coderline/alphatab";
import React, { useEffect, useRef } from "react";
import environment from "../../environment";
import './styles.module.scss'
import CodeBlock from '@theme/CodeBlock';

export type ExternalMediaSampleProps = {
    showCode?: boolean
}
export const ExternalMediaSample: React.FC<ExternalMediaSampleProps> = ({showCode}) => {

    const alphaTabWithExternalMedia = useRef<HTMLDivElement>(null);
    const audio = useRef<HTMLAudioElement>(null);
    const updateTimer = useRef<number>(0);


    const api = useRef<alphaTab.AlphaTabApi>(null);

    useEffect(() => {
        const settings = new alphaTab.Settings();
        environment.setAlphaTabDefaults(settings);
        settings.core.file = '/files/Bach_Prelude_BWV999.gp';
        settings.player.playerMode = alphaTab.PlayerMode.EnabledExternalMedia;
        settings.player.scrollMode = alphaTab.ScrollMode.Off;

        const newApi = new alphaTab.AlphaTabApi(alphaTabWithExternalMedia.current!, settings);

        // alphaTab works in milliseconds while HTML5 audio works with seconds

        // handler for alphaTab -> audio tag updates
        const handler: alphaTab.synth.IExternalMediaHandler = {
            get backingTrackDuration() {
                const duration = audio.current?.duration ?? 0;
                return Number.isFinite(duration) ? duration * 1000 : 0;
            },
            get playbackRate() {
                return audio.current?.playbackRate ?? 1;
            },
            set playbackRate(value) {
                if (audio.current) {
                    audio.current.playbackRate = value;
                }
            },
            get masterVolume() {
                return audio.current?.volume ?? 1;
            },
            set masterVolume(value) {
                if (audio.current) {
                    audio.current.volume = value;
                }
            },
            seekTo(time) {
                if (audio.current) {
                    audio.current.currentTime = time / 1000;
                }
            },
            play() {
                if (audio.current) {
                    audio.current.play();
                }
            },
            pause() {
                if (audio.current) {
                    audio.current.pause();
                }
            }
        };

        // handlers for audio tag -> alphaTab updates
        const onTimeUpdate = () => {
            (newApi!.player!.output as alphaTab.synth.IExternalMediaSynthOutput).updatePosition(
                audio.current!.currentTime * 1000
            );
        }

        // time
        audio.current!.addEventListener('timeupdate', () => {
            onTimeUpdate();
        });
        audio.current!.addEventListener('seeked', () => {
            onTimeUpdate();
        });
        audio.current!.addEventListener('play', () => {
            window.clearInterval(updateTimer.current);
            newApi.play();
            updateTimer.current = window.setInterval(() => {
                onTimeUpdate();
            }, 50);
        });

        // state
        audio.current!.addEventListener('pause', () => {
            newApi.pause();
            window.clearInterval(updateTimer.current);

        });
        audio.current!.addEventListener('ended', () => {
            newApi.pause();
            window.clearInterval(updateTimer.current);
        });
        audio.current!.addEventListener('volumechange', () => {
            newApi.masterVolume = audio.current!.volume;
        });
        audio.current!.addEventListener('ratechange', () => {
            newApi.playbackSpeed = audio.current!.playbackRate;
        });

        (newApi.player!.output as alphaTab.synth.IExternalMediaSynthOutput).handler = handler;

        api.current = newApi;

        return () => {
            window.clearInterval(updateTimer.current);
            newApi.destroy();
        };

    }, []);


    return <>
        <audio ref={audio} src="/files/Bach_Prelude_BWV999_original.ogg" controls={true} autoPlay={false} />
        <div ref={alphaTabWithExternalMedia} />
        {showCode !== false && <CodeBlock language="typescript" title="TypeScript Code for this sample">
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
                "        audio.currentTime = time / 1000;",
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
                "        audio.currentTime * 1000",
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
    </>
};