'use client';

import React, { useEffect, useRef, useState } from "react";
import * as alphaTab from "@coderline/alphatab";
import { useAlphaTab, useAlphaTabEvent } from "@site/src/hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as solid from "@fortawesome/free-solid-svg-icons";
import styles from "./styles.module.scss";

type BuiltInMode = "Continuous" | "OffScreen" | "Smooth" | "Off";
type Mode = BuiltInMode | "Center bar";

const BUILT_IN_MAP: Record<BuiltInMode, alphaTab.ScrollMode> = {
    Continuous: alphaTab.ScrollMode.Continuous,
    OffScreen: alphaTab.ScrollMode.OffScreen,
    Smooth: alphaTab.ScrollMode.Smooth,
    Off: alphaTab.ScrollMode.Off,
};

export interface ScrollModeSwitchProps {
    file?: string;
    tex?: string;
    modes?: BuiltInMode[];
    showOffsetSliders?: boolean;
    customHandler?: "center-bar";
    showCode?: boolean;
}

export const ScrollModeSwitch: React.FC<ScrollModeSwitchProps> = ({
    file,
    tex,
    modes = ["Continuous", "OffScreen", "Smooth", "Off"],
    showOffsetSliders = false,
    customHandler,
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const [api, element] = useAlphaTab((s) => {
        if (tex) {
            s.core.tex = true;
        } else if (file) {
            s.core.file = file;
        }
        s.player.playerMode = alphaTab.PlayerMode.EnabledAutomatic;
        s.player.scrollMode = alphaTab.ScrollMode.Continuous;
        s.player.scrollOffsetY = -40;
        // Point scrollElement at the bounded wrapper. The alphaTab UI facade
        // resolves and caches the scroll container during API construction,
        // so this must be assigned here — a post-mount update is ignored.
        if (scrollRef.current) {
            s.player.scrollElement = scrollRef.current;
        }
    });

    const pillModes: Mode[] =
        customHandler === "center-bar" ? [...modes, "Center bar"] : modes;
    const initialMode: Mode = showOffsetSliders ? "Continuous" : pillModes[0];
    const [mode, setMode] = useState<Mode>(initialMode);
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(-40);
    const [nativeSmooth, setNativeSmooth] = useState(true);
    const [isPlaying, setPlaying] = useState(false);

    useAlphaTabEvent(
        api,
        "playerStateChanged",
        (args: alphaTab.synth.PlayerStateChangedEventArgs) => {
            setPlaying(args.state === alphaTab.synth.PlayerState.Playing);
        }
    );

    useEffect(() => {
        if (!api) return;
        if (mode === "Center bar") {
            // Keep scrollMode non-Off — alphaTab's dispatch guards
            // `onBeatCursorUpdating` behind `scrollMode !== Off`, so a custom
            // handler wouldn't fire otherwise. The `??` in the dispatch means
            // the custom handler still takes precedence over the built-in one.
            api.settings.player.scrollMode = alphaTab.ScrollMode.Continuous;
            api.updateSettings();
            const scroller = scrollRef.current!;
            const centerBar = (
                bounds: alphaTab.rendering.BeatBounds,
                behavior: ScrollBehavior
            ) => {
                const bar = bounds.barBounds.masterBarBounds.realBounds;
                const containerHeight = scroller.clientHeight;
                const maxScroll = Math.max(
                    0,
                    scroller.scrollHeight - containerHeight
                );
                const target = Math.min(
                    maxScroll,
                    Math.max(0, bar.y - (containerHeight - bar.h) / 2)
                );
                scroller.scrollTo({ top: target, behavior });
            };
            api.customScrollHandler = {
                forceScrollTo(currentBeatBounds) {
                    centerBar(currentBeatBounds, "instant" as ScrollBehavior);
                },
                onBeatCursorUpdating(startBeat) {
                    centerBar(startBeat, "smooth");
                },
                [Symbol.dispose]() {},
            };
        } else {
            api.customScrollHandler = undefined;
            api.settings.player.scrollMode = BUILT_IN_MAP[mode];
            api.updateSettings();
        }
    }, [api, mode]);

    useEffect(() => {
        if (!api || !showOffsetSliders) return;
        api.settings.player.scrollOffsetX = offsetX;
        api.settings.player.scrollOffsetY = offsetY;
        api.updateSettings();
    }, [api, offsetX, offsetY, showOffsetSliders]);

    useEffect(() => {
        if (!api || !showOffsetSliders) return;
        api.settings.player.nativeBrowserSmoothScroll = nativeSmooth;
        api.updateSettings();
    }, [api, nativeSmooth, showOffsetSliders]);

    return (
        <div className={styles.wrapper}>
            <div className={styles.toolbar}>
                <button
                    className="button button--primary"
                    onClick={() => api?.playPause()}
                    aria-label={isPlaying ? "Pause" : "Play"}
                >
                    <FontAwesomeIcon icon={isPlaying ? solid.faPause : solid.faPlay} />
                </button>
                <button
                    className="button button--secondary"
                    onClick={() => api?.scrollToCursor()}
                >
                    Scroll to cursor
                </button>
                <ul className={`pills ${styles.pills}`}>
                    {pillModes.map((m) => (
                        <li
                            key={m}
                            className={`pills__item ${
                                mode === m ? "pills__item--active" : ""
                            }`}
                            onClick={() => setMode(m)}
                        >
                            {m}
                        </li>
                    ))}
                </ul>
            </div>
            {showOffsetSliders && (
                <div className={styles.sliders}>
                    <label>
                        scrollOffsetX
                        <input
                            type="range"
                            min={-200}
                            max={200}
                            value={offsetX}
                            onChange={(e) => setOffsetX(parseInt(e.target.value, 10))}
                        />
                        <span className={styles.value}>{offsetX}</span>
                    </label>
                    <label>
                        scrollOffsetY
                        <input
                            type="range"
                            min={-200}
                            max={200}
                            value={offsetY}
                            onChange={(e) => setOffsetY(parseInt(e.target.value, 10))}
                        />
                        <span className={styles.value}>{offsetY}</span>
                    </label>
                    <ul className={`pills ${styles.pills}`}>
                        <li
                            className={`pills__item ${
                                nativeSmooth ? "pills__item--active" : ""
                            }`}
                            onClick={() => setNativeSmooth(true)}
                        >
                            Native smooth
                        </li>
                        <li
                            className={`pills__item ${
                                !nativeSmooth ? "pills__item--active" : ""
                            }`}
                            onClick={() => setNativeSmooth(false)}
                        >
                            alphaTab timed
                        </li>
                    </ul>
                </div>
            )}
            <div className={styles.scroller} ref={scrollRef}>
                <div ref={element}>{tex}</div>
            </div>
        </div>
    );
};
