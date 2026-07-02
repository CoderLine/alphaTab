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
    private unsubHighlight: () => void;

    private onMouseMove = (e: MouseEvent) => {
        if (!this.dragging) {
            return;
        }
        e.preventDefault();
        const beat = this.beatFromEvent(e);
        if (!beat || !this.currentHighlight) {
            return;
        }
        if (this.dragging === 'start') {
            this.api.highlightPlaybackRange(beat, this.currentHighlight.endBeat!);
        } else {
            this.api.highlightPlaybackRange(this.currentHighlight.startBeat!, beat);
        }
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
        private viewportEl: HTMLElement
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
    }

    private update(e: alphaTab.PlaybackHighlightChangeEventArgs): void {
        this.currentHighlight = e;
        if (!e.startBeat || !e.endBeat) {
            this.startHandle.classList.remove('active');
            this.endHandle.classList.remove('active');
            return;
        }
        const startBounds = e.startBeatBounds!;
        const endBounds = e.endBeatBounds!;
        this.startHandle.classList.add('active');
        this.startHandle.style.left = `${startBounds.realBounds.x}px`;
        this.startHandle.style.top = `${startBounds.barBounds.masterBarBounds.visualBounds.y}px`;
        this.startHandle.style.height = `${startBounds.barBounds.masterBarBounds.visualBounds.h}px`;
        this.endHandle.classList.add('active');
        this.endHandle.style.left = `${endBounds.realBounds.x + endBounds.realBounds.w}px`;
        this.endHandle.style.top = `${endBounds.barBounds.masterBarBounds.visualBounds.y}px`;
        this.endHandle.style.height = `${endBounds.barBounds.masterBarBounds.visualBounds.h}px`;
    }

    private beatFromEvent(e: MouseEvent): alphaTab.model.Beat | undefined {
        const rect = this.viewportEl.getBoundingClientRect();
        const relX = e.clientX - rect.left;
        const relY = e.clientY - rect.top;
        const beat = this.api.boundsLookup?.getBeatAtPos(relX, relY);
        if (!beat) {
            return undefined;
        }
        const bounds = this.api.boundsLookup!.findBeat(beat);
        if (!bounds) {
            return undefined;
        }
        const visualEnd = bounds.visualBounds.x + bounds.visualBounds.w;
        const realEnd = bounds.realBounds.x + bounds.realBounds.w;
        if (relX < visualEnd || relX > realEnd) {
            return undefined;
        }
        return beat;
    }

    dispose(): void {
        document.removeEventListener('mousemove', this.onMouseMove, true);
        document.removeEventListener('mouseup', this.onMouseUp, true);
        this.unsubHighlight();
        this.root.remove();
    }
}
