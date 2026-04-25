import { type Mountable, css, html, injectStyles, parseHtml } from '../../util/Dom';

injectStyles(
    'ProgressBar',
    css`
    .at-progress-bar {
        position: relative;
        height: 4px;
        background: #d9d9d9;
        cursor: pointer;
        transition: height 0.1s ease;
    }
    .at-progress-bar:hover { height: 15px; }
    .at-progress-bar > .at-progress-bar-fill {
        height: 100%;
        background: var(--at-accent);
        width: 0;
    }
`
);

export class ProgressBar implements Mountable {
    readonly root: HTMLElement;
    private fill: HTMLElement;

    onClickPercent: ((percent: number) => void) | null = null;

    constructor() {
        this.root = parseHtml(html`
            <div class="at-progress-bar" role="slider" aria-valuemin="0" aria-valuemax="1" aria-valuenow="0">
                <div class="at-progress-bar-fill"></div>
            </div>
        `);
        this.fill = this.root.querySelector('.at-progress-bar-fill')!;
        this.root.addEventListener('click', e => {
            const rect = this.root.getBoundingClientRect();
            const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            this.onClickPercent?.(percent);
        });
    }

    setValue(value: number): void {
        const v = Math.max(0, Math.min(1, value));
        this.fill.style.width = `${(v * 100).toFixed(2)}%`;
        this.root.setAttribute('aria-valuenow', v.toFixed(3));
    }

    dispose(): void {
        this.root.remove();
    }
}
