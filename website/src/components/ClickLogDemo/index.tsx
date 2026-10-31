'use client';

import React, { useEffect, useRef, useState } from "react";
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

export interface ClickLogDemoProps {
    file?: string;
    tex?: string;
    showInteractionToggle?: boolean;
    includeNoteBounds?: boolean;
    showCode?: boolean;
}

interface LogEntry {
    id: number;
    event: string;
    bar: number | null;
    beat: number | null;
    detail?: string;
}

const MAX_ENTRIES = 20;

function formatBeat(beat: alphaTab.model.Beat | null | undefined): {
    bar: number | null;
    beat: number | null;
} {
    if (!beat) { return { bar: null, beat: null }; }
    return {
        bar: beat.voice.bar.index,
        beat: beat.index,
    };
}

function formatNote(note: alphaTab.model.Note | null | undefined): string {
    if (!note) { return ""; }
    if (note.string > 0) {
        return `string ${note.string}, fret ${note.fret}`;
    }
    return `fret ${note.fret}`;
}

function ApplyInteractionSettings({
    seekToClick,
    playbackRangeSelection,
    resetPlaybackRangeOnClick,
}: {
    seekToClick: boolean;
    playbackRangeSelection: boolean;
    resetPlaybackRangeOnClick: boolean;
}) {
    const api = useAlphaTabApi();
    useEffect(() => {
        if (!api) { return; }
        api.settings.player.enableSeekToClick = seekToClick;
        api.settings.player.enablePlaybackRangeSelection = playbackRangeSelection;
        api.settings.player.resetPlaybackRangeOnClick = resetPlaybackRangeOnClick;
        api.updateSettings();
    }, [api, seekToClick, playbackRangeSelection, resetPlaybackRangeOnClick]);
    return null;
}

interface InnerProps {
    showInteractionToggle: boolean;
}

const Inner: React.FC<InnerProps> = ({ showInteractionToggle }) => {
    const api = useAlphaTabApi();
    const isPlaying =
        useAlphaTabEventValue(
            "playerStateChanged",
            (e) => e.state === alphaTab.synth.PlayerState.Playing,
        ) ?? false;
    const [entries, setEntries] = useState<LogEntry[]>([]);
    const [seekToClick, setSeekToClick] = useState(true);
    const [playbackRangeSelection, setPlaybackRangeSelection] = useState(true);
    const [resetPlaybackRangeOnClick, setResetPlaybackRangeOnClick] = useState(true);
    const idRef = useRef(0);

    const pushEntry = (entry: Omit<LogEntry, "id">) => {
        idRef.current += 1;
        const withId: LogEntry = { ...entry, id: idRef.current };
        setEntries((prev) => {
            const next = [...prev, withId];
            if (next.length > MAX_ENTRIES) {
                next.splice(0, next.length - MAX_ENTRIES);
            }
            return next;
        });
    };

    // Track the last beat/note logged via a move event so we throttle the flood
    // of moves down to one entry per changed target.
    const lastMoveBeatKeyRef = useRef<string | null>(null);
    const lastMoveNoteKeyRef = useRef<string | null>(null);

    useAlphaTabEvent("beatMouseDown", (beat: alphaTab.model.Beat) => {
        lastMoveBeatKeyRef.current = null;
        lastMoveNoteKeyRef.current = null;
        const { bar, beat: b } = formatBeat(beat);
        pushEntry({ event: "beatMouseDown", bar, beat: b });
    });
    useAlphaTabEvent("beatMouseMove", (beat: alphaTab.model.Beat) => {
        const { bar, beat: b } = formatBeat(beat);
        const key = `${bar}-${b}`;
        if (lastMoveBeatKeyRef.current === key) { return; }
        lastMoveBeatKeyRef.current = key;
        pushEntry({ event: "beatMouseMove", bar, beat: b });
    });
    useAlphaTabEvent("beatMouseUp", (beat: alphaTab.model.Beat | null) => {
        lastMoveBeatKeyRef.current = null;
        lastMoveNoteKeyRef.current = null;
        const { bar, beat: b } = formatBeat(beat);
        pushEntry({ event: "beatMouseUp", bar, beat: b });
    });
    useAlphaTabEvent("noteMouseDown", (note: alphaTab.model.Note) => {
        lastMoveBeatKeyRef.current = null;
        lastMoveNoteKeyRef.current = null;
        const { bar, beat: b } = formatBeat(note.beat);
        pushEntry({
            event: "noteMouseDown",
            bar,
            beat: b,
            detail: formatNote(note),
        });
    });
    useAlphaTabEvent("noteMouseMove", (note: alphaTab.model.Note) => {
        const { bar, beat: b } = formatBeat(note.beat);
        const detail = formatNote(note);
        const key = `${bar}-${b}-${detail}`;
        if (lastMoveNoteKeyRef.current === key) { return; }
        lastMoveNoteKeyRef.current = key;
        pushEntry({ event: "noteMouseMove", bar, beat: b, detail });
    });
    useAlphaTabEvent("noteMouseUp", (note: alphaTab.model.Note | null) => {
        lastMoveBeatKeyRef.current = null;
        lastMoveNoteKeyRef.current = null;
        const { bar, beat: b } = formatBeat(note?.beat);
        pushEntry({
            event: "noteMouseUp",
            bar,
            beat: b,
            detail: formatNote(note),
        });
    });

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
                {showInteractionToggle && (
                    <>
                        <label className={styles.checkbox}>
                            <input
                                type="checkbox"
                                checked={seekToClick}
                                onChange={(e) => setSeekToClick(e.target.checked)}
                            />
                            <span>player.enableSeekToClick</span>
                        </label>
                        <label className={styles.checkbox}>
                            <input
                                type="checkbox"
                                checked={playbackRangeSelection}
                                onChange={(e) =>
                                    setPlaybackRangeSelection(e.target.checked)
                                }
                            />
                            <span>player.enablePlaybackRangeSelection</span>
                        </label>
                        <label className={styles.checkbox}>
                            <input
                                type="checkbox"
                                checked={resetPlaybackRangeOnClick}
                                onChange={(e) =>
                                    setResetPlaybackRangeOnClick(e.target.checked)
                                }
                            />
                            <span>player.resetPlaybackRangeOnClick</span>
                        </label>
                    </>
                )}
                <button
                    className="button button--secondary button--sm"
                    onClick={() => setEntries([])}
                >
                    Clear log
                </button>
            </div>
            {showInteractionToggle && (
                <ApplyInteractionSettings
                    seekToClick={seekToClick}
                    playbackRangeSelection={playbackRangeSelection}
                    resetPlaybackRangeOnClick={resetPlaybackRangeOnClick}
                />
            )}
            <div className={styles.grid}>
                <AlphaTabHost className={styles.score} />
                <div className={styles.log}>
                    <div className={styles.logHeader}>Event log</div>
                    <pre className={styles.logBody}>
                        {entries.length === 0
                            ? "Click a beat or note in the score..."
                            : entries
                                  .map((e) => {
                                      const loc =
                                          e.bar !== null && e.beat !== null
                                              ? `bar ${e.bar + 1} beat ${e.beat + 1}`
                                              : "(outside beats)";
                                      const detail = e.detail ? ` — ${e.detail}` : "";
                                      return `${e.event} — ${loc}${detail}`;
                                  })
                                  .join("\n")}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export const ClickLogDemo: React.FC<ClickLogDemoProps> = ({
    file,
    tex,
    showInteractionToggle = false,
    includeNoteBounds = false,
}) => {
    const settings: alphaTab.json.SettingsJson = {
        core: { includeNoteBounds: includeNoteBounds || showInteractionToggle },
        player: {
            scrollMode: "Off",
            enableSeekToClick: true,
            enablePlaybackRangeSelection: true,
            resetPlaybackRangeOnClick: true,
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
            <Inner showInteractionToggle={showInteractionToggle} />
        </AlphaTabProvider>
    );
};
