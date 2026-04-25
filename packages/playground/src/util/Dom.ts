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

const injectedSheets = new Set<string>();
export function injectStyles(key: string, sheet: string): void {
    if (injectedSheets.has(key)) {
        return;
    }
    injectedSheets.add(key);
    const el = document.createElement('style');
    el.dataset.cmp = key;
    el.textContent = sheet;
    document.head.appendChild(el);
}

export function mount<T extends Mountable>(container: HTMLElement, selector: string, component: T): T {
    const placeholder = container.querySelector(selector);
    if (!placeholder) {
        throw new Error(`mount: placeholder '${selector}' not found in container`);
    }
    placeholder.replaceWith(component.root);
    return component;
}
