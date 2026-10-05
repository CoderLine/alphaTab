import type * as alphaTab from '@coderline/alphatab';
import { type Mountable, css, html, injectStyles, parseHtml } from '../util/Dom';

injectStyles(
    'SelectionHandles',
    css`
    .at-selection-handles {
        position: absolute;
        pointer-events: none;
        z-index: 1001;
        display: inline;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }
    .at-selection-handle {
        position: absolute;
        pointer-events: auto;
        cursor: ew-resize;
        background: #7cb9ff;
        width: 4px;
        opacity: 0;
        transition: opacity 150ms ease-in-out;
        display: none;
    }
    .at-selection-handle-end {
        transform: translateX(-100%);
    }
    .at-selection-handle:hover,
    .at-selection-handle.dragging {
        opacity: 1;
    }
    .at-selection-handle.active { display: block; }
    .at-selection-handle-drag * { cursor: ew-resize !important; }
`
);

type DragSide = 'start' | 'end';

export class SelectionHandles implements Mountable {
    readonly root: HTMLElement;
    private startHandle: HTMLElement;
    private endHandle: HTMLElement;
    private currentHighlight: alphaTab.PlaybackHighlightChangeEventArgs | undefined;
    private dragging: DragSide | undefined;
    private dragAnchor: alphaTab.model.Beat | undefined;
    private unsubHighlight: () => void;

    private onMouseMove = (e: MouseEvent) => {
        if (!this.dragging) {
            return;
        }
        e.preventDefault();
        const anchor = this.dragAnchor;
        const beat = anchor ? this.beatFromEvent(e, anchor) : undefined;
        // the API treats a range of a single beat as no selection, keep the last range instead
        if (!anchor || !beat || beat === anchor) {
            return;
        }
        this.api.highlightPlaybackRange(anchor, beat);
    };

    private onMouseUp = (e: MouseEvent) => {
        if (!this.dragging) {
            return;
        }
        e.preventDefault();
        this.endDrag();
        this.api.applyPlaybackRangeFromHighlight();
    };

    constructor(
        private api: alphaTab.AlphaTabApi,
        private viewportEl: HTMLElement,
        private canvasEl: HTMLElement
    ) {
        this.root = parseHtml(html`
            <div class="at-selection-handles">
                <div class="at-selection-handle at-selection-handle-start"></div>
                <div class="at-selection-handle at-selection-handle-end"></div>
            </div>
        `);
        this.startHandle = this.root.querySelector('.at-selection-handle-start')!;
        this.endHandle = this.root.querySelector('.at-selection-handle-end')!;

        this.startHandle.addEventListener('mousedown', e => this.beginDrag(e, 'start'));
        this.endHandle.addEventListener('mousedown', e => this.beginDrag(e, 'end'));
        document.addEventListener('mousemove', this.onMouseMove, true);
        document.addEventListener('mouseup', this.onMouseUp, true);

        this.unsubHighlight = api.playbackRangeHighlightChanged.on(e => this.update(e));
    }

    private beginDrag(e: MouseEvent, side: DragSide): void {
        e.preventDefault();
        this.dragging = side;
        // the opposite edge stays fixed while dragging
        this.dragAnchor = side === 'start' ? this.currentHighlight?.endBeat : this.currentHighlight?.startBeat;
        this.viewportEl.classList.add('at-selection-handle-drag');
        const handle = side === 'start' ? this.startHandle : this.endHandle;
        handle.classList.add('dragging');
    }

    private endDrag(): void {
        if (!this.dragging) {
            return;
        }
        const handle = this.dragging === 'start' ? this.startHandle : this.endHandle;
        handle.classList.remove('dragging');
        this.viewportEl.classList.remove('at-selection-handle-drag');
        this.dragging = undefined;
        this.dragAnchor = undefined;
    }

    private update(e: alphaTab.PlaybackHighlightChangeEventArgs): void {
        this.currentHighlight = e;
        const blocks = e.highlightBlocks;
        if (!e.startBeat || !e.endBeat || !blocks || blocks.length === 0) {
            this.startHandle.classList.remove('active');
            this.endHandle.classList.remove('active');
            return;
        }
        // Align with the drawn highlight, which may extend to the bar edges.
        const startBlock = blocks[0];
        const endBlock = blocks[blocks.length - 1];
        this.startHandle.classList.add('active');
        this.startHandle.style.left = `${startBlock.x}px`;
        this.startHandle.style.top = `${startBlock.y}px`;
        this.startHandle.style.height = `${startBlock.h}px`;
        this.endHandle.classList.add('active');
        this.endHandle.style.left = `${endBlock.x + endBlock.w}px`;
        this.endHandle.style.top = `${endBlock.y}px`;
        this.endHandle.style.height = `${endBlock.h}px`;
    }

    private beatFromEvent(e: MouseEvent, anchor: alphaTab.model.Beat): alphaTab.model.Beat | undefined {
        const surface = this.canvasEl.querySelector<HTMLElement>('.at-surface');
        if (!surface) {
            return undefined;
        }
        // Bounds are relative to the score surface, not the scrolled viewport.
        const rect = surface.getBoundingClientRect();
        const relX = (e.clientX - rect.left) * (surface.offsetWidth / rect.width);
        const relY = (e.clientY - rect.top) * (surface.offsetHeight / rect.height);
        const beat = this.api.boundsLookup?.getBeatAtPos(relX, relY);
        if (!beat) {
            return undefined;
        }
        const bounds = this.api.boundsLookup!.findBeat(beat);
        if (!bounds) {
            return undefined;
        }
        // A beat joins the selection once the pointer passes the center of its glyph:
        // after the anchor the edge is the end of a beat, before it the start of one.
        const isAfterAnchor = beat.absolutePlaybackStart >= anchor.absolutePlaybackStart;
        const isRightHalf = relX >= bounds.visualBounds.x + bounds.visualBounds.w / 2;
        if (isAfterAnchor) {
            return (isRightHalf ? beat : beat.previousBeat) ?? undefined;
        }
        return (isRightHalf ? beat.nextBeat : beat) ?? undefined;
    }

    dispose(): void {
        document.removeEventListener('mousemove', this.onMouseMove, true);
        document.removeEventListener('mouseup', this.onMouseUp, true);
        this.unsubHighlight();
        this.root.remove();
    }
}
