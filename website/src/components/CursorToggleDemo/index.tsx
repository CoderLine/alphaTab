'use client';

import React, { useEffect, useState } from "react";
import * as alphaTab from "@coderline/alphatab";
import {
    AlphaTabHost,
    AlphaTabProvider,
    useAlphaTabApi,
    useAlphaTabEventValue,
} from "@coderline/alphatab-react";
import { IconPause, IconPlay } from "@coderline/alphatab-ui";
import { useSiteAlphaTabSettings } from "@site/src/alphatab-settings";
import styles from "./styles.module.scss";

export interface CursorToggleDemoProps {
    file?: string;
    tex?: string;
    showThemeToggle?: boolean;
    showAnimationToggle?: boolean;
    showCustomHandlerToggle?: boolean;
    showCode?: boolean;
}

type CursorTheme = "default" | "neon" | "highlighter";

const themeClass: Record<CursorTheme, string> = {
    default: styles.themeDefault,
    neon: styles.themeNeon,
    highlighter: styles.themeHighlighter,
};

/**
 * Applies the three cursor-related settings toggles. The animation toggle
 * carries a library-bug workaround (see the comment below) that must stay
 * until alphaTab 1.9.0 ships and refreshes the resolved cursor handler on
 * `updateSettings()` alone.
 */
function ApplyCursorSettings({
    enableCursor,
    enableHighlight,
    enableAnimation,
    manageAnimation,
}: {
    enableCursor: boolean;
    enableHighlight: boolean;
    enableAnimation: boolean;
    manageAnimation: boolean;
}) {
    const api = useAlphaTabApi();
    useEffect(() => {
        if (!api) { return; }
        api.settings.player.enableCursor = enableCursor;
        api.updateSettings();
    }, [api, enableCursor]);
    useEffect(() => {
        if (!api) { return; }
        api.settings.player.enableElementHighlighting = enableHighlight;
        api.updateSettings();
    }, [api, enableHighlight]);
    useEffect(() => {
        if (!api || !manageAnimation) { return; }
        api.settings.player.enableAnimatedBeatCursor = enableAnimation;
        api.updateSettings();
        // WORKAROUND (upstream library bug — remove once alphaTab 1.9.0 lands):
        // alphaTab caches the resolved cursor handler in `_updateCursorHandler`
        // and does not re-evaluate it when only `enableAnimatedBeatCursor`
        // toggles, so calling `updateSettings()` alone leaves the animated
        // behavior stuck. Reassigning `customCursorHandler` — even to
        // `undefined` — forces the internal handler swap. Assign a
        // non-animating placeholder when animation is off, clear it back to
        // `undefined` when it's on.
        if (enableAnimation) {
            api.customCursorHandler = undefined;
        } else {
            const nonAnimatingHandler = {
                onAttach() {},
                onDetach() {},
                placeBarCursor(barCursor: any, beatBounds: any) {
                    const b = beatBounds.barBounds.masterBarBounds.visualBounds;
                    barCursor.setBounds(b.x, b.y, b.w, b.h);
                },
                placeBeatCursor(beatCursor: any, beatBounds: any) {
                    const b = beatBounds.barBounds.masterBarBounds.visualBounds;
                    beatCursor.transitionToX(0, beatBounds.onNotesX);
                    beatCursor.setBounds(beatBounds.onNotesX, b.y, 1, b.h);
                },
                transitionBeatCursor(beatCursor: any, beatBounds: any) {
                    const b = beatBounds.barBounds.masterBarBounds.visualBounds;
                    beatCursor.transitionToX(0, beatBounds.onNotesX);
                    beatCursor.setBounds(beatBounds.onNotesX, b.y, 1, b.h);
                },
            };
            api.customCursorHandler = nonAnimatingHandler as any;
        }
    }, [api, enableAnimation, manageAnimation]);
    return null;
}

/**
 * Custom cursor handler: a bouncing pill adorner riding above the beat
 * cursor. When attached, swaps out the default placement so the demo has
 * a visibly different behavior.
 */
function AttachCustomCursor({ attached }: { attached: boolean }) {
    const api = useAlphaTabApi();
    useEffect(() => {
        if (!api) { return; }
        if (!attached) {
            api.customCursorHandler = undefined;
            return;
        }

        let adorner: HTMLDivElement | undefined;

        const handler = {
            onAttach(cursors: any) {
                adorner = document.createElement("div");
                adorner.className = styles.cursorPill;
                adorner.textContent = "beat";
                cursors.cursorWrapper.element.appendChild(adorner);
            },
            onDetach() {
                adorner?.remove();
                adorner = undefined;
            },
            placeBarCursor(barCursor: any, beatBounds: any) {
                const b = beatBounds.barBounds.masterBarBounds.visualBounds;
                barCursor.setBounds(b.x, b.y, b.w, b.h);
            },
            placeBeatCursor(beatCursor: any, beatBounds: any, startBeatX: number) {
                const b = beatBounds.barBounds.masterBarBounds.visualBounds;
                beatCursor.transitionToX(0, startBeatX);
                beatCursor.setBounds(startBeatX, b.y, 1, b.h);
                if (adorner) {
                    adorner.style.transition = "none";
                    adorner.style.transform = `translate(${startBeatX - 22}px, ${b.y - 26}px)`;
                }
            },
            transitionBeatCursor(
                beatCursor: any,
                beatBounds: any,
                _startBeatX: number,
                nextBeatX: number,
                duration: number
            ) {
                beatCursor.transitionToX(duration, nextBeatX);
                if (adorner) {
                    const b = beatBounds.barBounds.masterBarBounds.visualBounds;
                    adorner.style.transition = `transform ${duration}ms cubic-bezier(.4, -0.4, .6, 1.4)`;
                    adorner.style.transform = `translate(${nextBeatX - 22}px, ${b.y - 26}px)`;
                }
            },
        };
        api.customCursorHandler = handler as any;

        return () => {
            api.customCursorHandler = undefined;
        };
    }, [api, attached]);
    return null;
}

interface InnerProps {
    showThemeToggle: boolean;
    showAnimationToggle: boolean;
    showCustomHandlerToggle: boolean;
}

const Inner: React.FC<InnerProps> = ({
    showThemeToggle,
    showAnimationToggle,
    showCustomHandlerToggle,
}) => {
    const api = useAlphaTabApi();
    const isPlaying =
        useAlphaTabEventValue(
            "playerStateChanged",
            (e) => e.state === alphaTab.synth.PlayerState.Playing,
        ) ?? false;

    const [enableCursor, setEnableCursor] = useState(true);
    const [enableHighlight, setEnableHighlight] = useState(true);
    const [enableAnimation, setEnableAnimation] = useState(true);
    const [customHandlerAttached, setCustomHandlerAttached] = useState(
        showCustomHandlerToggle
    );
    const [theme, setTheme] = useState<CursorTheme>("default");

    return (
        <div className={`${styles.wrapper} ${themeClass[theme]}`}>
            <div className={styles.toolbar}>
                <button
                    className="button button--primary"
                    onClick={() => api?.playPause()}
                    aria-label={isPlaying ? "Pause" : "Play"}
                >
                    {isPlaying ? <IconPause aria-hidden="true" /> : <IconPlay aria-hidden="true" />}
                </button>
                <label className={styles.checkbox}>
                    <input
                        type="checkbox"
                        checked={enableCursor}
                        onChange={(e) => setEnableCursor(e.target.checked)}
                    />
                    <span>Bar &amp; beat cursor</span>
                </label>
                <label className={styles.checkbox}>
                    <input
                        type="checkbox"
                        checked={enableHighlight}
                        onChange={(e) => setEnableHighlight(e.target.checked)}
                    />
                    <span>Beat highlight</span>
                </label>
                {showAnimationToggle && (
                    <label className={styles.checkbox}>
                        <input
                            type="checkbox"
                            checked={enableAnimation}
                            onChange={(e) => setEnableAnimation(e.target.checked)}
                        />
                        <span>Animate beat cursor</span>
                    </label>
                )}
                {showCustomHandlerToggle && (
                    <label className={styles.checkbox}>
                        <input
                            type="checkbox"
                            checked={customHandlerAttached}
                            onChange={(e) =>
                                setCustomHandlerAttached(e.target.checked)
                            }
                        />
                        <span>Attach custom cursor handler</span>
                    </label>
                )}
                {showThemeToggle && (
                    <ul className={`pills ${styles.pills}`}>
                        {(["default", "neon", "highlighter"] as CursorTheme[]).map((t) => (
                            <li
                                key={t}
                                className={`pills__item ${
                                    theme === t ? "pills__item--active" : ""
                                }`}
                                onClick={() => setTheme(t)}
                            >
                                {t[0].toUpperCase() + t.slice(1)}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <ApplyCursorSettings
                enableCursor={enableCursor}
                enableHighlight={enableHighlight}
                enableAnimation={enableAnimation}
                manageAnimation={!showCustomHandlerToggle}
            />
            {showCustomHandlerToggle && (
                <AttachCustomCursor attached={customHandlerAttached} />
            )}
            <AlphaTabHost />
        </div>
    );
};

export const CursorToggleDemo: React.FC<CursorToggleDemoProps> = ({
    file,
    tex,
    showThemeToggle = false,
    showAnimationToggle = false,
    showCustomHandlerToggle = false,
}) => {
    // `enableCursor` and `enableElementHighlighting` stay out of the patch: the inner effects
    // toggle them on the API at runtime.
    const settings: alphaTab.json.SettingsJson = {
        player: {
            scrollMode: "Continuous",
            enableAnimatedBeatCursor: true,
        },
    };
    const site = useSiteAlphaTabSettings({ player: true, settings });

    return (
        <AlphaTabProvider
            file={file}
            tex={tex}
            configureSettings={site.configureSettings}
            settings={site.settings}
        >
            <Inner
                showThemeToggle={showThemeToggle}
                showAnimationToggle={showAnimationToggle}
                showCustomHandlerToggle={showCustomHandlerToggle}
            />
        </AlphaTabProvider>
    );
};
