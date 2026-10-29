/**
 * Tab staves that do not paint the rhythm skip the beaming helpers and stem collision slots,
 * while the beat direction stays the same as on tab staves that paint the rhythm.
 */
import { AlphaTabApiBase } from '@coderline/alphatab/AlphaTabApiBase';
import { AlphaTabError, AlphaTabErrorType } from '@coderline/alphatab/AlphaTabError';
import { AlphaTexImporter } from '@coderline/alphatab/importer/AlphaTexImporter';
import { ByteBuffer } from '@coderline/alphatab/io/ByteBuffer';
import { TabRhythmMode } from '@coderline/alphatab/NotationSettings';
import type { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import type { ScoreRendererWrapper } from '@coderline/alphatab/rendering/ScoreRendererWrapper';
import { TabBarRenderer } from '@coderline/alphatab/rendering/TabBarRenderer';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, expect, it } from 'vitest';
import { TestUiFacade } from '../visualTests/TestUiFacade';
import { VisualTestHelper } from '../visualTests/VisualTestHelper';

/**
 * @internal
 */
class TabHiddenRhythmHelper {
    public static async renderTabRenderers(rhythmMode: TabRhythmMode): Promise<TabBarRenderer[]> {
        await VisualTestHelper.prepareAlphaSkia();
        const settings = new Settings();
        VisualTestHelper.prepareSettingsForTest(settings);
        settings.notation.rhythmMode = rhythmMode;

        const importer = new AlphaTexImporter();
        importer.init(
            ByteBuffer.fromString(
                '\\track \\staff {score tabs} :8 (0.1 2.3) 3.3 {tu 3} 5.3 {tu 3} 7.3 {tu 3} :16 0.6 3.6 5.6 7.6 :4 r'
            ),
            new Settings()
        );
        const score = importer.readScore();

        const uiFacade = new TestUiFacade();
        uiFacade.rootContainer.width = 1300;
        const api = new AlphaTabApiBase<unknown>(uiFacade, settings);
        const renderers: TabBarRenderer[] = [];
        try {
            await new Promise<void>((resolve, reject) => {
                api.renderer.postRenderFinished.on(() => {
                    const inner = (api.renderer as unknown as ScoreRendererWrapper)
                        .instance as unknown as ScoreRenderer;
                    for (const system of inner.layout!.systems) {
                        for (const group of system.staves) {
                            for (const staff of group.staves) {
                                for (const r of staff.barRenderers) {
                                    if (r instanceof TabBarRenderer) {
                                        renderers.push(r);
                                    }
                                }
                            }
                        }
                    }
                    resolve();
                });
                api.error.on(e => {
                    reject(new AlphaTabError(AlphaTabErrorType.General, `Failed to render (${e.message})`, e));
                });
                api.renderScore(score, [0]);
                setTimeout(() => reject(new Error('render timed out')), 10000);
            });
        } finally {
            api.destroy();
        }
        return renderers;
    }

    public static expectDownStems(renderer: TabBarRenderer) {
        for (const v of renderer.bar.voices) {
            for (const b of v.beats) {
                expect(renderer.getBeatDirection(b)).toBe(BeamDirection.Down);
            }
        }
    }
}

describe('TabHiddenRhythm', () => {
    it('automatic-with-score-hides-rhythm', async () => {
        const renderers = await TabHiddenRhythmHelper.renderTabRenderers(TabRhythmMode.Automatic);
        expect(renderers.length).toBeGreaterThan(0);
        for (const r of renderers) {
            expect(r.drawsRhythm).toBe(false);
            expect(r.collisionHelper.reservedLayoutAreasByDisplayTime).toBeNull();
            TabHiddenRhythmHelper.expectDownStems(r);
        }
    });

    it('shown-rhythm-keeps-stem-slots', async () => {
        const renderers = await TabHiddenRhythmHelper.renderTabRenderers(TabRhythmMode.ShowWithBeams);
        expect(renderers.length).toBeGreaterThan(0);
        for (const r of renderers) {
            expect(r.drawsRhythm).toBe(true);
            expect(r.collisionHelper.reservedLayoutAreasByDisplayTime !== null).toBe(true);
            TabHiddenRhythmHelper.expectDownStems(r);
        }
    });
});
