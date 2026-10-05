/**
 * Regression tests for the bar number display: bars which move between systems
 * during wrapping (revert to the next system) or resizing must update whether
 * they show a bar number.
 */
import { AlphaTabApiBase } from '@coderline/alphatab/AlphaTabApiBase';
import { AlphaTabError, AlphaTabErrorType } from '@coderline/alphatab/AlphaTabError';
import { AlphaTexImporter } from '@coderline/alphatab/importer/AlphaTexImporter';
import { ByteBuffer } from '@coderline/alphatab/io/ByteBuffer';
import { JsonConverter } from '@coderline/alphatab/model/JsonConverter';
import { BarNumberDisplay } from '@coderline/alphatab/model/RenderStylesheet';
import type { Score } from '@coderline/alphatab/model/Score';
import type { EffectBandXRange } from '@coderline/alphatab/rendering/EffectBand';
import type { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import type { ScoreRendererWrapper } from '@coderline/alphatab/rendering/ScoreRendererWrapper';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, expect, it } from 'vitest';
import { TestUiFacade } from '../visualTests/TestUiFacade';
import { VisualTestHelper } from '../visualTests/VisualTestHelper';

/**
 * The bar numbers visible in the layout: per visible staff, the bar indices showing a bar number.
 * @record
 * @internal
 */
interface StaffBarNumbers {
    isFirstVisibleStaff: boolean;
    barIndices: number[];
}

/**
 * @internal
 */
class BarNumberFirstOfSystemHelper {
    public static createScore(tex: string, display: BarNumberDisplay): Score {
        const settings = new Settings();
        const importer = new AlphaTexImporter();
        importer.init(ByteBuffer.fromString(tex), settings);
        const score = importer.readScore();
        score.stylesheet.barNumberDisplay = display;
        return score;
    }

    public static barsTex(staffTex: string = ''): string {
        let tex = staffTex;
        for (let i = 0; i < 24; i++) {
            tex += ':4 c4 d4 e4 f4 |';
        }
        return tex;
    }

    /**
     * Collects the bar numbers which take part in the placement (have an x-range), per visible staff.
     */
    public static collectBarNumbers(api: AlphaTabApiBase<unknown>): StaffBarNumbers[] {
        const wrapper = api.renderer as unknown as ScoreRendererWrapper;
        const inner = wrapper.instance as unknown as ScoreRenderer;
        const result: StaffBarNumbers[] = [];
        const range: EffectBandXRange = { xStart: 0, xEnd: 0 };
        for (const system of inner.layout!.systems) {
            for (const group of system.staves) {
                for (const staff of group.staves) {
                    if (!staff.isVisible) {
                        continue;
                    }
                    const barIndices: number[] = [];
                    for (const renderer of staff.barRenderers) {
                        const isShown = renderer.topEffects.bands.some(
                            b => b.info.effectId === 'BarNumber' && b.computeLocalXRange(range)
                        );
                        if (isShown) {
                            barIndices.push(renderer.bar.index);
                        }
                    }
                    const entry: StaffBarNumbers = {
                        isFirstVisibleStaff: staff.isFirstInSystem,
                        barIndices
                    };
                    result.push(entry);
                }
            }
        }
        return result;
    }

    /**
     * Gets the bar indices of the first bar of every system.
     */
    public static collectSystemStarts(api: AlphaTabApiBase<unknown>): number[] {
        const wrapper = api.renderer as unknown as ScoreRendererWrapper;
        const inner = wrapper.instance as unknown as ScoreRenderer;
        return inner.layout!.systems.map(s => s.firstBarIndex);
    }

    /**
     * Renders the score at each of the given widths in sequence (resizing the same API instance)
     * and returns the expected/actual bar numbers captured after each render.
     */
    public static async render(
        score: Score,
        widths: number[],
        expected: (api: AlphaTabApiBase<unknown>) => number[]
    ): Promise<void> {
        await VisualTestHelper.prepareAlphaSkia();
        const settings = new Settings();
        VisualTestHelper.prepareSettingsForTest(settings);

        const uiFacade = new TestUiFacade();
        uiFacade.rootContainer.width = widths[0];
        const api = new AlphaTabApiBase<unknown>(uiFacade, settings);

        let renders = 0;
        const errors: string[] = [];
        try {
            await new Promise<void>((resolve, reject) => {
                api.renderer.postRenderFinished.on(() => {
                    const staves = BarNumberFirstOfSystemHelper.collectBarNumbers(api);
                    const systemCount = BarNumberFirstOfSystemHelper.collectSystemStarts(api).length;
                    if (systemCount < 2) {
                        errors.push(`render ${renders}: expected wrapping into multiple systems`);
                    }

                    let firstStaffBars: number[] = [];
                    for (const staff of staves) {
                        if (staff.isFirstVisibleStaff) {
                            firstStaffBars = firstStaffBars.concat(staff.barIndices);
                        } else if (staff.barIndices.length > 0) {
                            errors.push(`render ${renders}: bar numbers on non-first staff: ${staff.barIndices}`);
                        }
                    }
                    const expectedBars = expected(api);
                    if (firstStaffBars.join(',') !== expectedBars.join(',')) {
                        errors.push(
                            `render ${renders} (width ${widths[renders]}): expected bar numbers at [${expectedBars}] but got [${firstStaffBars}]`
                        );
                    }

                    renders++;
                    if (renders < widths.length) {
                        const next = widths[renders];
                        setTimeout(() => {
                            uiFacade.rootContainer.width = next;
                            api.triggerResize();
                        }, 0);
                    } else {
                        resolve();
                    }
                });
                api.error.on(e => {
                    reject(
                        new AlphaTabError(
                            AlphaTabErrorType.General,
                            `Failed to render bar number score (${e.message} ${e.stack})`,
                            e
                        )
                    );
                });
                const renderScore = JsonConverter.jsObjectToScore(JsonConverter.scoreToJsObject(score), settings);
                api.renderScore(renderScore, [0]);
                setTimeout(() => reject(new Error('bar number render timed out')), 10000);
            });
        } finally {
            api.destroy();
        }

        expect(errors).toEqual([]);
    }

    public static allBars(api: AlphaTabApiBase<unknown>): number[] {
        const wrapper = api.renderer as unknown as ScoreRendererWrapper;
        const inner = wrapper.instance as unknown as ScoreRenderer;
        const result: number[] = [];
        for (const system of inner.layout!.systems) {
            for (let i = system.firstBarIndex; i <= system.lastBarIndex; i++) {
                result.push(i);
            }
        }
        return result;
    }
}

describe('BarNumberFirstOfSystem', () => {
    const systemStarts = (api: AlphaTabApiBase<unknown>) => BarNumberFirstOfSystemHelper.collectSystemStarts(api);

    it('wrapped-bars', async () => {
        // bars overflowing a system are reverted and moved to the next one
        const score = BarNumberFirstOfSystemHelper.createScore(
            BarNumberFirstOfSystemHelper.barsTex(),
            BarNumberDisplay.FirstOfSystem
        );
        await BarNumberFirstOfSystemHelper.render(score, [600], systemStarts);
    });

    it('resize-narrower', async () => {
        const score = BarNumberFirstOfSystemHelper.createScore(
            BarNumberFirstOfSystemHelper.barsTex(),
            BarNumberDisplay.FirstOfSystem
        );
        await BarNumberFirstOfSystemHelper.render(score, [1300, 500], systemStarts);
    });

    it('resize-wider', async () => {
        const score = BarNumberFirstOfSystemHelper.createScore(
            BarNumberFirstOfSystemHelper.barsTex(),
            BarNumberDisplay.FirstOfSystem
        );
        await BarNumberFirstOfSystemHelper.render(score, [500, 1300], systemStarts);
    });

    it('score-and-tab', async () => {
        // only the first visible staff shows bar numbers
        const score = BarNumberFirstOfSystemHelper.createScore(
            BarNumberFirstOfSystemHelper.barsTex('\\track \\staff {score tabs} '),
            BarNumberDisplay.FirstOfSystem
        );
        await BarNumberFirstOfSystemHelper.render(score, [600, 1300], systemStarts);
    });

    it('all-bars', async () => {
        const score = BarNumberFirstOfSystemHelper.createScore(
            BarNumberFirstOfSystemHelper.barsTex(),
            BarNumberDisplay.AllBars
        );
        await BarNumberFirstOfSystemHelper.render(score, [600, 1300], BarNumberFirstOfSystemHelper.allBars);
    });

    it('bar-override-shown', async () => {
        // a bar forcing its bar number is shown regardless of its neighbours
        const score = BarNumberFirstOfSystemHelper.createScore(
            BarNumberFirstOfSystemHelper.barsTex(),
            BarNumberDisplay.FirstOfSystem
        );
        score.tracks[0].staves[0].bars[5].scoreDisplay = { barNumber: BarNumberDisplay.AllBars };
        await BarNumberFirstOfSystemHelper.render(score, [600, 1300], api => {
            const starts = BarNumberFirstOfSystemHelper.collectSystemStarts(api);
            if (starts.indexOf(5) === -1) {
                starts.push(5);
                starts.sort((a, b) => a - b);
            }
            return starts;
        });
    });

    it('bar-override-hidden', async () => {
        // a bar hiding its bar number is hidden regardless of its neighbours
        const score = BarNumberFirstOfSystemHelper.createScore(
            BarNumberFirstOfSystemHelper.barsTex(),
            BarNumberDisplay.AllBars
        );
        score.tracks[0].staves[0].bars[5].scoreDisplay = { barNumber: BarNumberDisplay.Hide };
        await BarNumberFirstOfSystemHelper.render(score, [600, 1300], api =>
            BarNumberFirstOfSystemHelper.allBars(api).filter(i => i !== 5)
        );
    });
});
