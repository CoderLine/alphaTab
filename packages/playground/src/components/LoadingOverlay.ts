import type * as alphaTab from '@coderline/alphatab';
import { type Mountable, css, html, injectStyles, mount, parseHtml } from '../util/Dom';
import { Spinner } from './primitives/Spinner';

injectStyles(
    'LoadingOverlay',
    css`
    .at-overlay {
        display: flex;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1002;
        backdrop-filter: blur(3px);
        background: var(--at-overlay-bg);
        justify-content: center;
        align-items: flex-start;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
        transition-delay: 0;
    }
    .at-overlay.visible {
        visibility: visible;
        opacity: 1;
        transition-delay: 0.2s;
    }
    .at-overlay > .at-overlay-content {
        margin-top: 20px;
        background: #fff;
        box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.3);
        padding: 10px;
    }
`
);

export class LoadingOverlay implements Mountable {
    readonly root: HTMLElement;
    private unsubRenderStarted: () => void;
    private unsubRenderFinished: () => void;
    private dragCount = 0;

    constructor(api: alphaTab.AlphaTabApi) {
        this.root = parseHtml(html`
            <div class="at-overlay">
                <div class="at-overlay-content">
                    <div class="cmp-spinner"></div>
                </div>
            </div>
        `);
        mount(this.root, '.cmp-spinner', new Spinner());

        this.unsubRenderStarted = api.renderStarted.on(isResize => {
            if (!isResize) {
                this.setVisible(true);
            }
        });
        this.unsubRenderFinished = api.renderFinished.on(() => {
            this.setVisible(false);
        });
    }

    setVisible(visible: boolean): void {
        this.root.classList.toggle('visible', visible);
    }

    enterDrag(): void {
        this.dragCount++;
        this.setVisible(true);
    }

    leaveDrag(): void {
        this.dragCount = Math.max(0, this.dragCount - 1);
        if (this.dragCount === 0) {
            this.setVisible(false);
        }
    }

    dispose(): void {
        this.unsubRenderStarted();
        this.unsubRenderFinished();
        this.root.remove();
    }
}
