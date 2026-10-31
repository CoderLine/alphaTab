/**
 * Regression tests for the bar number display: bars which move between systems
 * during wrapping (revert to the next system) or resizing must update whether
 * they show a bar number.
 */
import { AlphaTabApiBase } from '@coderline/alphatab/AlphaTabApiBase';
import { AlphaTabError, AlphaTabErrorType } from '@coderline/alphatab/AlphaTabError';
import { AlphaTexImporter } from '@coderline/alphatab/importer/AlphaTexImporter';
import { ByteBuffer } from '@coderline/alphatab/io/ByteBuffer';
import { LayoutMode } from '@coderline/alphatab/LayoutMode';
import { JsonConverter } from '@coderline/alphatab/model/JsonConverter';
import { BarNumberDisplay } from '@coderline/alphatab/model/RenderStylesheet';
import type { Score } from '@coderline/alphatab/model/Score';
import type { EffectBandXRange } from '@coderline/alphatab/rendering/EffectBand';
import type { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import type { ScoreRendererWrapper } from '@coderline/alphatab/rendering/ScoreRendererWrapper';
import type { StaffSystem } from '@coderline/alphatab/rendering/staves/StaffSystem';
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
    public static systems(api: AlphaTabApiBase<unknown>): StaffSystem[] {
        const wrapper = api.renderer as unknown as ScoreRendererWrapper;
        return (wrapper.instance as unknown as ScoreRenderer).layout!.systems;
    }

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
        const result: StaffBarNumbers[] = [];
        const range: EffectBandXRange = { xStart: 0, xEnd: 0 };
        for (const system of BarNumberFirstOfSystemHelper.systems(api)) {
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
        const starts: number[] = [];
        for (const system of BarNumberFirstOfSystemHelper.systems(api)) {
            starts.push(system.firstBarIndex);
        }
        return starts;
    }

    /**
     * Renders the score at each of the given widths in sequence (resizing the same API instance)
     * and returns the expected/actual bar numbers captured after each render.
     */
    public static async render(
        score: Score,
        widths: number[],
        expected: (api: AlphaTabApiBase<unknown>) => number[],
        tracks: number[] | null = null,
        layoutMode: LayoutMode = LayoutMode.Page
    ): Promise<void> {
        await VisualTestHelper.prepareAlphaSkia();
        const settings = new Settings();
        VisualTestHelper.prepareSettingsForTest(settings);
        settings.display.layoutMode = layoutMode;

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

                    const firstStaffBars: number[] = [];
                    for (const staff of staves) {
                        if (staff.isFirstVisibleStaff) {
                            for (const barIndex of staff.barIndices) {
                                firstStaffBars.push(barIndex);
                            }
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
                api.renderScore(renderScore, tracks ?? [0]);
                setTimeout(() => reject(new Error('bar number render timed out')), 10000);
            });
        } finally {
            api.destroy();
        }

        expect(errors.join('\n')).toBe('');
    }

    /**
     * Gets the bar index of every bar renderer of the first staff (a multi-bar rest is one renderer).
     */
    public static rendererStarts(api: AlphaTabApiBase<unknown>): number[] {
        const result: number[] = [];
        for (const system of BarNumberFirstOfSystemHelper.systems(api)) {
            for (const renderer of system.staves[0].staves[0].barRenderers) {
                result.push(renderer.bar.index);
            }
        }
        return result;
    }

    public static allBars(api: AlphaTabApiBase<unknown>): number[] {
        const result: number[] = [];
        for (const system of BarNumberFirstOfSystemHelper.systems(api)) {
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

    it('multibar-rest-all-bars', async () => {
        // every multi-bar rest carries the number of its first bar
        let tex = '\\track { multiBarRest } ';
        for (let i = 0; i < 6; i++) {
            tex += ':4 c4 d4 e4 f4 | r.1 | r.1 | r.1 |';
        }
        const score = BarNumberFirstOfSystemHelper.createScore(tex, BarNumberDisplay.AllBars);
        await BarNumberFirstOfSystemHelper.render(score, [600, 1300], BarNumberFirstOfSystemHelper.rendererStarts);
    });

    it('multibar-rest-first-of-system', async () => {
        // a system starting with a multi-bar rest is numbered
        const score = BarNumberFirstOfSystemHelper.createScore(
            '\\track { multiBarRest } C4.1 | C4.1 | C4.1 | r.1 | r.1 | r.1 | r.1 | C4.1 | C4.1 | C4.1 | C4.1 | r.1 | r.1 | r.1 | C4.1',
            BarNumberDisplay.FirstOfSystem
        );
        let restStarts: number[] = [];
        await BarNumberFirstOfSystemHelper.render(score, [500], api => {
            restStarts = [];
            for (const system of BarNumberFirstOfSystemHelper.systems(api)) {
                const first = system.staves[0].staves[0].barRenderers[0];
                if (first.additionalMultiRestBars) {
                    restStarts.push(first.bar.index);
                }
            }
            return systemStarts(api);
        });
        expect(restStarts.length).toBeGreaterThan(0);
    });

    it('hide-empty-staves-first-visible-track', async () => {
        // a system in which the first track is hidden is numbered on the first visible one
        const score = BarNumberFirstOfSystemHelper.createScore(
            '\\hideEmptyStaves \\defaultSystemsLayout 2 ' +
                '\\track "T1" C4.1 | C4.1 | r.1 | r.1 | C4.1 | C4.1 ' +
                '\\track "T2" C4.1 | C4.1 | C4.1 | C4.1 | r.1 | r.1',
            BarNumberDisplay.FirstOfSystem
        );
        await BarNumberFirstOfSystemHelper.render(score, [600], systemStarts, [0, 1], LayoutMode.Parchment);
    });

    it('bar-override-shown', async () => {
        // a bar forcing its bar number is shown regardless of its neighbours
        const score = BarNumberFirstOfSystemHelper.createScore(
            BarNumberFirstOfSystemHelper.barsTex(),
            BarNumberDisplay.FirstOfSystem
        );
        score.tracks[0].staves[0].bars[5].scoreDisplay = { barNumber: BarNumberDisplay.AllBars };
        await BarNumberFirstOfSystemHelper.render(score, [600, 1300], api => {
            const starts = new Set<number>(BarNumberFirstOfSystemHelper.collectSystemStarts(api));
            const expected: number[] = [];
            for (const barIndex of BarNumberFirstOfSystemHelper.allBars(api)) {
                if (barIndex === 5 || starts.has(barIndex)) {
                    expected.push(barIndex);
                }
            }
            return expected;
        });
    });

    it('bar-override-hidden', async () => {
        // a bar hiding its bar number is hidden regardless of its neighbours
        const score = BarNumberFirstOfSystemHelper.createScore(
            BarNumberFirstOfSystemHelper.barsTex(),
            BarNumberDisplay.AllBars
        );
        score.tracks[0].staves[0].bars[5].scoreDisplay = { barNumber: BarNumberDisplay.Hide };
        await BarNumberFirstOfSystemHelper.render(score, [600, 1300], api => {
            const expected: number[] = [];
            for (const barIndex of BarNumberFirstOfSystemHelper.allBars(api)) {
                if (barIndex !== 5) {
                    expected.push(barIndex);
                }
            }
            return expected;
        });
    });
});
