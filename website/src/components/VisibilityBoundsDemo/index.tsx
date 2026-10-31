'use client';

import React, { useCallback, useEffect, useState } from "react";
import * as alphaTab from "@coderline/alphatab";
import {
    AlphaTabHost,
    AlphaTabProvider,
    useAlphaTabApi,
    useAlphaTabEvent,
    useAlphaTabEventValue,
} from "@coderline/alphatab-react";
import { IconPause, IconPlay } from "@coderline/alphatab-ui";
import { useSiteAlphaTabSettings } from "@site/src/alphatab-settings";
import styles from "./styles.module.scss";

export interface VisibilityBoundsDemoProps {
    file?: string;
    tex?: string;
    showNoteHeadOverlay?: boolean;
    showCode?: boolean;
}

function ApplyIncludeNoteBounds({ includeNotes }: { includeNotes: boolean }) {
    const api = useAlphaTabApi();
    useEffect(() => {
        if (!api) { return; }
        api.settings.core.includeNoteBounds = includeNotes;
        api.updateSettings();
        api.render();
    }, [api, includeNotes]);
    return null;
}

interface InnerProps {
    showNoteHeadOverlay: boolean;
}

const Inner: React.FC<InnerProps> = ({ showNoteHeadOverlay }) => {
    const api = useAlphaTabApi();
    const isPlaying =
        useAlphaTabEventValue(
            "playerStateChanged",
            (e) => e.state === alphaTab.synth.PlayerState.Playing,
        ) ?? false;
    const [includeNotes, setIncludeNotes] = useState(true);
    const [currentBeat, setCurrentBeat] = useState<alphaTab.model.Beat | null>(null);
    const [isVisible, setIsVisible] = useState<boolean | null>(null);

    // The bounded scroll wrapper is the AlphaTabHost's scroll element — alphaTab
    // assigns it to `settings.player.scrollElement` during API construction.
    const getScroller = useCallback((): HTMLElement | null => {
        if (!api) { return null; }
        const el = api.settings.player.scrollElement;
        return el instanceof HTMLElement ? el : null;
    }, [api]);

    const checkVisible = useCallback(
        (beat: alphaTab.model.Beat): boolean => {
            if (!api) { return false; }
            const scroller = getScroller();
            if (!scroller) { return false; }
            const lookup = api.renderer.boundsLookup;
            if (!lookup) { return false; }
            const bounds = lookup.findBeat(beat);
            if (!bounds) { return false; }
            const top = scroller.scrollTop;
            const bottom = top + scroller.clientHeight;
            const beatTop = bounds.realBounds.y;
            const beatBottom = beatTop + bounds.realBounds.h;
            return beatBottom > top && beatTop < bottom;
        },
        [api, getScroller]
    );

    useAlphaTabEvent("playedBeatChanged", (beat: alphaTab.model.Beat) => {
        setCurrentBeat(beat);
        setIsVisible(checkVisible(beat));
    });

    // Recompute visibility on scroll so the readout stays fresh.
    useEffect(() => {
        const scroller = getScroller();
        if (!scroller) { return; }
        const onScroll = () => {
            if (currentBeat) {
                setIsVisible(checkVisible(currentBeat));
            }
        };
        scroller.addEventListener("scroll", onScroll, { passive: true });
        return () => scroller.removeEventListener("scroll", onScroll);
    }, [api, currentBeat, checkVisible, getScroller]);

    const drawOverlay = useCallback(() => {
        if (!api) { return; }
        const scroller = getScroller();
        if (!scroller) { return; }
        // alphaTab's mount lives inside `<div style="position: relative">`
        // inside the scroll element. Use it as the overlay parent so the
        // absolute-positioned rectangles line up with the SVG chunks.
        const relative = scroller.querySelector<HTMLDivElement>(
            ':scope > div[style*="position: relative"]'
        );
        const container = relative ?? scroller;
        let overlay = container.querySelector<HTMLDivElement>(".vb-overlay");
        if (!overlay) {
            container.style.position = "relative";
            overlay = document.createElement("div");
            overlay.classList.add("vb-overlay");
            overlay.style.position = "absolute";
            overlay.style.top = "0";
            overlay.style.left = "0";
            overlay.style.right = "0";
            overlay.style.bottom = "0";
            overlay.style.pointerEvents = "none";
            overlay.style.zIndex = "1000";
            container.insertBefore(overlay, container.firstChild);
        }
        overlay.innerHTML = "";
        const lookup = api.renderer.boundsLookup;
        if (!lookup) { return; }

        for (const staff of lookup.staffSystems) {
            for (const master of staff.bars) {
                for (const bar of master.bars) {
                    for (const beat of bar.beats) {
                        if (includeNotes && beat.notes && beat.notes.length > 0) {
                            for (const note of beat.notes) {
                                const rect = document.createElement("div");
                                rect.style.position = "absolute";
                                rect.style.left = `${note.noteHeadBounds.x}px`;
                                rect.style.top = `${note.noteHeadBounds.y}px`;
                                rect.style.width = `${note.noteHeadBounds.w}px`;
                                rect.style.height = `${note.noteHeadBounds.h}px`;
                                rect.style.background =
                                    "rgba(81, 45, 168, 0.35)";
                                rect.style.border = "1px solid #512da8";
                                overlay.appendChild(rect);
                            }
                        } else {
                            const rect = document.createElement("div");
                            rect.style.position = "absolute";
                            rect.style.left = `${beat.visualBounds.x}px`;
                            rect.style.top = `${beat.visualBounds.y}px`;
                            rect.style.width = `${beat.visualBounds.w}px`;
                            rect.style.height = `${beat.visualBounds.h}px`;
                            rect.style.background =
                                "rgba(230, 74, 25, 0.15)";
                            rect.style.border = "1px solid #e64a19";
                            overlay.appendChild(rect);
                        }
                    }
                }
            }
        }
    }, [api, includeNotes, getScroller]);

    useAlphaTabEvent("postRenderFinished", () => {
        if (showNoteHeadOverlay) { drawOverlay(); }
    });

    useEffect(() => {
        if (showNoteHeadOverlay) { drawOverlay(); }
    }, [showNoteHeadOverlay, includeNotes, drawOverlay]);

    const barLabel =
        currentBeat !== null
            ? `bar ${currentBeat.voice.bar.index + 1} beat ${
                  currentBeat.index + 1
              }`
            : "—";
    const visibleLabel =
        isVisible === null ? "—" : isVisible ? "yes" : "no";

    return (
        <div className={styles.wrapper}>
            <div className={styles.toolbar}>
                <button
                    className="button button--primary"
                    onClick={() => api?.playPause()}
                    aria-label={isPlaying ? "Pause" : "Play"}
                >
                    {isPlaying ? <IconPause aria-hidden="true" /> : <IconPlay aria-hidden="true" />}
                </button>
                <button
                    className="button button--secondary"
                    onClick={() => getScroller()?.scrollTo({ top: 0 })}
                >
                    Scroll away from cursor
                </button>
                {showNoteHeadOverlay && (
                    <ul className={`pills ${styles.pills}`}>
                        <li
                            className={`pills__item ${
                                includeNotes ? "pills__item--active" : ""
                            }`}
                            onClick={() => setIncludeNotes(true)}
                        >
                            includeNoteBounds: on
                        </li>
                        <li
                            className={`pills__item ${
                                !includeNotes ? "pills__item--active" : ""
                            }`}
                            onClick={() => setIncludeNotes(false)}
                        >
                            includeNoteBounds: off
                        </li>
                    </ul>
                )}
            </div>
            <div className={styles.readout}>
                Current beat: <strong>{barLabel}</strong> — visible:{" "}
                <strong className={isVisible === false ? styles.negative : ""}>
                    {visibleLabel}
                </strong>
            </div>
            <ApplyIncludeNoteBounds includeNotes={includeNotes} />
            <AlphaTabHost className={styles.scroller} />
        </div>
    );
};

export const VisibilityBoundsDemo: React.FC<VisibilityBoundsDemoProps> = ({
    file,
    tex,
    showNoteHeadOverlay = false,
}) => {
    const settings: alphaTab.json.SettingsJson = {
        core: { includeNoteBounds: true },
        player: {
            scrollMode: "Continuous",
            scrollOffsetY: -40,
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
            <Inner showNoteHeadOverlay={showNoteHeadOverlay} />
        </AlphaTabProvider>
    );
};
