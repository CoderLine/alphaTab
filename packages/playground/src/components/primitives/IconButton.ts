import { type Mountable, css, html, injectStyles, parseHtml } from '../../util/Dom';
import type { IconNode } from '../../util/Icons';
import { icon as renderIcon } from '../../util/Icons';
import { Tooltip } from './Tooltip';

injectStyles(
    'IconButton',
    css`
    .at-icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 6px 10px;
        height: 40px;
        min-width: 40px;
        border: 0;
        background: transparent;
        color: inherit;
        cursor: pointer;
        border-radius: 0;
        font: inherit;
        transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out;
    }
    .at-icon-btn:hover:not([disabled]) { background: var(--at-accent-hover); }
    .at-icon-btn[disabled] { opacity: 0.4; cursor: default; }
    .at-icon-btn .at-icon-btn-icon { display: inline-flex; }
    .at-icon-btn .at-icon-btn-icon > svg { width: 16px; height: 16px; }
    .at-icon-btn .at-icon-btn-label { font-size: 12px; }
    .at-icon-btn .at-icon-btn-label:empty { display: none; }
`
);

export interface IconButtonProps {
    icon: IconNode;
    tooltip?: string;
    label?: string;
    ariaLabel?: string;
}

export class IconButton implements Mountable {
    readonly root: HTMLButtonElement;
    private iconSlot: HTMLElement;
    private labelSlot: HTMLElement;
    private tooltip: Tooltip | null = null;

    onClick: ((e: MouseEvent) => void) | null = null;

    constructor(props: IconButtonProps) {
        this.root = parseHtml(html`
            <button type="button" class="at-icon-btn" aria-label="${props.ariaLabel ?? props.tooltip ?? props.label ?? ''}">
                <span class="at-icon-btn-icon"></span>
                <span class="at-icon-btn-label">${props.label ?? ''}</span>
            </button>
        `) as HTMLButtonElement;
        this.iconSlot = this.root.querySelector('.at-icon-btn-icon')!;
        this.labelSlot = this.root.querySelector('.at-icon-btn-label')!;
        this.setIcon(props.icon);
        if (props.tooltip) {
            this.tooltip = new Tooltip(this.root, props.tooltip);
        }
        this.root.addEventListener('click', e => {
            if (this.root.disabled) {
                return;
            }
            this.onClick?.(e);
        });
    }

    setIcon(node: IconNode): void {
        this.iconSlot.replaceChildren(renderIcon(node));
    }

    setLabel(label: string): void {
        this.labelSlot.textContent = label;
    }

    setTooltip(text: string): void {
        if (this.tooltip) {
            this.tooltip.setText(text);
        } else if (text) {
            this.tooltip = new Tooltip(this.root, text);
        }
    }

    setEnabled(enabled: boolean): void {
        this.root.disabled = !enabled;
    }

    dispose(): void {
        this.tooltip?.dispose();
        this.root.remove();
    }
}
