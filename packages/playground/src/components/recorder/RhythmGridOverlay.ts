import type * as alphaTab from '@coderline/alphatab';
import { type Mountable, css, html, injectStyles, parseHtml } from '../../util/Dom';
import type { RhythmConfig } from './RhythmConfig';

injectStyles(
    'RhythmGridOverlay',
    css`
    .at-rhythm-grid {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 6;
    }
    .at-rhythm-grid > .at-rhythm-tick {
        position: absolute;
    }
    .at-rhythm-grid > .at-rhythm-tick.main {
        background: rgba(0, 120, 220, 0.55);
    }
    .at-rhythm-grid > .at-rhythm-tick.sub {
        background: rgba(0, 120, 220, 0.25);
    }
`
);

const TICK_LENGTH = 12;

export class RhythmGridOverlay implements Mountable {
    readonly root: HTMLElement;
    private unsubPostRender: () => void;

    constructor(
        private api: alphaTab.AlphaTabApi,
        private config: RhythmConfig
    ) {
        this.root = parseHtml(html`<div class="at-rhythm-grid"></div>`);
        this.unsubPostRender = api.postRenderFinished.on(() => this.redraw());
    }

    setConfig(config: RhythmConfig): void {
        this.config = config;
        this.redraw();
    }

    private redraw(): void {
        this.root.replaceChildren();
        const lookup = this.api.renderer?.boundsLookup;
        if (!lookup) {
            return;
        }
        for (const system of lookup.staffSystems) {
            for (const masterBarBounds of system.bars) {
                for (const barBounds of masterBarBounds.bars) {
                    const beats = barBounds.beats;
                    const barTop = barBounds.realBounds.y;
                    const barBottom = barBounds.realBounds.y + barBounds.realBounds.h;
                    for (let i = 0; i < beats.length && i < this.config.beatMask.length; i++) {
                        const weight = this.config.beatMask[i];
                        if (weight > this.config.displayWeightThreshold) {
                            continue;
                        }
                        const isMain = weight === 4;
                        const width = isMain ? 2 : 1;
                        const x = beats[i].realBounds.x;
                        const cls = isMain ? 'at-rhythm-tick main' : 'at-rhythm-tick sub';

                        const top = document.createElement('div');
                        top.className = cls;
                        top.style.left = `${x}px`;
                        top.style.top = `${barTop - TICK_LENGTH}px`;
                        top.style.width = `${width}px`;
                        top.style.height = `${TICK_LENGTH}px`;
                        this.root.appendChild(top);

                        const bottom = document.createElement('div');
                        bottom.className = cls;
                        bottom.style.left = `${x}px`;
                        bottom.style.top = `${barBottom}px`;
                        bottom.style.width = `${width}px`;
                        bottom.style.height = `${TICK_LENGTH}px`;
                        this.root.appendChild(bottom);
                    }
                }
            }
        }
    }

    dispose(): void {
        this.unsubPostRender();
        this.root.remove();
    }
}
