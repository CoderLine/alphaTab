import type * as alphaTab from '@coderline/alphatab';
import { type Mountable, css, html, injectStyles, parseHtml } from '../util/Dom';
import { TrackItem } from './TrackItem';

injectStyles(
    'TrackList',
    css`
    .at-track-list {
        display: flex;
        flex-direction: column;
    }
`
);

export class TrackList implements Mountable {
    readonly root: HTMLElement;
    private items: TrackItem[] = [];
    private selection = new Map<number, alphaTab.model.Track>();
    private unsubScoreLoaded: () => void;
    private unsubRenderStarted: () => void;

    constructor(private api: alphaTab.AlphaTabApi) {
        this.root = parseHtml(html`<div class="at-track-list"></div>`);

        this.unsubScoreLoaded = api.scoreLoaded.on(score => this.rebuild(score));
        this.unsubRenderStarted = api.renderStarted.on(() => this.refreshActive());
    }

    private rebuild(score: alphaTab.model.Score): void {
        for (const item of this.items) {
            item.dispose();
        }
        this.items = [];
        this.root.replaceChildren();
        this.selection.clear();

        for (const track of score.tracks) {
            const item = new TrackItem(this.api, track);
            item.onSelect = e => {
                e.stopPropagation();
                if (!e.ctrlKey) {
                    this.selection.clear();
                    this.selection.set(track.index, track);
                } else if (this.selection.has(track.index)) {
                    this.selection.delete(track.index);
                } else {
                    this.selection.set(track.index, track);
                }
                this.api.renderTracks(Array.from(this.selection.values()).sort((a, b) => a.index - b.index));
            };
            this.items.push(item);
            this.root.appendChild(item.root);
        }
        this.refreshActive();
    }

    private refreshActive(): void {
        const active = new Set<number>();
        for (const t of this.api.tracks) {
            active.add(t.index);
        }
        for (const item of this.items) {
            item.setActive(active.has(item.track.index));
        }
    }

    /** All TrackItem instances, in score order. */
    getItems(): readonly TrackItem[] {
        return this.items;
    }

    dispose(): void {
        this.unsubScoreLoaded();
        this.unsubRenderStarted();
        for (const item of this.items) {
            item.dispose();
        }
        this.items = [];
        this.root.remove();
    }
}
