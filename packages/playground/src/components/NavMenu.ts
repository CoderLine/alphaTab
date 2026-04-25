import { createPopper, type Instance as PopperInstance } from '@popperjs/core';
import { type DemoEntry, DEMOS } from '../util/Demos';
import { type Mountable, css, html, injectStyles, parseHtml } from '../util/Dom';
import { Icons, icon as renderIcon } from '../util/Icons';

injectStyles(
    'NavMenu',
    css`
    .at-nav-menu {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 10000;
    }
    .at-nav-menu-trigger {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: rgba(33, 37, 41, 0.92);
        color: #fff;
        border: 0;
        border-radius: 6px;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
        transition: background-color 0.15s ease-in-out;
    }
    .at-nav-menu-trigger:hover { background: rgba(33, 37, 41, 1); }
    .at-nav-menu-trigger > svg { width: 18px; height: 18px; }

    .at-nav-menu-popover {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 20000;
        min-width: 220px;
        background: #fff;
        color: #212529;
        border-radius: 6px;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
        padding: 6px 0;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.12s ease-in-out;
    }
    .at-nav-menu-popover.open { opacity: 1; visibility: visible; }
    .at-nav-menu-item {
        display: block;
        padding: 8px 14px;
        color: inherit;
        text-decoration: none;
        font-size: 0.9rem;
    }
    .at-nav-menu-item:hover { background: rgba(0, 0, 0, 0.06); }
    .at-nav-menu-item.active { background: rgba(73, 114, 161, 0.12); font-weight: 500; }
    .at-nav-menu-divider {
        height: 1px;
        background: rgba(0, 0, 0, 0.08);
        margin: 4px 0;
    }
`
);

export interface NavMenuOptions {
    /** Demos to list. Defaults to the shared `DEMOS` array. */
    items?: DemoEntry[];
    /** Whether to include a "Labs index" link to /. Default: true. */
    includeIndex?: boolean;
}

export class NavMenu implements Mountable {
    readonly root: HTMLElement;
    private trigger: HTMLButtonElement;
    private popover: HTMLElement;
    private popper: PopperInstance | null = null;
    private isOpen = false;

    private outsideClick = (e: MouseEvent) => {
        if (!this.root.contains(e.target as Node) && !this.popover.contains(e.target as Node)) {
            this.close();
        }
    };
    private onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && this.isOpen) {
            e.preventDefault();
            this.close();
            this.trigger.focus();
        }
    };

    constructor(options: NavMenuOptions = {}) {
        this.root = parseHtml(html`
            <div class="at-nav-menu">
                <button type="button" class="at-nav-menu-trigger" aria-haspopup="true" aria-expanded="false" aria-label="Open playground menu"></button>
            </div>
        `);
        this.trigger = this.root.querySelector<HTMLButtonElement>('.at-nav-menu-trigger')!;
        this.trigger.appendChild(renderIcon(Icons.Menu));

        this.popover = parseHtml(html`<nav class="at-nav-menu-popover" role="menu"></nav>`);

        const items = options.items ?? DEMOS;
        const includeIndex = options.includeIndex ?? true;
        const here = window.location.pathname;

        if (includeIndex) {
            const indexLink = parseHtml(
                html`<a class="at-nav-menu-item" href="/" role="menuitem">Labs index</a>`
            );
            if (here === '/' || here === '/index.html') {
                indexLink.classList.add('active');
            }
            this.popover.appendChild(indexLink);
            this.popover.appendChild(parseHtml(html`<div class="at-nav-menu-divider"></div>`));
        }

        for (const item of items) {
            const link = parseHtml(
                html`<a class="at-nav-menu-item" href="${item.href}" role="menuitem">${item.title}</a>`
            );
            if (here === item.href || here === `${item.href}index.html`) {
                link.classList.add('active');
            }
            this.popover.appendChild(link);
        }

        this.trigger.addEventListener('click', e => {
            e.stopPropagation();
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        });
    }

    private open(): void {
        if (!this.popover.parentElement) {
            document.body.appendChild(this.popover);
        }
        if (!this.popper) {
            this.popper = createPopper(this.trigger, this.popover, {
                placement: 'bottom-end',
                modifiers: [{ name: 'offset', options: { offset: [0, 6] } }]
            });
        } else {
            this.popper.update();
        }
        this.isOpen = true;
        this.popover.classList.add('open');
        this.trigger.setAttribute('aria-expanded', 'true');
        document.addEventListener('mousedown', this.outsideClick, true);
        document.addEventListener('keydown', this.onKey, true);
    }

    private close(): void {
        this.isOpen = false;
        this.popover.classList.remove('open');
        this.trigger.setAttribute('aria-expanded', 'false');
        document.removeEventListener('mousedown', this.outsideClick, true);
        document.removeEventListener('keydown', this.onKey, true);
    }

    dispose(): void {
        this.close();
        this.popper?.destroy();
        this.popover.remove();
        this.root.remove();
    }
}
