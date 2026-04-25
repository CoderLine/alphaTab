import type * as alphaTab from '@coderline/alphatab';
import { type Mountable, css, html, injectStyles, mount, parseHtml } from '../util/Dom';
import { TimeSlider } from './TimeSlider';
import { TransportBar } from './TransportBar';
import type { TrackList } from './TrackList';
import { Waveform } from './Waveform';

injectStyles(
    'Footer',
    css`
    .at-footer {
        flex: 0 0 auto;
        background: var(--at-footer-bg);
        color: var(--at-footer-fg);
    }
    .at-footer a { color: inherit; text-decoration: none; }
`
);

export interface FooterOptions {
    trackList?: TrackList;
}

export class Footer implements Mountable {
    readonly root: HTMLElement;
    readonly waveform: Waveform;
    readonly timeSlider: TimeSlider;
    readonly transport: TransportBar;

    constructor(api: alphaTab.AlphaTabApi, options: FooterOptions = {}) {
        this.root = parseHtml(html`
            <div class="at-footer">
                <div class="cmp-waveform"></div>
                <div class="cmp-time-slider"></div>
                <div class="cmp-transport"></div>
            </div>
        `);
        this.waveform = mount(this.root, '.cmp-waveform', new Waveform(api));
        this.timeSlider = mount(this.root, '.cmp-time-slider', new TimeSlider(api));
        this.transport = mount(
            this.root,
            '.cmp-transport',
            new TransportBar(api, { trackList: options.trackList })
        );
    }

    dispose(): void {
        this.waveform.dispose();
        this.timeSlider.dispose();
        this.transport.dispose();
        this.root.remove();
    }
}
