/**
 * Regression tests for the vertical overflow reserved by tab staves: notes on the
 * outer strings stick out of the staff and the staff must reserve the space for them,
 * otherwise content of adjacent staves can collide.
 */
import { AlphaTabApiBase } from '@coderline/alphatab/AlphaTabApiBase';
import { AlphaTabError, AlphaTabErrorType } from '@coderline/alphatab/AlphaTabError';
import { AlphaTexImporter } from '@coderline/alphatab/importer/AlphaTexImporter';
import { ByteBuffer } from '@coderline/alphatab/io/ByteBuffer';
import type { Score } from '@coderline/alphatab/model/Score';
import type { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import type { ScoreRendererWrapper } from '@coderline/alphatab/rendering/ScoreRendererWrapper';
import type { RenderStaff } from '@coderline/alphatab/rendering/staves/RenderStaff';
import type { TabBarRenderer } from '@coderline/alphatab/rendering/TabBarRenderer';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, expect, it } from 'vitest';
import { MusicXmlImporterTestHelper } from '../importer/MusicXmlImporterTestHelper';
import { TestPlatform } from '../TestPlatform';
import { TestUiFacade } from '../visualTests/TestUiFacade';
import { VisualTestHelper } from '../visualTests/VisualTestHelper';

/**
 * @internal
 */
class TabStaffOverflowHelper {
    public static async render(score: Score, check: (staves: RenderStaff[]) => void): Promise<void> {
        await VisualTestHelper.prepareAlphaSkia();
        const settings = new Settings();
        VisualTestHelper.prepareSettingsForTest(settings);
        const uiFacade = new TestUiFacade();
        uiFacade.rootContainer.width = 1300;
        const api = new AlphaTabApiBase<unknown>(uiFacade, settings);
        try {
            await new Promise<void>((resolve, reject) => {
                api.renderer.postRenderFinished.on(() => {
                    const inner = (api.renderer as unknown as ScoreRendererWrapper).instance as unknown as ScoreRenderer;
                    const staves: RenderStaff[] = [];
                    for (const system of inner.layout!.systems) {
                        for (const group of system.staves) {
                            for (const staff of group.staves) {
                                if (staff.isVisible) {
                                    staves.push(staff);
                                }
                            }
                        }
                    }
                    try {
                        check(staves);
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
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
    }

    /**
     * The overflow reserved by the staff must cover the content registered in its skyline.
     */
    public static expectOverflowCoversSkyline(staves: RenderStaff[]) {
        expect(staves.length).toBeGreaterThan(0);
        for (const staff of staves) {
            const label = `track ${staff.trackIndex} ${staff.staffId}`;
            expect(staff.topOverflow, `${label} top`).toBeGreaterThanOrEqual(staff.systemSkyline.upSky.maxHeight());
            expect(staff.bottomOverflow, `${label} bottom`).toBeGreaterThanOrEqual(
                staff.systemSkyline.downSky.maxHeight()
            );
        }
    }
}

describe('TabStaffOverflow', () => {
    it('outer-string-notes-in-chords', async () => {
        // chords with a note on the outer string followed by notes on inner strings
        const importer = new AlphaTexImporter();
        importer.init(
            ByteBuffer.fromString('\\track \\staff {tabs} (0.1 2.3 2.4) (3.6 2.5 0.4) | (0.1 0.6) r'),
            new Settings()
        );
        const score = importer.readScore();
        await TabStaffOverflowHelper.render(score, staves => {
            const staff = staves[0];
            const renderer = staff.barRenderers[0] as TabBarRenderer;
            const halfLine = renderer.lineSpacing / 2;
            expect(renderer.minString).toBe(0);
            expect(renderer.maxString).toBe(5);
            expect(staff.topOverflow).toBeGreaterThanOrEqual(halfLine);
            expect(staff.bottomOverflow).toBeGreaterThanOrEqual(halfLine);
            TabStaffOverflowHelper.expectOverflowCoversSkyline(staves);
        });
    });

    it('musicxml-tab-staves', async () => {
        const data = await TestPlatform.loadFile('test-data/musicxml-testsuite/71e-TabStaves.xml');
        const score = MusicXmlImporterTestHelper.prepareImporterWithBytes(data, new Settings()).readScore();
        await TabStaffOverflowHelper.render(score, TabStaffOverflowHelper.expectOverflowCoversSkyline);
    });
});
