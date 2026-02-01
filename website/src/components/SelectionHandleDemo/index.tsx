'use client';

import React, { useEffect, useRef } from "react";
import { AlphaTab, AlphaTabProps } from "../AlphaTab";
import styles from "./styles.module.scss";
import * as alphaTab from "@coderline/alphatab";
import { useAlphaTab, useAlphaTabEvent } from "@site/src/hooks";

export interface SelectionHandleDemoProps extends AlphaTabProps {
    children: string | React.ReactElement;
}

interface HandleDragState {
    isDragging: 'start' | 'end' | undefined;
}

function setupHandleDrag(
    element: HTMLElement,
    handle: HTMLElement,
    dragState: HandleDragState,
    type: HandleDragState['isDragging'],
    onMove: (e: MouseEvent) => void,
    onDragEnd: (e: MouseEvent) => void
) {
    handle.addEventListener(
        'mousedown',
        e => {
            if (e.button !== 0) {
                return;
            }
            e.preventDefault();
            element.classList.add('at-selection-handle-drag');
            handle.classList.add('at-selection-handle-drag');
            dragState.isDragging = type;
        },
        false
    );
    document.addEventListener(
        'mousemove',
        e => {
            if (dragState.isDragging !== type) {
                return;
            }
            e.preventDefault();
            onMove(e);
        },
        true
    );
    document.addEventListener(
        'mouseup',
        e => {
            if (dragState.isDragging !== type) {
                return;
            }
            e.preventDefault();
            dragState.isDragging = undefined;
            element.classList.remove('at-selection-handle-drag');
            handle.classList.remove('at-selection-handle-drag');
            onDragEnd(e);
        },
        true
    );
}

function getRelativePosition(parent: HTMLElement, e: MouseEvent): { relX: number; relY: number } {
    const parentPos = parent.getBoundingClientRect();
    const parentLeft: number = parentPos.left + parent.ownerDocument!.defaultView!.pageXOffset;
    const parentTop: number = parentPos.top + parent.ownerDocument!.defaultView!.pageYOffset;

    const relX = e.pageX - parentLeft;
    const relY = e.pageY - parentTop;

    return { relX, relY };
}

function getBeatFromEvent(
    element: HTMLElement,
    api: alphaTab.AlphaTabApi,
    e: MouseEvent
): alphaTab.model.Beat | undefined {
    const { relX, relY } = getRelativePosition(element, e);
    const beat = api.boundsLookup?.getBeatAtPos(relX, relY);
    if (!beat) {
        return undefined;
    }

    const bounds = api.boundsLookup!.findBeat(beat);
    if (!bounds) {
        return undefined;
    }

    // only snap to beat beat if we are over the whitespace after the beat
    const visualBoundsEnd = bounds.visualBounds.x + bounds.visualBounds.w;
    const realBoundsEnd = bounds.realBounds.x + bounds.realBounds.w;
    if (relX < visualBoundsEnd || relX > realBoundsEnd) {
        return undefined;
    }

    return beat;
}


export const SelectionHandleDemo: React.FC<SelectionHandleDemoProps> = ({ children }) => {
    const [api, element] = useAlphaTab((s) => {
        s.core.tex = true;
        s.player.playerMode = alphaTab.PlayerMode.EnabledAutomatic;
        s.player.scrollOffsetY = -50;
        s.player.scrollMode = alphaTab.ScrollMode.Off;
    });

    const selectionHandleStart = useRef<HTMLDivElement>(null);
    const selectionHandleEnd = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!api || !selectionHandleStart.current || !selectionHandleEnd.current) {
            return;
        }

        let currentHighlight: alphaTab.PlaybackHighlightChangeEventArgs | undefined;
        api.playbackRangeHighlightChanged.on(e => {
            currentHighlight = e;
            // no selection
            if (!e.highlightBlocks || e.highlightBlocks.length === 0) {
                selectionHandleStart.current!.classList.remove(styles.active);
                selectionHandleEnd.current!.classList.remove(styles.active);
                return;
            }

            selectionHandleStart.current!.classList.add(styles.active);
            selectionHandleStart.current!.style.left = `${e.highlightBlocks![0].x}px`;
            selectionHandleStart.current!.style.top = `${e.highlightBlocks![0].y}px`;
            selectionHandleStart.current!.style.height = `${e.highlightBlocks![0].h}px`;

            selectionHandleEnd.current!.classList.add(styles.active);
            const lastBlock = e.highlightBlocks!.at(-1)!;
            selectionHandleEnd.current!.style.left = `${lastBlock.x + lastBlock.w}px`;
            selectionHandleEnd.current!.style.top = `${lastBlock.y}px`;
            selectionHandleEnd.current!.style.height = `${lastBlock.h}px`;
        });

        const dragState: HandleDragState = { isDragging: undefined };

        setupHandleDrag(
            element.current!,
            selectionHandleStart.current!,
            dragState,
            'start',
            e => {
                if (!currentHighlight?.startBeat) {
                    return;
                }

                const beat = getBeatFromEvent(element.current!, api, e);
                if (!beat) {
                    return;
                }

                api.highlightPlaybackRange(beat, currentHighlight.endBeat!);
            },
            () => {
                api.applyPlaybackRangeFromHighlight();
            }
        );

        setupHandleDrag(
            element.current!,
            selectionHandleEnd.current!,
            dragState,
            'end',
            e => {
                if (!currentHighlight?.startBeat) {
                    return;
                }

                const beat = getBeatFromEvent(element.current!, api, e);
                if (!beat) {
                    return;
                }

                api.highlightPlaybackRange(currentHighlight!.startBeat!, beat);
            },
            () => {
                api.applyPlaybackRangeFromHighlight();
            }
        );



    }, [api, selectionHandleStart.current, selectionHandleEnd.current]);


    return (
        <div className={styles.wrapper}>
            <div className={styles.atSelectionHandles}>
                <div ref={selectionHandleStart} className={`${styles.atSelectionHandle} ${styles.atSelectionHandleStart}`}>
                </div>
                <div ref={selectionHandleEnd} className={`${styles.atSelectionHandle} ${styles.atSelectionHandleEnd}`}>
                </div>
            </div>
            <div ref={element}>{children}</div>
        </div>
    );
};
