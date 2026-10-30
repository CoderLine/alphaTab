/**
 * Tests for the IntersectionObserver polyfill against a fake window and document, so web-only.
 *
 * @target web
 */

import { IntersectionObserverPolyfill } from '@coderline/alphatab/platform/javascript/IntersectionObserverPolyfill';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type Listener = () => void;

class FakeEventTarget {
    public readonly listeners = new Map<string, Listener[]>();

    public addEventListener(type: string, listener: Listener): void {
        let list = this.listeners.get(type);
        if (!list) {
            list = [];
            this.listeners.set(type, list);
        }
        list.push(listener);
    }

    public dispatch(type: string): void {
        for (const l of this.listeners.get(type) ?? []) {
            l();
        }
    }
}

class FakeWindow extends FakeEventTarget {
    public innerWidth = 800;
    public innerHeight = 600;
}

class FakeElement {
    public top = 0;

    public getBoundingClientRect() {
        return { top: this.top, left: 0, width: 100, height: 100 };
    }
}

describe('IntersectionObserverPolyfillTests', () => {
    let fakeWindow: FakeWindow;
    let fakeDocument: FakeEventTarget;
    let visible: unknown[][];
    let observer: IntersectionObserverPolyfill;
    let element: FakeElement;

    beforeEach(() => {
        vi.useFakeTimers();
        fakeWindow = new FakeWindow();
        fakeDocument = new FakeEventTarget();
        vi.stubGlobal('window', fakeWindow);
        vi.stubGlobal('document', fakeDocument);

        visible = [];
        observer = new IntersectionObserverPolyfill(entries => {
            visible.push(entries.map(e => e.target));
        });
        element = new FakeElement();
        element.top = 2000;
        observer.observe(element as unknown as HTMLElement);
        vi.advanceTimersByTime(100);
        expect(visible.length).toBe(0);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.useRealTimers();
    });

    it('reports-element-scrolled-into-view', () => {
        element.top = 300;
        fakeDocument.dispatch('scroll');
        vi.advanceTimersByTime(100);

        expect(visible.length).toBe(1);
        expect(visible[0]).toEqual([element]);
    });

    it('reports-element-visible-after-resize', () => {
        fakeWindow.innerHeight = 2500;
        fakeWindow.dispatch('resize');
        vi.advanceTimersByTime(100);

        expect(visible.length).toBe(1);
        expect(visible[0]).toEqual([element]);
    });

    it('checks-once-per-burst', () => {
        element.top = 300;
        fakeDocument.dispatch('scroll');
        fakeDocument.dispatch('scroll');
        fakeWindow.dispatch('resize');
        vi.advanceTimersByTime(100);

        expect(visible.length).toBe(1);
    });

    it('ignores-unobserved-elements', () => {
        observer.unobserve(element as unknown as HTMLElement);
        element.top = 300;
        fakeDocument.dispatch('scroll');
        vi.advanceTimersByTime(100);

        expect(visible.length).toBe(0);
    });
});
