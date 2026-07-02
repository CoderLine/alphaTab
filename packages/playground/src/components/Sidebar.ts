import type * as alphaTab from '@coderline/alphatab';
import { type Mountable, css, html, injectStyles, mount, parseHtml } from '../util/Dom';
import { TrackList } from './TrackList';

injectStyles(
    'Sidebar',
    css`
    .at-sidebar {
        max-width: 70px;
        width: auto;
        display: flex;
        align-content: stretch;
        z-index: 1001;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        overflow: hidden;
        border-right: 1px solid rgba(0, 0, 0, 0.12);
        background: var(--at-sidebar-bg);
    }
    .at-sidebar:hover {
        max-width: 400px;
        transition: max-width 0.2s;
        overflow-y: auto;
    }
    .at-sidebar > .at-sidebar-content {
        flex: 1 1 auto;
        min-width: 0;
    }
    @media screen and (max-width: 1100px) {
        .at-sidebar { display: none; }
    }
`
);

export class Sidebar implements Mountable {
    readonly root: HTMLElement;
    readonly trackList: TrackList;

    constructor(api: alphaTab.AlphaTabApi) {
        this.root = parseHtml(html`
            <div class="at-sidebar">
                <div class="at-sidebar-content">
                    <div class="cmp-track-list"></div>
                </div>
            </div>
        `);
        this.trackList = mount(this.root, '.cmp-track-list', new TrackList(api));
    }

    dispose(): void {
        this.trackList.dispose();
        this.root.remove();
    }
}
