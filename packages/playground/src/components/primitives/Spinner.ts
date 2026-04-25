import { type Mountable, css, html, injectStyles, parseHtml } from '../../util/Dom';

injectStyles(
    'Spinner',
    css`
    @keyframes at-spinner-rotate { to { transform: rotate(360deg); } }
    .at-spinner {
        display: inline-block;
        width: 3rem;
        height: 3rem;
        vertical-align: middle;
        border: 0.25em solid currentColor;
        border-right-color: transparent;
        border-radius: 50%;
        animation: at-spinner-rotate 0.75s linear infinite;
        color: var(--at-accent);
    }
    .at-spinner.small { width: 1rem; height: 1rem; border-width: 0.15em; }
`
);

export interface SpinnerProps {
    small?: boolean;
}

export class Spinner implements Mountable {
    readonly root: HTMLElement;

    constructor(props: SpinnerProps = {}) {
        this.root = parseHtml(html`<div class="at-spinner${props.small ? ' small' : ''}" role="status" aria-label="Loading"></div>`);
    }

    dispose(): void {
        this.root.remove();
    }
}
