/**
 * Pins how the browser UI keeps and releases the DOM of render partials scrolled out of view.
 *
 * @target web
 */
import { BrowserUiFacade } from '@coderline/alphatab/platform/javascript/BrowserUiFacade';
import { DetachedPartialCache } from '@coderline/alphatab/platform/javascript/DetachedPartialCache';
import { RenderFinishedEventArgs } from '@coderline/alphatab/rendering/RenderFinishedEventArgs';
import { describe, expect, it } from 'vitest';

describe('DetachedPartialCache', () => {
    function create(budget: number, minKept: number) {
        const released: string[] = [];
        const cache = new DetachedPartialCache<string>(budget, minKept, i => released.push(i));
        return { cache, released };
    }

    it('keeps-items-within-budget', () => {
        const { cache, released } = create(100, 0);
        cache.add('a', 40);
        cache.add('b', 60);
        expect(cache.size).toBe(2);
        expect(cache.area).toBe(100);
        expect(released.length).toBe(0);
    });

    it('releases-oldest-beyond-budget', () => {
        const { cache, released } = create(100, 0);
        cache.add('a', 40);
        cache.add('b', 40);
        cache.add('c', 40);
        expect(released).toEqual(['a']);
        cache.add('d', 70);
        expect(released).toEqual(['a', 'b', 'c']);
        expect(cache.has('d')).toBe(true);
        expect(cache.area).toBe(70);
    });

    it('re-adding-makes-item-most-recent', () => {
        const { cache, released } = create(100, 0);
        cache.add('a', 40);
        cache.add('b', 40);
        cache.add('a', 40);
        cache.add('c', 40);
        expect(released).toEqual(['b']);
        expect(cache.area).toBe(80);
    });

    it('removed-items-are-not-released', () => {
        const { cache, released } = create(100, 0);
        cache.add('a', 40);
        expect(cache.remove('a')).toBe(true);
        expect(cache.remove('a')).toBe(false);
        cache.add('b', 90);
        cache.add('c', 90);
        expect(released).toEqual(['b']);
        cache.clear();
        expect(cache.size).toBe(0);
        expect(cache.area).toBe(0);
    });

    it('keeps-min-count-regardless-of-budget', () => {
        const { cache, released } = create(100, 2);
        cache.add('a', 500);
        cache.add('b', 500);
        expect(released.length).toBe(0);
        cache.add('c', 500);
        expect(released).toEqual(['a']);
        expect(cache.size).toBe(2);
    });
});

/**
 * A placeholder stand-in with the DOM members the facade uses.
 */
class FakePlaceholder {
    public layoutResultId?: string;
    public children: unknown[] = [];

    public replaceChildren(...nodes: unknown[]) {
        this.children = nodes;
    }

    public set innerHTML(value: string) {
        this.children = [{ svg: value }];
    }

    public get style(): Record<string, string> {
        return {};
    }
}

describe('BrowserUiFacadeDetachedPartials', () => {
    const viewportWidth = 1000;
    const viewportHeight = 500;

    function createFacade() {
        const requested: string[] = [];
        const placeholders: FakePlaceholder[] = [];
        const canvasElement = {
            childElementCount: 0,
            childNodes: { item: (i: number) => placeholders[i] },
            appendChild(p: FakePlaceholder) {
                placeholders.push(p);
                this.childElementCount++;
            }
        };
        const api = {
            settings: { core: { enableLazyLoading: true } },
            renderer: { renderResult: (id: string) => requested.push(id) },
            canvasElement: { element: canvasElement }
        };
        // the constructor requires a browser; the members under test only need these fields
        const facade = Object.create(BrowserUiFacade.prototype) as BrowserUiFacade;
        const internals = facade as unknown as Record<string, unknown>;
        internals._api = api;
        internals.rootContainer = { element: {} };
        internals._totalResultCount = 0;
        internals._resultIdToElementLookup = new Map();
        internals._barToElementLookup = new Map();
        internals._intersectionObserver = { observe() {}, unobserve() {} };
        internals._detachedPartials = new DetachedPartialCache<FakePlaceholder>(
            0,
            2,
            (BrowserUiFacade as unknown as Record<string, (p: FakePlaceholder) => void>)._releaseDetachedPartial
        );
        return { facade, internals, placeholders, requested };
    }

    function layout(facade: BrowserUiFacade, count: number): RenderFinishedEventArgs[] {
        const results: RenderFinishedEventArgs[] = [];
        const g = globalThis as unknown as Record<string, unknown>;
        const hadDocument = 'document' in g;
        g.document = { createElement: () => new FakePlaceholder() };
        try {
            for (let i = 0; i < count; i++) {
                const r = new RenderFinishedEventArgs();
                r.width = viewportWidth;
                r.height = viewportHeight / 2;
                r.y = (i * viewportHeight) / 2;
                facade.beginAppendRenderResults(r);
                results.push(r);
            }
        } finally {
            if (!hadDocument) {
                delete g.document;
            }
        }
        return results;
    }

    function visibility(internals: Record<string, unknown>, p: FakePlaceholder, isIntersecting: boolean) {
        (internals._onElementVisibilityChanged as (e: unknown[]) => void).call(internals, [
            {
                target: p,
                isIntersecting,
                rootBounds: { width: viewportWidth, height: viewportHeight }
            }
        ]);
    }

    function deliver(facade: BrowserUiFacade, r: RenderFinishedEventArgs) {
        const painted = new RenderFinishedEventArgs();
        painted.id = r.id;
        painted.renderResult = `<svg id="${r.id}"></svg>`;
        facade.beginUpdateRenderResults(painted);
    }

    function scrollThrough(facade: BrowserUiFacade, internals: Record<string, unknown>, count: number) {
        const placeholders: FakePlaceholder[] = [];
        const results = layout(facade, count);
        const all = internals._resultIdToElementLookup as Map<string, FakePlaceholder>;
        for (const r of results) {
            placeholders.push(all.get(r.id)!);
        }
        for (let i = 0; i < count; i++) {
            visibility(internals, placeholders[i], true);
            deliver(facade, results[i]);
            if (i > 0) {
                visibility(internals, placeholders[i - 1], false);
            }
        }
        return { results, placeholders };
    }

    it('keeps-recent-detached-partials-and-releases-older-ones', () => {
        const { facade, internals, requested } = createFacade();
        const { results, placeholders } = scrollThrough(facade, internals, 8);
        expect(requested.length).toBe(8);

        // budget: 2 viewports of 1000x500 -> 4 detached partials of 1000x250 are kept
        const cache = internals._detachedPartials as DetachedPartialCache<FakePlaceholder>;
        expect(cache.size).toBe(4);
        expect(cache.has(placeholders[6])).toBe(true);
        expect(cache.has(placeholders[2])).toBe(false);

        // scroll back by one: restored from the kept DOM without a render request
        visibility(internals, placeholders[6], true);
        expect(requested.length).toBe(8);
        expect(placeholders[6].children.length).toBe(1);

        // a released partial is requested again and filled when the result arrives
        expect(placeholders[1].children.length).toBe(0);
        visibility(internals, placeholders[1], true);
        expect(requested).toEqual([...results.map(r => r.id), results[1].id]);
        deliver(facade, results[1]);
        expect(placeholders[1].children.length).toBe(1);
    });

    it('detaches-results-arriving-for-off-screen-partials', () => {
        const { facade, internals, requested } = createFacade();
        const results = layout(facade, 1);
        const p = (internals._resultIdToElementLookup as Map<string, FakePlaceholder>).get(results[0].id)!;
        visibility(internals, p, true);
        expect(requested.length).toBe(1);
        visibility(internals, p, false);
        deliver(facade, results[0]);

        expect(p.children.length).toBe(0);
        const cache = internals._detachedPartials as DetachedPartialCache<FakePlaceholder>;
        expect(cache.has(p)).toBe(true);

        visibility(internals, p, true);
        expect(requested.length).toBe(1);
        expect(p.children.length).toBe(1);
    });
});
