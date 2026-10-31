import { useEffect, useState, type RefObject } from 'react';

function hasFiles(e: DragEvent): boolean {
    return !!e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files');
}

/** Accepts files dropped onto `target`; returns whether a file drag is currently over it. */
export function useFileDrop(target: RefObject<HTMLElement | null>, onDrop: (file: File) => void): boolean {
    const [dragging, setDragging] = useState(false);

    useEffect(() => {
        const el = target.current;
        if (!el) { return; }
        // dragenter/dragleave fire for every child crossed; only the outermost pair matters.
        let depth = 0;
        const enter = (e: DragEvent) => {
            if (!hasFiles(e)) { return; }
            e.preventDefault();
            depth++;
            setDragging(true);
        };
        const over = (e: DragEvent) => {
            if (!hasFiles(e)) { return; }
            e.preventDefault();
            e.dataTransfer!.dropEffect = 'copy';
        };
        const leave = (e: DragEvent) => {
            if (!hasFiles(e)) { return; }
            depth = Math.max(0, depth - 1);
            if (depth === 0) { setDragging(false); }
        };
        const drop = (e: DragEvent) => {
            if (!hasFiles(e)) { return; }
            e.preventDefault();
            depth = 0;
            setDragging(false);
            const file = e.dataTransfer!.files[0];
            if (file) { onDrop(file); }
        };
        el.addEventListener('dragenter', enter);
        el.addEventListener('dragover', over);
        el.addEventListener('dragleave', leave);
        el.addEventListener('drop', drop);
        return () => {
            el.removeEventListener('dragenter', enter);
            el.removeEventListener('dragover', over);
            el.removeEventListener('dragleave', leave);
            el.removeEventListener('drop', drop);
        };
    }, [target, onDrop]);

    return dragging;
}
