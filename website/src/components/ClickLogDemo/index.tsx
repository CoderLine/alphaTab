'use client';

import React, { useEffect, useRef, useState } from "react";
import type * as alphaTab from "@coderline/alphatab";
import {
    AlphaTabPlayer,
    AlphaTabCanvas,
    useAlphaTabApi,
    useAlphaTabEvent,
    useAlphaTabState,
} from "@site/src/alphatab-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as solid from "@fortawesome/free-solid-svg-icons";
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
    if (!beat) return { bar: null, beat: null };
    return {
        bar: beat.voice.bar.index,
        beat: beat.index,
    };
}

function formatNote(note: alphaTab.model.Note | null | undefined): string {
    if (!note) return "";
    if (note.string > 0) {
        return `string ${note.string}, fret ${note.fret}`;
    }
    return `fret ${note.fret}`;
}

function ApplyInteractionSettings({
    seekToClick,
    playbackRangeSelection,
}: {
    seekToClick: boolean;
    playbackRangeSelection: boolean;
}) {
    const api = useAlphaTabApi();
    useEffect(() => {
        if (!api) return;
        api.settings.player.enableSeekToClick = seekToClick;
        api.updateSettings();
    }, [api, seekToClick]);
    useEffect(() => {
        if (!api) return;
        api.settings.player.enablePlaybackRangeSelection = playbackRangeSelection;
        api.updateSettings();
    }, [api, playbackRangeSelection]);
    return null;
}

interface InnerProps {
    showInteractionToggle: boolean;
}

const Inner: React.FC<InnerProps> = ({ showInteractionToggle }) => {
    const api = useAlphaTabApi();
    const state = useAlphaTabState();
    const [entries, setEntries] = useState<LogEntry[]>([]);
    const [seekToClick, setSeekToClick] = useState(true);
    const [playbackRangeSelection, setPlaybackRangeSelection] = useState(true);
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
        if (lastMoveBeatKeyRef.current === key) return;
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
        if (lastMoveNoteKeyRef.current === key) return;
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
                    aria-label={state.isPlaying ? "Pause" : "Play"}
                >
                    <FontAwesomeIcon icon={state.isPlaying ? solid.faPause : solid.faPlay} />
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
                />
            )}
            <div className={styles.grid}>
                <AlphaTabCanvas className={styles.score} />
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
        },
    };

    return (
        <AlphaTabPlayer file={file} tex={tex} settings={settings}>
            <Inner showInteractionToggle={showInteractionToggle} />
        </AlphaTabPlayer>
    );
};
