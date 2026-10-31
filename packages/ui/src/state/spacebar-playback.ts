import type * as alphaTab from '@coderline/alphatab';

/**
 * Space toggles play/pause of the most visible registered player, so a page with many
 * players needs no focus target per player. One document-level `keydown` listener serves
 * every registered player.
 *
 * - Only `code === 'Space'` without Ctrl, Meta or Alt is handled. Presses inside inputs,
 *   textareas, selects, contenteditable or EditContext elements are left to the element.
 * - "Most visible" is the registered container with the largest area inside the viewport.
 *   When none is on screen, the press is not intercepted, so the page scrolls as usual.
 */

interface Entry {
    el: HTMLElement;
    api: alphaTab.AlphaTabApi;
}

const registry = new Set<Entry>();
let listenerInstalled = false;

function isTypingContext(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) { return false; }
    const tag = target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') { return true; }
    if (target.isContentEditable) { return true; }
    // Editors built on the EditContext API (e.g. Monaco) receive text input on a plain element.
    if ((target as HTMLElement & { editContext?: unknown }).editContext) { return true; }
    return false;
}

function visibleArea(el: HTMLElement): number {
    const r = el.getBoundingClientRect();
    const w = window.innerWidth;
    const h = window.innerHeight;
    const visW = Math.max(0, Math.min(r.right, w) - Math.max(r.left, 0));
    const visH = Math.max(0, Math.min(r.bottom, h) - Math.max(r.top, 0));
    return visW * visH;
}

function findMostVisible(): Entry | null {
    let best: Entry | null = null;
    let bestArea = 0;
    for (const entry of registry) {
        const area = visibleArea(entry.el);
        if (area > bestArea) {
            bestArea = area;
            best = entry;
        }
    }
    return best;
}

function onKeyDown(e: KeyboardEvent): void {
    if (e.code !== 'Space') { return; }
    if (isTypingContext(e.target)) { return; }
    // Also skip when a modifier is held so browser shortcuts still work.
    if (e.ctrlKey || e.metaKey || e.altKey) { return; }
    const target = findMostVisible();
    if (!target) { return; }
    e.preventDefault();
    target.api.playPause();
}

function ensureListener(): void {
    if (listenerInstalled) { return; }
    if (typeof document === 'undefined') { return; }
    document.addEventListener('keydown', onKeyDown, true);
    listenerInstalled = true;
}

export function registerForSpacebar(el: HTMLElement, api: alphaTab.AlphaTabApi): () => void {
    ensureListener();
    const entry: Entry = { el, api };
    registry.add(entry);
    return () => {
        registry.delete(entry);
    };
}
