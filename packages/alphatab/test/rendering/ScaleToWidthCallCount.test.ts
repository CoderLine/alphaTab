/**
 * Counter test: BarRendererBase.scaleToWidth runs at most once per renderer
 * per cycle. Uses prototype monkey-patching, so web-only.
 *
 * @target web
 */
import { AlphaTabApiBase } from '@coderline/alphatab/AlphaTabApiBase';
import { AlphaTabError, AlphaTabErrorType } from '@coderline/alphatab/AlphaTabError';
import { AlphaTexImporter } from '@coderline/alphatab/importer/AlphaTexImporter';
import { ByteBuffer } from '@coderline/alphatab/io/ByteBuffer';
import { LayoutMode } from '@coderline/alphatab/LayoutMode';
import { JsonConverter } from '@coderline/alphatab/model/JsonConverter';
import type { Score } from '@coderline/alphatab/model/Score';
import { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import type { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import type { ScoreRendererWrapper } from '@coderline/alphatab/rendering/ScoreRendererWrapper';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, expect, it } from 'vitest';
import { TestUiFacade } from '../visualTests/TestUiFacade';
import { VisualTestHelper } from '../visualTests/VisualTestHelper';

/**
 * @record
 * @internal
 */
interface ScaleToWidthCallCounts {
    counts: Map<BarRendererBase, number>;
    renderers: BarRendererBase[];
}

/**
 * @internal
 */
class ScaleToWidthCallCountHelper {
    public static async loadScore(tex: string): Promise<Score> {
        const settings = new Settings();
        const importer = new AlphaTexImporter();
        importer.init(ByteBuffer.fromString(tex), settings);
        return importer.readScore();
    }

    public static collectRenderers(api: AlphaTabApiBase<unknown>): BarRendererBase[] {
        const wrapper = api.renderer as unknown as ScoreRendererWrapper;
        const inner = wrapper.instance as unknown as ScoreRenderer;
        const systems = inner.layout!.systems;
        const out: BarRendererBase[] = [];
        for (const s of systems) {
            for (const g of s.staves) {
                for (const staff of g.staves) {
                    for (const r of staff.barRenderers) {
                        out.push(r);
                    }
                }
            }
        }
        return out;
    }

    public static async renderAndCount(
        tex: string,
        width: number,
        layoutMode: LayoutMode
    ): Promise<ScaleToWidthCallCounts> {
        await VisualTestHelper.prepareAlphaSkia();
        const score = await ScaleToWidthCallCountHelper.loadScore(tex);
        const settings = new Settings();
        settings.display.layoutMode = layoutMode;
        VisualTestHelper.prepareSettingsForTest(settings);

        const counts = new Map<BarRendererBase, number>();
        const originalScaleToWidth = BarRendererBase.prototype.scaleToWidth;
        BarRendererBase.prototype.scaleToWidth = function (this: BarRendererBase, w: number): void {
            counts.set(this, (counts.get(this) ?? 0) + 1);
            originalScaleToWidth.call(this, w);
        };

        const uiFacade = new TestUiFacade();
        uiFacade.rootContainer.width = width;
        const api = new AlphaTabApiBase<unknown>(uiFacade, settings);

        try {
            await new Promise<void>((resolve, reject) => {
                api.renderer.postRenderFinished.on(() => resolve());
                api.error.on(e => {
                    reject(
                        new AlphaTabError(AlphaTabErrorType.General, `Render failed (${e.message})`, e)
                    );
                });
                const renderScore = JsonConverter.jsObjectToScore(JsonConverter.scoreToJsObject(score), settings);
                api.renderScore(renderScore, [0]);
                setTimeout(() => reject(new Error('render timed out')), 5000);
            });
            const renderers = ScaleToWidthCallCountHelper.collectRenderers(api);
            return { counts, renderers };
        } finally {
            BarRendererBase.prototype.scaleToWidth = originalScaleToWidth;
            api.destroy();
        }
    }
}

describe('ScaleToWidthCallCount', () => {
    it('§H Step 7: vertical layout — scaleToWidth runs exactly once per renderer per cycle', async () => {
        const tex = `
            \\track "T1"
            \\staff {score}
            C4.4 *4 | C4.4 *4 | C4.4 *4 | C4.4 *4
        `;
        const result = await ScaleToWidthCallCountHelper.renderAndCount(tex, 1500, LayoutMode.Page);
        const counts = result.counts;
        const renderers = result.renderers;

        expect(renderers.length).toBeGreaterThan(0);
        for (const r of renderers) {
            expect(counts.get(r) ?? 0).toBe(1);
        }
    });

    it('§H Step 7: horizontal layout — scaleToWidth runs exactly once per renderer per cycle', async () => {
        const tex = `
            \\track "T1"
            \\staff {score}
            C4.4 *4 | C4.4 *4 | C4.4 *4
        `;
        const result = await ScaleToWidthCallCountHelper.renderAndCount(tex, 1500, LayoutMode.Horizontal);
        const counts = result.counts;
        const renderers = result.renderers;

        expect(renderers.length).toBeGreaterThan(0);
        for (const r of renderers) {
            expect(counts.get(r) ?? 0).toBe(1);
        }
    });
});
