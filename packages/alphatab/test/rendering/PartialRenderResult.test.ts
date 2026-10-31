import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import type { RenderFinishedEventArgs } from '@coderline/alphatab/rendering/RenderFinishedEventArgs';
import { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, expect, it } from 'vitest';

describe('PartialRenderResult', () => {
    const tex = '\\title "Title" \\track \\staff {score tabs} 0.1 1.2 2.3 3.4 | 5.1 6.2 7.3 8.4 | 9.1 10.2 11.3 12.4 |';

    function createRenderer(lazy: boolean): ScoreRenderer {
        const settings = new Settings();
        settings.core.engine = 'svg';
        settings.core.enableLazyLoading = lazy;
        const renderer = new ScoreRenderer(settings);
        renderer.width = 400;
        return renderer;
    }

    function expectSameGeometry(rendered: RenderFinishedEventArgs, layout: RenderFinishedEventArgs) {
        expect(rendered.id).toBe(layout.id);
        expect(rendered.reuseViewport).toBe(layout.reuseViewport);
        expect(rendered.x).toBe(layout.x);
        expect(rendered.y).toBe(layout.y);
        expect(rendered.width).toBe(layout.width);
        expect(rendered.height).toBe(layout.height);
        expect(rendered.totalWidth).toBe(layout.totalWidth);
        expect(rendered.totalHeight).toBe(layout.totalHeight);
        expect(rendered.firstMasterBarIndex).toBe(layout.firstMasterBarIndex);
        expect(rendered.lastMasterBarIndex).toBe(layout.lastMasterBarIndex);
    }

    it('lazy-partial-delivers-result', () => {
        const renderer = createRenderer(true);
        const layouts: RenderFinishedEventArgs[] = [];
        const rendered: RenderFinishedEventArgs[] = [];
        renderer.partialLayoutFinished.on(e => {
            layouts.push(e);
        });
        renderer.partialRenderFinished.on(e => {
            rendered.push(e);
        });
        renderer.renderScore(ScoreLoader.loadAlphaTex(tex, renderer.settings), [0]);
        expect(layouts.length).toBeGreaterThan(1);
        expect(rendered.length).toBe(0);

        for (const layout of layouts) {
            renderer.renderResult(layout.id);
        }

        expect(rendered.length).toBe(layouts.length);
        for (let i = 0; i < layouts.length; i++) {
            expectSameGeometry(rendered[i], layouts[i]);
            expect((rendered[i].renderResult as string).startsWith('<svg')).toBe(true);
            expect(layouts[i].renderResult).toBeNull();
        }
    });

    it('lazy-partial-repaints-on-request', () => {
        const renderer = createRenderer(true);
        const layouts: RenderFinishedEventArgs[] = [];
        const rendered: RenderFinishedEventArgs[] = [];
        renderer.partialLayoutFinished.on(e => {
            layouts.push(e);
        });
        renderer.partialRenderFinished.on(e => {
            rendered.push(e);
        });
        renderer.renderScore(ScoreLoader.loadAlphaTex(tex, renderer.settings), [0]);

        const id = layouts[layouts.length - 1].id;
        renderer.renderResult(id);
        renderer.renderResult(id);

        expect(rendered.length).toBe(2);
        expect(rendered[1].id).toBe(id);
        expect(rendered[1] === rendered[0]).toBe(false);
        expect(rendered[0].renderResult as string).toBe(rendered[1].renderResult as string);
    });

    it('eager-partial-delivers-result', () => {
        const renderer = createRenderer(false);
        const layouts: RenderFinishedEventArgs[] = [];
        const rendered: RenderFinishedEventArgs[] = [];
        renderer.partialLayoutFinished.on(e => {
            layouts.push(e);
        });
        renderer.partialRenderFinished.on(e => {
            rendered.push(e);
        });
        renderer.renderScore(ScoreLoader.loadAlphaTex(tex, renderer.settings), [0]);

        expect(layouts.length).toBeGreaterThan(1);
        expect(rendered.length).toBe(layouts.length);
        for (let i = 0; i < layouts.length; i++) {
            expectSameGeometry(rendered[i], layouts[i]);
            expect((rendered[i].renderResult as string).startsWith('<svg')).toBe(true);
        }
    });
});
