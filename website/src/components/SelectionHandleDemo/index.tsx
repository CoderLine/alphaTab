'use client';

import React, { useState } from "react";
import type * as alphaTab from "@coderline/alphatab";
import {
    AlphaTabHost,
    AlphaTabProvider,
    useAlphaTabApi,
    useAlphaTabElements,
    useAlphaTabEvent,
} from "@coderline/alphatab-react";
import { SelectionHandles } from "@coderline/alphatab-ui";
import { useSiteAlphaTabSettings } from "@site/src/alphatab-settings";
import { DemoPlayButton } from "@site/src/components/DemoPlayButton";
import styles from "./styles.module.scss";

export interface SelectionHandleDemoProps {
    children: string | React.ReactElement;
    showEventLog?: boolean;
}

interface HighlightPayload {
    startBar: number | null;
    startBeat: number | null;
    endBar: number | null;
    endBeat: number | null;
    blocks: number;
}

/**
 * Subscribes to `playbackRangeHighlightChanged` and mirrors the event
 * payload into the caller's state so the sibling event log can render.
 */
function HighlightPayloadTap({
    onPayload,
}: {
    onPayload: (p: HighlightPayload | null) => void;
}) {
    useAlphaTabEvent(
        "playbackRangeHighlightChanged",
        (e: alphaTab.PlaybackHighlightChangeEventArgs) => {
            if (!e.highlightBlocks || e.highlightBlocks.length === 0) {
                onPayload(null);
                return;
            }
            onPayload({
                startBar: e.startBeat ? e.startBeat.voice.bar.index : null,
                startBeat: e.startBeat ? e.startBeat.index : null,
                endBar: e.endBeat ? e.endBeat.voice.bar.index : null,
                endBeat: e.endBeat ? e.endBeat.index : null,
                blocks: e.highlightBlocks.length,
            });
        }
    );
    return null;
}

function SelectionHandlesOverlay() {
    const api = useAlphaTabApi();
    const { mountElement } = useAlphaTabElements();
    return <SelectionHandles api={api ?? undefined} mountElement={mountElement} />;
}

export const SelectionHandleDemo: React.FC<SelectionHandleDemoProps> = ({
    children,
    showEventLog = false,
}) => {
    const [payload, setPayload] = useState<HighlightPayload | null>(null);
    const site = useSiteAlphaTabSettings({
        player: true,
        settings: {
            player: {
                scrollMode: "Off",
                scrollOffsetY: -50,
            },
        },
    });

    const tex = typeof children === "string" ? children : undefined;

    const formatBeatLabel = (bar: number | null, beat: number | null) =>
        bar !== null && beat !== null ? `bar ${bar + 1} beat ${beat + 1}` : "—";

    return (
        <div className={styles.wrapper}>
            <AlphaTabProvider
                tex={tex}
                configureSettings={site.configureSettings}
                settings={site.settings}
            >
                {showEventLog && <HighlightPayloadTap onPayload={setPayload} />}
                <DemoPlayButton className={styles.play} />
                <AlphaTabHost overlay={<SelectionHandlesOverlay />} />
            </AlphaTabProvider>
            {showEventLog && (
                <pre className={styles.eventLog}>
{payload
    ? `startBeat: ${formatBeatLabel(payload.startBar, payload.startBeat)}
endBeat: ${formatBeatLabel(payload.endBar, payload.endBeat)}
highlightBlocks: ${payload.blocks}`
    : "startBeat: —\nendBeat: —\nhighlightBlocks: 0"}
                </pre>
            )}
        </div>
    );
};
