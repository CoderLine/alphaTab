/**
 * Asserts the accolade contribution to system.width is applied exactly once
 * per cycle.
 */
import { AlphaTabApiBase } from '@coderline/alphatab/AlphaTabApiBase';
import { AlphaTabError, AlphaTabErrorType } from '@coderline/alphatab/AlphaTabError';
import { AlphaTexImporter } from '@coderline/alphatab/importer/AlphaTexImporter';
import { ByteBuffer } from '@coderline/alphatab/io/ByteBuffer';
import { JsonConverter } from '@coderline/alphatab/model/JsonConverter';
import type { Score } from '@coderline/alphatab/model/Score';
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
interface SystemMetrics {
    accoladeWidth: number;
    width: number;
    computedWidth: number;
    barWidths: number[];
}

/**
 * @internal
 */
class AccoladeIdempotenceHelper {
    public static async loadScore(tex: string): Promise<Score> {
        const settings = new Settings();
        const importer = new AlphaTexImporter();
        importer.init(ByteBuffer.fromString(tex), settings);
        return importer.readScore();
    }

    public static async renderAndCaptureSystem0(tex: string, width: number): Promise<SystemMetrics> {
        await VisualTestHelper.prepareAlphaSkia();
        const score = await AccoladeIdempotenceHelper.loadScore(tex);
        const settings = new Settings();
        VisualTestHelper.prepareSettingsForTest(settings);

        const uiFacade = new TestUiFacade();
        uiFacade.rootContainer.width = width;
        const api = new AlphaTabApiBase<unknown>(uiFacade, settings);

        let captured: SystemMetrics | null = null;
        try {
            await new Promise<void>((resolve, reject) => {
                api.renderer.postRenderFinished.on(() => {
                    const wrapper = api.renderer as unknown as ScoreRendererWrapper;
                    const inner = wrapper.instance as unknown as ScoreRenderer;
                    const systems = inner.layout!.systems;
                    if (systems.length === 0) {
                        reject(new Error('expected at least one system'));
                        return;
                    }
                    const s = systems[0];
                    const firstStaffGroup = s.staves[0];
                    const firstStaff = firstStaffGroup.staves[0];
                    const metrics: SystemMetrics = {
                        accoladeWidth: s.accoladeWidth,
                        width: s.width,
                        computedWidth: s.computedWidth,
                        barWidths: firstStaff.barRenderers.map(r => r.width)
                    };
                    captured = metrics;
                    resolve();
                });
                api.error.on(e => {
                    reject(
                        new AlphaTabError(
                            AlphaTabErrorType.General,
                            `Failed to render score (${e.message} ${e.stack})`,
                            e
                        )
                    );
                });
                const renderScore = JsonConverter.jsObjectToScore(JsonConverter.scoreToJsObject(score), settings);
                api.renderScore(renderScore, [0]);
                setTimeout(() => reject(new Error('render timed out')), 5000);
            });
        } finally {
            api.destroy();
        }
        return captured!;
    }

    public static sum(values: number[]): number {
        let total = 0;
        for (const v of values) {
            total += v;
        }
        return total;
    }
}

describe('AccoladeIdempotence', () => {
    it('accolade contribution applied exactly once for a multi-bar single-system score', async () => {
        const tex = `
            \\track "T1"
            \\staff {score}
            C4.4 *4 | C4.4 *4 | C4.4 *4 | C4.4 *4 | C4.4 *4
        `;

        const metrics = await AccoladeIdempotenceHelper.renderAndCaptureSystem0(tex, 3000);

        expect(metrics.barWidths.length).toBe(5);
        expect(metrics.accoladeWidth).toBeGreaterThanOrEqual(0);

        const sumBarWidths = AccoladeIdempotenceHelper.sum(metrics.barWidths);
        const accoladePortion = metrics.width - sumBarWidths;
        expect(accoladePortion).toBeCloseTo(metrics.accoladeWidth, 1);

        const computedAccoladePortion = metrics.computedWidth - sumBarWidths;
        expect(computedAccoladePortion).toBeCloseTo(metrics.accoladeWidth, 1);
    });

    it('accolade contribution stable across renders with same inputs', async () => {
        const tex = `
            \\track "T1"
            \\staff {score}
            C4.4 *4 | C4.4 *4 | C4.4 *4
        `;

        const first = await AccoladeIdempotenceHelper.renderAndCaptureSystem0(tex, 3000);
        const second = await AccoladeIdempotenceHelper.renderAndCaptureSystem0(tex, 3000);

        expect(second.accoladeWidth).toBe(first.accoladeWidth);
        expect(second.width).toBe(first.width);
        expect(second.computedWidth).toBe(first.computedWidth);
    });
});
