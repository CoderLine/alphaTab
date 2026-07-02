import type * as alphaTab from '@coderline/alphatab';

export interface DragDropOptions {
    onEnter?: () => void;
    onLeave?: () => void;
}

/**
 * Behaviour-only component: attaches document-level drag/drop handlers that
 * load a dropped file into the alphaTab API. Does not render any DOM of its own.
 */
export class DragDrop {
    private over = (e: DragEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'copy';
        }
        if (!this.dragging) {
            this.dragging = true;
            this.options.onEnter?.();
        }
    };
    private leave = (e: DragEvent) => {
        // The dragleave fires on every child element transition. Reset only when leaving the document.
        if (e.relatedTarget === null) {
            this.dragging = false;
            this.options.onLeave?.();
        }
    };
    private drop = (e: DragEvent) => {
        e.stopPropagation();
        e.preventDefault();
        this.dragging = false;
        this.options.onLeave?.();
        const files = e.dataTransfer?.files;
        if (files && files.length === 1) {
            const reader = new FileReader();
            reader.onload = data => {
                if (data.target?.result) {
                    this.api.load(data.target.result, [0]);
                }
            };
            reader.readAsArrayBuffer(files[0]);
        }
    };

    private dragging = false;

    constructor(
        private api: alphaTab.AlphaTabApi,
        private options: DragDropOptions = {}
    ) {
        document.addEventListener('dragover', this.over);
        document.addEventListener('dragleave', this.leave);
        document.addEventListener('drop', this.drop);
    }

    dispose(): void {
        document.removeEventListener('dragover', this.over);
        document.removeEventListener('dragleave', this.leave);
        document.removeEventListener('drop', this.drop);
    }
}
