import { useState } from "react";
import type { SyncPointInfo } from "./sync-point-info";

export function timePositionToX(pixelPerMilliseconds: number,
    timePosition: number, zoom: number, leftPadding: number): number {
    const zoomedPixelPerMilliseconds = pixelPerMilliseconds * zoom;
    return timePosition * zoomedPixelPerMilliseconds + leftPadding;
}

export function xToTimePosition(pixelPerMilliseconds: number,
    x: number, zoom: number, leftPadding: number): number {

    const zoomedPixelPerMilliseconds = pixelPerMilliseconds * zoom;
    return (x - leftPadding) / zoomedPixelPerMilliseconds;
}

type UndoStack = {
    undo: SyncPointInfo[];
    redo: SyncPointInfo[];
};

export const useSyncPointInfoUndo = () => {
    const [undoStack, setUndoStack] = useState<UndoStack>({ undo: [], redo: [] });

    return {
        undo(callback: (info: SyncPointInfo) => void) {
            setUndoStack(s => {
                if (s.undo.length > 1) {
                    const newStack = { ...s };
                    const undoState = newStack.undo.pop()!;
                    newStack.redo.push(undoState);
                    callback(newStack.undo.at(-1)!);
                    return newStack;
                }
                return s;
            });
        },
        storeUndo(info: SyncPointInfo) {
            setUndoStack(s => ({
                undo: [...s.undo, info],
                redo: []
            }));
        },
        redo(callback: (info: SyncPointInfo) => void) {
            setUndoStack(s => {
                if (s.redo.length > 0) {
                    const newStack = { ...s };
                    const redoState = newStack.redo.pop()!;
                    newStack.undo.push(redoState);
                    callback(redoState);
                    return newStack;
                }
                return s;
            });
        },
        get canUndo() {
            // we always want to keep the initial state
            return undoStack.undo.length > 1;
        },
        get canRedo() {
            return undoStack.redo.length > 0;
        },
        resetUndo() {
            setUndoStack({
                undo: [],
                redo: []
            });
        }
    }
};

export type HTMLMediaElementLikeEvents = 'timeupdate' | 'durationchange' | 'seeked' | 'play' | 'pause' | 'ended' | 'volumechange' | 'ratechange' | 'loadedmetadata';

export interface HTMLMediaElementLike {
    currentTime: number;
    volume: number;
    playbackRate: number;
    readonly duration: number;
    addEventListener(eventType: HTMLMediaElementLikeEvents, handler: () => void): void;
    removeEventListener(eventType: HTMLMediaElementLikeEvents, handler: () => void): void;

    play(): void;
    pause(): void;
}

export function extractYouTubeVideoId(src: string | undefined) {
    try {
        if (!src) {
            return undefined;
        }
        const url = new URL(src);
        const host = url.host.toLowerCase();
        if (host.endsWith('youtube.com') && url.searchParams.has('v')) {
            return url.searchParams.get('v')!;
        }
        if (host.endsWith('youtube-nocookie.com')) {
            return url.pathname.split('/')[2];
        }
        if (host.endsWith('youtu.be')) {
            return url.pathname.split('/')[1];
        }
    } catch (e) {
        return undefined;
    }
}


export enum MediaType {
    Synth = 0,
    Audio = 1,
    YouTube = 2
}

export interface MediaTypeState {
    type: MediaType;
    audioFile?: Uint8Array
    youtubeUrl?: string;
    youtubeVideoDuration?: number;
}