import type * as alphaTab from '@coderline/alphatab';
import { type Mountable, css, html, injectStyles, mount, parseHtml } from '../util/Dom';
import { ProgressBar } from './primitives/ProgressBar';

injectStyles(
    'TimeSlider',
    css`
    .at-time-slider-wrap { width: 100%; }
`
);

export class TimeSlider implements Mountable {
    readonly root: HTMLElement;
    private bar: ProgressBar;
    private endTime = 0;
    private unsubMidiLoaded: () => void;
    private unsubPosition: () => void;

    constructor(api: alphaTab.AlphaTabApi) {
        this.root = parseHtml(html`
            <div class="at-time-slider-wrap">
                <div class="cmp-progress"></div>
            </div>
        `);
        this.bar = mount(this.root, '.cmp-progress', new ProgressBar());
        this.bar.onClickPercent = percent => {
            if (this.endTime > 0) {
                api.timePosition = Math.floor(this.endTime * percent);
            }
        };

        this.unsubMidiLoaded = api.midiLoaded.on(e => {
            this.endTime = e.endTime;
        });
        this.unsubPosition = api.playerPositionChanged.on(args => {
            if (args.endTime > 0) {
                this.bar.setValue(args.currentTime / args.endTime);
            }
        });
    }

    dispose(): void {
        this.unsubMidiLoaded();
        this.unsubPosition();
        this.bar.dispose();
        this.root.remove();
    }
}
