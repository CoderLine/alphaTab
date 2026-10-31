'use client';

import React, { useEffect, useState } from "react";
import type * as alphaTab from "@coderline/alphatab";
import { PlayerProvider, PlayerHost, usePlayerState } from "@coderline/alphatab-ui";
import { useAlphaTabApi } from "@coderline/alphatab-react";
import { useAlphaTabModule } from "@site/src/alphatab-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as solid from "@fortawesome/free-solid-svg-icons";
import styles from "./styles.module.scss";

type BuiltInMode = "Continuous" | "OffScreen" | "Smooth" | "Off";
type Mode = BuiltInMode | "Center bar";

export interface ScrollModeSwitchProps {
    file?: string;
    tex?: string;
    modes?: BuiltInMode[];
    showOffsetSliders?: boolean;
    customHandler?: "center-bar";
    showCode?: boolean;
}

/**
 * Switches between the built-in scroll modes and (optionally) a custom
 * "Center bar" handler. When "Center bar" is active alphaTab keeps
 * `scrollMode = Continuous` so its `onBeatCursorUpdating` dispatch still
 * fires — the guard skips the callback when `scrollMode === Off`.
 */
function ApplyScrollMode({ mode }: { mode: Mode }) {
    const api = useAlphaTabApi();
    const module = useAlphaTabModule();
    useEffect(() => {
        if (!api || !module) { return; }
        if (mode === "Center bar") {
            api.settings.player.scrollMode = module.ScrollMode.Continuous;
            api.updateSettings();
            const scroller = api.settings.player.scrollElement as HTMLElement | undefined;
            if (!(scroller instanceof HTMLElement)) { return; }
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
            return () => {
                api.customScrollHandler = undefined;
            };
        }
        api.customScrollHandler = undefined;
        api.settings.player.scrollMode = module.ScrollMode[mode];
        api.updateSettings();
    }, [api, module, mode]);
    return null;
}

function ApplyOffsets({
    offsetX,
    offsetY,
    nativeSmooth,
}: {
    offsetX: number;
    offsetY: number;
    nativeSmooth: boolean;
}) {
    const api = useAlphaTabApi();
    useEffect(() => {
        if (!api) { return; }
        api.settings.player.scrollOffsetX = offsetX;
        api.settings.player.scrollOffsetY = offsetY;
        api.updateSettings();
    }, [api, offsetX, offsetY]);
    useEffect(() => {
        if (!api) { return; }
        api.settings.player.nativeBrowserSmoothScroll = nativeSmooth;
        api.updateSettings();
    }, [api, nativeSmooth]);
    return null;
}

interface InnerProps {
    modes: BuiltInMode[];
    showOffsetSliders: boolean;
    customHandler?: "center-bar";
}

const Inner: React.FC<InnerProps> = ({ modes, showOffsetSliders, customHandler }) => {
    const api = useAlphaTabApi();
    const state = usePlayerState();

    const pillModes: Mode[] =
        customHandler === "center-bar" ? [...modes, "Center bar"] : modes;
    const initialMode: Mode = showOffsetSliders ? "Continuous" : pillModes[0];
    const [mode, setMode] = useState<Mode>(initialMode);
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(-40);
    const [nativeSmooth, setNativeSmooth] = useState(true);

    return (
        <div className={styles.wrapper}>
            <div className={styles.toolbar}>
                <button
                    className="button button--primary"
                    onClick={() => api?.playPause()}
                    aria-label={state.isPlaying ? "Pause" : "Play"}
                >
                    <FontAwesomeIcon icon={state.isPlaying ? solid.faPause : solid.faPlay} />
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
            <ApplyScrollMode mode={mode} />
            {showOffsetSliders && (
                <ApplyOffsets
                    offsetX={offsetX}
                    offsetY={offsetY}
                    nativeSmooth={nativeSmooth}
                />
            )}
            <PlayerHost className={styles.scroller} />
        </div>
    );
};

export const ScrollModeSwitch: React.FC<ScrollModeSwitchProps> = ({
    file,
    tex,
    modes = ["Continuous", "OffScreen", "Smooth", "Off"],
    showOffsetSliders = false,
    customHandler,
}) => {
    const settings: alphaTab.json.SettingsJson = {
        player: {
            scrollMode: "Continuous",
            scrollOffsetY: -40,
        },
    };

    return (
        <PlayerProvider file={file} tex={tex} settings={settings}>
            <Inner
                modes={modes}
                showOffsetSliders={showOffsetSliders}
                customHandler={customHandler}
            />
        </PlayerProvider>
    );
};
