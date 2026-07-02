import { type Mountable, css, html, injectStyles, parseHtml } from '../../util/Dom';

injectStyles(
    'LoadingProgress',
    css`
    .at-loading-progress {
        position: relative;
        width: 28px;
        height: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 8px;
        color: inherit;
    }
    .at-loading-progress::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 50%;
        border: 3px solid #eee;
    }
    .at-loading-progress > .at-loading-progress-half {
        position: absolute;
        top: 0;
        width: 50%;
        height: 100%;
        overflow: hidden;
    }
    .at-loading-progress > .at-loading-progress-half.left { left: 0; }
    .at-loading-progress > .at-loading-progress-half.right { right: 0; }
    .at-loading-progress > .at-loading-progress-half > .at-loading-progress-arc {
        position: absolute;
        top: 0;
        width: 100%;
        height: 100%;
        border: 3px solid var(--at-accent);
    }
    .at-loading-progress > .at-loading-progress-half.left > .at-loading-progress-arc {
        left: 100%;
        border-top-right-radius: 16px;
        border-bottom-right-radius: 16px;
        border-left: 0;
        transform-origin: center left;
        transform: rotate(0deg);
    }
    .at-loading-progress > .at-loading-progress-half.right > .at-loading-progress-arc {
        left: -100%;
        border-top-left-radius: 16px;
        border-bottom-left-radius: 16px;
        border-right: 0;
        transform-origin: center right;
        transform: rotate(0deg);
    }
    .at-loading-progress > .at-loading-progress-value {
        position: relative;
        z-index: 1;
    }
`
);

export class LoadingProgress implements Mountable {
    readonly root: HTMLElement;
    private leftArc: HTMLElement;
    private rightArc: HTMLElement;
    private valueLabel: HTMLElement;

    constructor() {
        this.root = parseHtml(html`
            <div class="at-loading-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
                <span class="at-loading-progress-half left"><span class="at-loading-progress-arc"></span></span>
                <span class="at-loading-progress-half right"><span class="at-loading-progress-arc"></span></span>
                <span class="at-loading-progress-value">0</span>
            </div>
        `);
        this.leftArc = this.root.querySelector('.left > .at-loading-progress-arc')!;
        this.rightArc = this.root.querySelector('.right > .at-loading-progress-arc')!;
        this.valueLabel = this.root.querySelector('.at-loading-progress-value')!;
    }

    setValue(value: number): void {
        const percent = Math.max(0, Math.min(1, value)) * 100;
        if (percent <= 50) {
            this.rightArc.style.transform = `rotate(${(percent / 100) * 360}deg)`;
            this.leftArc.style.transform = 'rotate(0deg)';
        } else {
            this.rightArc.style.transform = 'rotate(180deg)';
            this.leftArc.style.transform = `rotate(${((percent - 50) / 100) * 360}deg)`;
        }
        this.valueLabel.textContent = String(Math.floor(percent));
        this.root.setAttribute('aria-valuenow', String(Math.floor(percent)));
    }

    dispose(): void {
        this.root.remove();
    }
}
