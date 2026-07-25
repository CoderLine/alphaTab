import type * as alphaTab from '@coderline/alphatab';

/**
 * Global spacebar-to-playPause coordinator.
 *
 * Temporary QA convenience — pages that mount many `<AlphaTab>` demos would
 * otherwise need one focus target per demo to be keyboard-controllable. This
 * module keeps a live registry of every mounted alphaTab api + its container
 * element, and installs a single document-level `keydown` listener that
 * dispatches spacebar presses to whichever registered player is most visible
 * in the viewport.
 *
 * Behaviour:
 *   - Only spacebar (`code === 'Space'`) is intercepted.
 *   - Presses that originate inside an input / textarea / contenteditable
 *     element are ignored so authors can still type freely.
 *   - "Most visible" = the registered container whose intersection with the
 *     viewport has the largest area. If nothing is on-screen, the press is
 *     ignored (no scrolling hijack).
 */

interface Entry {
    el: HTMLElement;
    api: alphaTab.AlphaTabApi;
}

const registry = new Set<Entry>();
let listenerInstalled = false;

function isTypingContext(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    const tag = target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (target.isContentEditable) return true;
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
    if (e.code !== 'Space') return;
    if (isTypingContext(e.target)) return;
    // Also skip when a modifier is held so browser shortcuts still work.
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const target = findMostVisible();
    if (!target) return;
    e.preventDefault();
    target.api.playPause();
}

function ensureListener(): void {
    if (listenerInstalled) return;
    if (typeof document === 'undefined') return;
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
