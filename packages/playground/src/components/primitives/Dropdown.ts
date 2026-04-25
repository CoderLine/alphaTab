import { createPopper, type Instance as PopperInstance } from '@popperjs/core';
import { type Mountable, css, escapeHtml, html, injectStyles, parseHtml } from '../../util/Dom';
import type { IconNode } from '../../util/Icons';
import { icon as renderIcon } from '../../util/Icons';
import { Tooltip } from './Tooltip';

injectStyles(
    'Dropdown',
    css`
    .at-dropdown {
        position: relative;
        display: inline-flex;
    }
    .at-dropdown-toggle {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 10px;
        height: 40px;
        min-width: 40px;
        border: 0;
        background: transparent;
        color: inherit;
        cursor: pointer;
        font: inherit;
        transition: background-color 0.15s ease-in-out;
    }
    .at-dropdown-toggle:hover:not([disabled]),
    .at-dropdown.open > .at-dropdown-toggle { background: var(--at-accent-hover); }
    .at-dropdown-toggle[disabled] { opacity: 0.4; cursor: default; }
    .at-dropdown-toggle > .at-dropdown-icon { display: inline-flex; }
    .at-dropdown-toggle > .at-dropdown-icon > svg { width: 16px; height: 16px; }
    .at-dropdown-toggle > .at-dropdown-label { font-size: 12px; }
    .at-dropdown-toggle > .at-dropdown-caret > svg { width: 12px; height: 12px; }

    .at-dropdown-menu {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 20000;
        min-width: 140px;
        background: #fff;
        color: #212529;
        border-radius: 4px;
        box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.2),
                    0 4px 5px 0 rgba(0, 0, 0, 0.14),
                    0 1px 10px 0 rgba(0, 0, 0, 0.12);
        padding: 4px 0;
        margin: 0;
        list-style: none;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.12s ease-in-out;
    }
    .at-dropdown-menu.open { opacity: 1; visibility: visible; }
    .at-dropdown-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        cursor: pointer;
        white-space: nowrap;
        background: transparent;
        border: 0;
        color: inherit;
        font: inherit;
        text-align: left;
        width: 100%;
    }
    .at-dropdown-item:hover { background: rgba(0, 0, 0, 0.06); }
    .at-dropdown-item.active { background: rgba(0, 0, 0, 0.08); font-weight: 500; }
    .at-dropdown-item > .at-dropdown-item-icon > svg { width: 16px; height: 16px; }
`
);

export interface DropdownItem<T = string> {
    value: T;
    label: string;
    icon?: IconNode;
}

export interface DropdownProps<T = string> {
    icon?: IconNode;
    label?: string;
    tooltip?: string;
    items?: DropdownItem<T>[];
    initialValue?: T;
    placement?: 'top' | 'bottom';
    /** Called the first time the dropdown opens; can populate items dynamically. */
    onOpen?: () => DropdownItem<T>[] | Promise<DropdownItem<T>[]> | undefined;
}

export class Dropdown<T = string> implements Mountable {
    readonly root: HTMLElement;
    private toggle: HTMLButtonElement;
    private labelEl: HTMLElement;
    private menu: HTMLElement;
    private popper: PopperInstance | null = null;
    private items: DropdownItem<T>[];
    private currentValue: T | undefined;
    private isOpen = false;
    private tooltip: Tooltip | null = null;
    private outsideClick = (e: MouseEvent) => {
        if (!this.root.contains(e.target as Node) && !this.menu.contains(e.target as Node)) {
            this.close();
        }
    };
    private onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && this.isOpen) {
            e.preventDefault();
            this.close();
            this.toggle.focus();
        }
    };

    onSelect: ((value: T, item: DropdownItem<T>) => void) | null = null;

    constructor(private props: DropdownProps<T>) {
        this.items = props.items ?? [];
        this.currentValue = props.initialValue;

        const iconHtml = props.icon ? '<span class="at-dropdown-icon"></span>' : '';
        const labelHtml = props.label ? `<span class="at-dropdown-label">${escapeHtml(props.label)}</span>` : '<span class="at-dropdown-label"></span>';
        this.root = parseHtml(html`
            <div class="at-dropdown">
                <button type="button" class="at-dropdown-toggle" aria-haspopup="true" aria-expanded="false">
                    ${iconHtml}
                    ${labelHtml}
                    <span class="at-dropdown-caret"></span>
                </button>
            </div>
        `);
        // restore raw HTML overrides since `html` escaped the slot strings above
        const toggleEl = this.root.querySelector<HTMLButtonElement>('.at-dropdown-toggle')!;
        toggleEl.innerHTML = `${iconHtml}${labelHtml}<span class="at-dropdown-caret"></span>`;
        this.toggle = toggleEl;
        this.labelEl = this.toggle.querySelector('.at-dropdown-label')!;
        if (props.icon) {
            this.toggle.querySelector('.at-dropdown-icon')!.appendChild(renderIcon(props.icon));
        }
        // small caret
        const caretSlot = this.toggle.querySelector('.at-dropdown-caret')!;
        caretSlot.appendChild(this.makeCaret());

        this.menu = parseHtml(html`<div class="at-dropdown-menu" role="menu"></div>`);
        this.renderItems();

        if (props.tooltip) {
            this.tooltip = new Tooltip(this.toggle, props.tooltip);
        }

        this.toggle.addEventListener('click', e => {
            e.stopPropagation();
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        });
    }

    private makeCaret(): SVGSVGElement {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 12 12');
        svg.setAttribute('width', '12');
        svg.setAttribute('height', '12');
        svg.setAttribute('aria-hidden', 'true');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M2 4 L6 8 L10 4');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', 'currentColor');
        path.setAttribute('stroke-width', '1.5');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        svg.appendChild(path);
        return svg;
    }

    setItems(items: DropdownItem<T>[]): void {
        this.items = items;
        this.renderItems();
    }

    setLabel(label: string): void {
        this.labelEl.textContent = label;
    }

    setValue(value: T): void {
        this.currentValue = value;
        this.menu.querySelectorAll('.at-dropdown-item').forEach(el => {
            const v = (el as HTMLElement).dataset.value;
            el.classList.toggle('active', v === String(value));
        });
    }

    setEnabled(enabled: boolean): void {
        this.toggle.disabled = !enabled;
    }

    private async open(): Promise<void> {
        if (this.props.onOpen) {
            const result = await this.props.onOpen();
            if (Array.isArray(result)) {
                this.setItems(result);
            }
        }
        if (!this.menu.parentElement) {
            document.body.appendChild(this.menu);
        }
        if (!this.popper) {
            this.popper = createPopper(this.toggle, this.menu, {
                placement: this.props.placement === 'bottom' ? 'bottom-start' : 'top-start',
                modifiers: [{ name: 'offset', options: { offset: [0, 4] } }]
            });
        } else {
            this.popper.update();
        }
        this.isOpen = true;
        this.root.classList.add('open');
        this.menu.classList.add('open');
        this.toggle.setAttribute('aria-expanded', 'true');
        document.addEventListener('mousedown', this.outsideClick, true);
        document.addEventListener('keydown', this.onKey, true);
    }

    private close(): void {
        this.isOpen = false;
        this.root.classList.remove('open');
        this.menu.classList.remove('open');
        this.toggle.setAttribute('aria-expanded', 'false');
        document.removeEventListener('mousedown', this.outsideClick, true);
        document.removeEventListener('keydown', this.onKey, true);
    }

    private renderItems(): void {
        this.menu.replaceChildren();
        for (const item of this.items) {
            const el = parseHtml(html`<button type="button" class="at-dropdown-item" role="menuitem"></button>`);
            el.dataset.value = String(item.value);
            if (item.icon) {
                const iconWrap = document.createElement('span');
                iconWrap.className = 'at-dropdown-item-icon';
                iconWrap.appendChild(renderIcon(item.icon));
                el.appendChild(iconWrap);
            }
            const labelWrap = document.createElement('span');
            labelWrap.className = 'at-dropdown-item-label';
            labelWrap.textContent = item.label;
            el.appendChild(labelWrap);
            if (this.currentValue !== undefined && String(this.currentValue) === String(item.value)) {
                el.classList.add('active');
            }
            el.addEventListener('click', e => {
                e.stopPropagation();
                this.setValue(item.value);
                this.close();
                this.onSelect?.(item.value, item);
            });
            this.menu.appendChild(el);
        }
    }

    dispose(): void {
        this.close();
        this.tooltip?.dispose();
        this.popper?.destroy();
        this.menu.remove();
        this.root.remove();
    }
}
