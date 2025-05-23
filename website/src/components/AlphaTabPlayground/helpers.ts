import { useState } from "react";
import type { SyncPointInfo } from "./sync-point-info";

export function timePositionToX(pixelPerMilliseconds: number,
    timePosition: number, zoom: number, leftPadding: number): number {
    const zoomedPixelPerMilliseconds = pixelPerMilliseconds * zoom;
    return timePosition * zoomedPixelPerMilliseconds + leftPadding;
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