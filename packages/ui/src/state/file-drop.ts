export interface FileDropHandlers {
    /** Called with `true` when a file drag enters the target and with `false` when it leaves or drops. */
    onDragChange(dragging: boolean): void;
    /** Receives the first dropped file. */
    onDrop(file: File): void;
}

function hasFiles(e: DragEvent): boolean {
    return !!e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files');
}

/**
 * Accepts files dropped onto `target`. Drags of anything but files are ignored. Returns the function
 * that detaches the listeners.
 */
export function attachFileDrop(target: HTMLElement, handlers: FileDropHandlers): () => void {
    // dragenter and dragleave fire for every child crossed; only the outermost pair matters.
    let depth = 0;
    const enter = (e: DragEvent) => {
        if (!hasFiles(e)) {
            return;
        }
        e.preventDefault();
        depth++;
        if (depth === 1) {
            handlers.onDragChange(true);
        }
    };
    const over = (e: DragEvent) => {
        if (!hasFiles(e)) {
            return;
        }
        e.preventDefault();
        e.dataTransfer!.dropEffect = 'copy';
    };
    const leave = (e: DragEvent) => {
        if (!hasFiles(e) || depth === 0) {
            return;
        }
        depth--;
        if (depth === 0) {
            handlers.onDragChange(false);
        }
    };
    const drop = (e: DragEvent) => {
        if (!hasFiles(e)) {
            return;
        }
        e.preventDefault();
        const wasDragging = depth > 0;
        depth = 0;
        if (wasDragging) {
            handlers.onDragChange(false);
        }
        const file = e.dataTransfer!.files[0];
        if (file) {
            handlers.onDrop(file);
        }
    };
    target.addEventListener('dragenter', enter);
    target.addEventListener('dragover', over);
    target.addEventListener('dragleave', leave);
    target.addEventListener('drop', drop);
    return () => {
        target.removeEventListener('dragenter', enter);
        target.removeEventListener('dragover', over);
        target.removeEventListener('dragleave', leave);
        target.removeEventListener('drop', drop);
    };
}
