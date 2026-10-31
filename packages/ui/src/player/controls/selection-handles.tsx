import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import type * as alphaTab from '@coderline/alphatab';
import styles from './selection-handles.module.scss';

interface SelectionHandlesProps {
    api: alphaTab.AlphaTabApi | undefined;
    /**
     * The element alphaTab renders into. Bounds returned by
     * `api.boundsLookup` are in this element's coordinate space, so mouse
     * events must be measured relative to it.
     */
    mountElement: HTMLElement | null;
}

type DragSide = 'start' | 'end';

/**
 * Draggable start/end handles for alphaTab's playback range selection.
 * Mirrors the UX from the alphaTab playground and the docs demo — the user
 * drags the handles to widen/narrow the selection, and on release the new
 * range is committed as the playback range.
 */
export function SelectionHandles({ api, mountElement }: SelectionHandlesProps) {
    const startHandleRef = useRef<HTMLDivElement>(null);
    const endHandleRef = useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = useState<DragSide | undefined>(undefined);
    const currentHighlightRef = useRef<alphaTab.PlaybackHighlightChangeEventArgs | undefined>(undefined);

    useEffect(() => {
        if (!api) { return; }

        const handler = (e: alphaTab.PlaybackHighlightChangeEventArgs) => {
            currentHighlightRef.current = e;
            const start = startHandleRef.current;
            const end = endHandleRef.current;
            if (!start || !end) { return; }

            const blocks = e.highlightBlocks;
            if (!blocks || blocks.length === 0) {
                start.classList.remove(styles.handleActive);
                end.classList.remove(styles.handleActive);
                return;
            }

            const first = blocks[0];
            const last = blocks[blocks.length - 1];

            start.classList.add(styles.handleActive);
            start.style.left = `${first.x}px`;
            start.style.top = `${first.y}px`;
            start.style.height = `${first.h}px`;

            end.classList.add(styles.handleActive);
            end.style.left = `${last.x + last.w}px`;
            end.style.top = `${last.y}px`;
            end.style.height = `${last.h}px`;
        };
        api.playbackRangeHighlightChanged.on(handler);
        return () => {
            api.playbackRangeHighlightChanged.off(handler);
        };
    }, [api]);

    useEffect(() => {
        if (!api || !mountElement || !dragging) { return; }

        const beatFromEvent = (e: MouseEvent): alphaTab.model.Beat | undefined => {
            const rect = mountElement.getBoundingClientRect();
            const relX = e.clientX - rect.left;
            const relY = e.clientY - rect.top;
            const beat = api.boundsLookup?.getBeatAtPos(relX, relY);
            if (!beat) { return undefined; }
            const bounds = api.boundsLookup!.findBeat(beat);
            if (!bounds) { return undefined; }
            const visualEnd = bounds.visualBounds.x + bounds.visualBounds.w;
            const realEnd = bounds.realBounds.x + bounds.realBounds.w;
            // Only snap to a beat when the cursor is in the whitespace after
            // it — matches the playground's behaviour for stable selection.
            if (relX < visualEnd || relX > realEnd) { return undefined; }
            return beat;
        };

        const onMove = (e: MouseEvent) => {
            e.preventDefault();
            const highlight = currentHighlightRef.current;
            if (!highlight?.startBeat || !highlight?.endBeat) { return; }
            const beat = beatFromEvent(e);
            if (!beat) { return; }
            if (dragging === 'start') {
                api.highlightPlaybackRange(beat, highlight.endBeat);
            } else {
                api.highlightPlaybackRange(highlight.startBeat, beat);
            }
        };

        const onUp = (e: MouseEvent) => {
            e.preventDefault();
            api.applyPlaybackRangeFromHighlight();
            setDragging(undefined);
        };

        document.addEventListener('mousemove', onMove, true);
        document.addEventListener('mouseup', onUp, true);
        mountElement.classList.add(styles.dragging);
        return () => {
            document.removeEventListener('mousemove', onMove, true);
            document.removeEventListener('mouseup', onUp, true);
            mountElement.classList.remove(styles.dragging);
        };
    }, [api, mountElement, dragging]);

    const beginDrag = (side: DragSide) => (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.button !== 0) { return; }
        e.preventDefault();
        setDragging(side);
    };

    return (
        <div className={styles.handles} aria-hidden="true">
            {/* biome-ignore lint/a11y/noStaticElementInteractions: pointer-only handles; the range is also selectable on the score */}
            <div
                ref={startHandleRef}
                className={`${styles.handle} ${dragging === 'start' ? styles.handleDragging : ''}`}
                onMouseDown={beginDrag('start')}
            />
            {/* biome-ignore lint/a11y/noStaticElementInteractions: pointer-only handles; the range is also selectable on the score */}
            <div
                ref={endHandleRef}
                className={`${styles.handle} ${styles.handleEnd} ${dragging === 'end' ? styles.handleDragging : ''}`}
                onMouseDown={beginDrag('end')}
            />
        </div>
    );
}
