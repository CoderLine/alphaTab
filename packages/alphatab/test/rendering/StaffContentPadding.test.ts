/**
 * Tests for the minimum vertical padding between the content of adjacent staves
 * ({@link EngravingSettings.staffContentPadding}).
 */
import { AlphaTabApiBase } from '@coderline/alphatab/AlphaTabApiBase';
import { AlphaTabError, AlphaTabErrorType } from '@coderline/alphatab/AlphaTabError';
import { AlphaTexImporter } from '@coderline/alphatab/importer/AlphaTexImporter';
import { ByteBuffer } from '@coderline/alphatab/io/ByteBuffer';
import type { Score } from '@coderline/alphatab/model/Score';
import type { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import type { ScoreRendererWrapper } from '@coderline/alphatab/rendering/ScoreRendererWrapper';
import type { RenderStaff } from '@coderline/alphatab/rendering/staves/RenderStaff';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, expect, it } from 'vitest';
import { MusicXmlImporterTestHelper } from '../importer/MusicXmlImporterTestHelper';
import { TestPlatform } from '../TestPlatform';
import { TestUiFacade } from '../visualTests/TestUiFacade';
import { VisualTestHelper } from '../visualTests/VisualTestHelper';

/**
 * The space between two adjacent staves and how far their content reaches into it.
 * @record
 * @internal
 */
interface StaffGap {
    label: string;
    available: number;
    contentExtent: number;
}

/**
 * @internal
 */
class StaffContentPaddingHelper {
    /**
     * The maximum combined extent of the content of both staves into the space between them,
     * sampled at the segment boundaries of both skylines.
     */
    private static _contentExtent(upper: RenderStaff, lower: RenderStaff): number {
        const down = upper.systemSkyline.downSky;
        const up = lower.systemSkyline.upSky;
        let max = 0;
        for (let i = 0; i < down.segmentCount; i++) {
            const xs = down.segmentXStart(i);
            const xe = down.segmentXEnd(i);
            const combined = down.segmentHeight(i) + up.maxHeightInRange(xs, xe);
            if (down.segmentHeight(i) > 0 && combined > max) {
                max = combined;
            }
        }
        for (let i = 0; i < up.segmentCount; i++) {
            const xs = up.segmentXStart(i);
            const xe = up.segmentXEnd(i);
            const combined = up.segmentHeight(i) + down.maxHeightInRange(xs, xe);
            if (up.segmentHeight(i) > 0 && combined > max) {
                max = combined;
            }
        }
        return max;
    }

    public static async renderGaps(score: Score, settings: Settings): Promise<StaffGap[]> {
        await VisualTestHelper.prepareAlphaSkia();
        VisualTestHelper.prepareSettingsForTest(settings);
        const uiFacade = new TestUiFacade();
        uiFacade.rootContainer.width = 1300;
        const api = new AlphaTabApiBase<unknown>(uiFacade, settings);
        const gaps: StaffGap[] = [];
        try {
            await new Promise<void>((resolve, reject) => {
                api.renderer.postRenderFinished.on(() => {
                    const inner = (api.renderer as unknown as ScoreRendererWrapper).instance as unknown as ScoreRenderer;
                    for (const system of inner.layout!.systems) {
                        let previous: RenderStaff | undefined = undefined;
                        for (const group of system.staves) {
                            for (const staff of group.staves) {
                                if (!staff.isVisible) {
                                    continue;
                                }
                                if (previous) {
                                    const gap: StaffGap = {
                                        label: `system ${system.index}: track ${previous.trackIndex} ${previous.staffId} -> track ${staff.trackIndex} ${staff.staffId}`,
                                        available: staff.contentTop - previous.contentBottom,
                                        contentExtent: StaffContentPaddingHelper._contentExtent(previous, staff)
                                    };
                                    gaps.push(gap);
                                }
                                previous = staff;
                            }
                        }
                    }
                    resolve();
                });
                api.error.on(e => {
                    reject(new AlphaTabError(AlphaTabErrorType.General, `Failed to render (${e.message})`, e));
                });
                api.renderScore(
                    score,
                    score.tracks.map(t => t.index)
                );
                setTimeout(() => reject(new Error('render timed out')), 10000);
            });
        } finally {
            api.destroy();
        }
        return gaps;
    }

    public static expectPadding(gaps: StaffGap[], padding: number) {
        expect(gaps.length).toBeGreaterThan(0);
        for (const gap of gaps) {
            if (gap.contentExtent > 0) {
                expect(gap.available - gap.contentExtent, gap.label).toBeGreaterThanOrEqual(padding);
            }
        }
    }

    public static scoreAndTab(): Score {
        // the low E (6th string) extends below the standard notation staff,
        // the high E (1st string) extends above the tablature: both at the same beat.
        const importer = new AlphaTexImporter();
        importer.init(
            ByteBuffer.fromString('\\track \\staff {score tabs} (0.6 0.1).4 (0.6 0.1) (0.6 0.1) (0.6 0.1)'),
            new Settings()
        );
        return importer.readScore();
    }
}

describe('StaffContentPadding', () => {
    it('score-and-tab-same-track', async () => {
        const settings = new Settings();
        const gaps = await StaffContentPaddingHelper.renderGaps(StaffContentPaddingHelper.scoreAndTab(), settings);
        StaffContentPaddingHelper.expectPadding(gaps, settings.display.resources.engravingSettings.staffContentPadding);
    });

    it('musicxml-tab-staves', async () => {
        const data = await TestPlatform.loadFile('test-data/musicxml-testsuite/71e-TabStaves.xml');
        const settings = new Settings();
        const score = MusicXmlImporterTestHelper.prepareImporterWithBytes(data, settings).readScore();
        const gaps = await StaffContentPaddingHelper.renderGaps(score, settings);
        StaffContentPaddingHelper.expectPadding(gaps, settings.display.resources.engravingSettings.staffContentPadding);
    });

    it('only-adds-space-where-needed', async () => {
        // compared to a layout without padding, space is only added where the content comes too close
        const inputs = [
            '\\track \\staff {score tabs} r.1 | r.1',
            '\\track \\staff {score tabs} (0.6 0.1).4 (0.6 0.1) (0.6 0.1) (0.6 0.1)',
            '\\track \\staff {score tabs} :4 5.3 7.3 5.2 7.2 | \\track \\staff {tabs} :4 5.3 7.3 5.2 7.2'
        ];
        for (const tex of inputs) {
            const load = () => {
                const importer = new AlphaTexImporter();
                importer.init(ByteBuffer.fromString(tex), new Settings());
                return importer.readScore();
            };

            const noPaddingSettings = new Settings();
            noPaddingSettings.display.resources.engravingSettings.staffContentPadding = 0;
            const withoutPadding = await StaffContentPaddingHelper.renderGaps(load(), noPaddingSettings);

            const settings = new Settings();
            const padding = settings.display.resources.engravingSettings.staffContentPadding;
            const withPadding = await StaffContentPaddingHelper.renderGaps(load(), settings);

            expect(withPadding.length).toBe(withoutPadding.length);
            for (let i = 0; i < withPadding.length; i++) {
                const before = withoutPadding[i];
                const expected =
                    before.contentExtent > 0
                        ? Math.max(before.available, before.contentExtent + padding)
                        : before.available;
                const label = `${tex}: ${withPadding[i].label}`;
                expect(withPadding[i].available, label).toBeGreaterThanOrEqual(expected - 0.001);
                expect(withPadding[i].available, label).toBeLessThan(expected + 1);
            }
        }
    });
});
