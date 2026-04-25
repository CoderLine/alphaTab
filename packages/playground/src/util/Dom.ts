export interface Mountable {
    readonly root: HTMLElement;
}

export function escapeHtml(value: unknown): string {
    return String(value).replace(/[&<>"']/g, c => {
        switch (c) {
            case '&':
                return '&amp;';
            case '<':
                return '&lt;';
            case '>':
                return '&gt;';
            case '"':
                return '&quot;';
            case "'":
                return '&#39;';
            default:
                return c;
        }
    });
}

export function html(strings: TemplateStringsArray, ...values: unknown[]): string {
    return String.raw({ raw: strings }, ...values.map(v => escapeHtml(v)));
}

export function css(strings: TemplateStringsArray, ...values: unknown[]): string {
    return String.raw({ raw: strings }, ...values);
}

export function parseHtml(markup: string): HTMLElement {
    const t = document.createElement('template');
    t.innerHTML = markup.trim();
    const el = t.content.firstElementChild;
    if (!(el instanceof HTMLElement)) {
        throw new Error('parseHtml: template did not produce an HTMLElement');
    }
    // <template>.content lives in an inert "template contents owner document" with no <head>.
    // alphaTab and any other code that queries `ownerDocument` would see that inert doc — adopt
    // the element into the main document so its ownerDocument is the page document.
    return document.adoptNode(el);
}

export function injectStyles(key: string, sheet: string): void {
    // The DOM is the source of truth — keying off `data-cmp` rather than a module-level Set
    // means HMR re-runs of a component module update the sheet in place. A Set in this module
    // would stay populated across HMR (Dom.ts itself doesn't reload) and silently drop the
    // updated sheet, leaving the page styled by the stale one.
    let el = document.head.querySelector<HTMLStyleElement>(`style[data-cmp="${key}"]`);
    if (!el) {
        el = document.createElement('style');
        el.dataset.cmp = key;
        document.head.appendChild(el);
    }
    el.textContent = sheet;
}

export function mount<T extends Mountable>(container: HTMLElement, selector: string, component: T): T {
    const placeholder = container.querySelector(selector);
    if (!placeholder) {
        throw new Error(`mount: placeholder '${selector}' not found in container`);
    }
    placeholder.replaceWith(component.root);
    return component;
}
