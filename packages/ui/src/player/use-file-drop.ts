import { type RefObject, useEffect, useRef, useState } from 'react';
import { attachFileDrop } from '../state/file-drop';

/** Accepts files dropped onto `target`; returns whether a file drag is currently over it. */
export function useFileDrop(target: RefObject<HTMLElement | null>, onDrop: (file: File) => void): boolean {
    const [dragging, setDragging] = useState(false);
    const latestOnDrop = useRef(onDrop);
    latestOnDrop.current = onDrop;

    useEffect(() => {
        const el = target.current;
        if (!el) {
            return;
        }
        return attachFileDrop(el, {
            onDragChange: setDragging,
            onDrop: file => latestOnDrop.current(file)
        });
    }, [target]);

    return dragging;
}
