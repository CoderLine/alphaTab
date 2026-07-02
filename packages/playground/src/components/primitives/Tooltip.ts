import { createPopper, type Instance as PopperInstance } from '@popperjs/core';
import { type Mountable, css, html, injectStyles, parseHtml } from '../../util/Dom';

injectStyles(
    'Tooltip',
    css`
    .at-tooltip {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 20000;
        background: rgba(33, 37, 41, 0.95);
        color: #fff;
        padding: 4px 8px;
        font-size: 12px;
        border-radius: 4px;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.12s ease-in-out;
        max-width: 220px;
        white-space: nowrap;
    }
    .at-tooltip.visible { opacity: 1; }
`
);

export interface TooltipOptions {
    placement?: 'top' | 'bottom' | 'left' | 'right';
}

export class Tooltip implements Mountable {
    readonly root: HTMLElement;
    private popper: PopperInstance | null = null;
    private mouseEnter = () => this.show();
    private mouseLeave = () => this.hide();
    private focusIn = () => this.show();
    private focusOut = () => this.hide();

    constructor(
        private target: HTMLElement,
        private text: string,
        private options: TooltipOptions = {}
    ) {
        this.root = parseHtml(html`<div class="at-tooltip" role="tooltip">${text}</div>`);
        this.target.addEventListener('mouseenter', this.mouseEnter);
        this.target.addEventListener('mouseleave', this.mouseLeave);
        this.target.addEventListener('focusin', this.focusIn);
        this.target.addEventListener('focusout', this.focusOut);
    }

    setText(text: string): void {
        this.text = text;
        this.root.textContent = text;
    }

    private show(): void {
        if (!this.text) {
            return;
        }
        if (!this.root.parentElement) {
            document.body.appendChild(this.root);
        }
        if (!this.popper) {
            this.popper = createPopper(this.target, this.root, {
                placement: this.options.placement ?? 'top',
                modifiers: [{ name: 'offset', options: { offset: [0, 6] } }]
            });
        } else {
            this.popper.update();
        }
        this.root.classList.add('visible');
    }

    private hide(): void {
        this.root.classList.remove('visible');
    }

    dispose(): void {
        this.target.removeEventListener('mouseenter', this.mouseEnter);
        this.target.removeEventListener('mouseleave', this.mouseLeave);
        this.target.removeEventListener('focusin', this.focusIn);
        this.target.removeEventListener('focusout', this.focusOut);
        if (this.popper) {
            this.popper.destroy();
            this.popper = null;
        }
        this.root.remove();
    }
}
