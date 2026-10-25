import { describe, expect, it } from 'vitest';
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import type { Score } from '@coderline/alphatab/model/Score';
import { type BarRendererBase, NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { BeatXPosition } from '@coderline/alphatab/rendering/BeatXPosition';
import type { EffectBand } from '@coderline/alphatab/rendering/EffectBand';
import { TieGlyph } from '@coderline/alphatab/rendering/glyphs/TieGlyph';
import { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import type { RenderStaff } from '@coderline/alphatab/rendering/staves/RenderStaff';
import { Settings } from '@coderline/alphatab/Settings';
import { VisualTestHelper } from 'test/visualTests/VisualTestHelper';

/**
 * Vertical placement of effect bands against the content of the staff.
 */
describe('EffectPlacementTests', () => {
    async function render(tex: string, configure?: (settings: Settings, score: Score) => void): Promise<ScoreRenderer> {
        await VisualTestHelper.prepareAlphaSkia();
        const settings = new Settings();
        settings.core.engine = 'svg';
        settings.core.enableLazyLoading = false;
        const score = ScoreLoader.loadAlphaTex(tex, settings);
        if (configure) {
            configure(settings, score);
        }
        const renderer = new ScoreRenderer(settings);
        renderer.width = 1300;
        renderer.error.on(e => {
            throw e;
        });
        renderer.renderScore(score, [0]);
        return renderer;
    }

    function firstStaff(renderer: ScoreRenderer): RenderStaff {
        return renderer.layout!.systems[0].allStaves[0];
    }

    function band(r: BarRendererBase, effectId: string, top: boolean): EffectBand | null {
        for (const b of top ? r.topEffects.bands : r.bottomEffects.bands) {
            if (!b.isEmpty && b.info.effectId === effectId) {
                return b;
            }
        }
        return null;
    }

    function expectTextAboveTiedSlur(renderer: ScoreRenderer): void {
        const staff = firstStaff(renderer);
        for (const r of staff.barRenderers) {
            const origin = r.bar.voices[0].beats[0].notes[0];
            const destination = origin.tieDestination!;
            expect(destination.beat.voice.bar).toBe(r.bar);

            const x1 = r.getBeatX(origin.beat, BeatXPosition.MiddleNotes);
            const y1 = r.getNoteY(origin, NoteYPosition.Top);
            const x2 = r.getBeatX(destination.beat, BeatXPosition.MiddleNotes);
            const y2 = r.getNoteY(destination, NoteYPosition.Top);
            const slurPeak = TieGlyph.calculateBendSlurTopY(x1, y1, x2, y2, false, 1, r.smuflMetrics.tieHeight);
            expect(slurPeak).toBeLessThan(0);

            const text = band(r, 'EffectText', true)!;
            expect(text).toBeTruthy();
            expect(text.placedMagnitude).toBeGreaterThanOrEqual(-slurPeak);
        }
    }

    it('beat-text-above-tied-bend-slur', async () => {
        // the bend is tied to the next note, its slur runs to the tie destination
        const renderer = await render(`
            \\staff {score}
            :2 7.3{b (0 4) txt "grad."} -.3 | 7.3{b (0 4) txt "grad."} -.3
        `);
        expectTextAboveTiedSlur(renderer);
    });

    it('beat-text-above-tied-whammy-slur', async () => {
        const renderer = await render(`
            \\staff {score}
            :2 7.3{tb (0 4) txt "grad."} -.3{tb (4 4)} | 7.3{tb (0 4) txt "grad."} -.3{tb (4 4)}
        `);
        expectTextAboveTiedSlur(renderer);
    });

    it('dynamics-below-accents', async () => {
        // low notes with up stems: the accent sits below the note head, the dynamics below the accent
        const renderer = await render(`
            \\staff {score}
            :1 1.3{ac}{dy fp} | :1 0.2{ac}{dy fp} | :2 2.3{ac}{dy f} 1.1{ac}{dy p} | :1 3.4{ac}{dy mf}
        `);
        const staff = firstStaff(renderer);
        let checked = 0;
        for (const r of staff.barRenderers) {
            const dynamics = band(r, 'EffectDynamics', false);
            if (!dynamics) {
                continue;
            }
            const note = r.bar.voices[0].beats[0].notes[0];
            const accentBottom =
                r.getNoteY(note, NoteYPosition.Bottom) +
                r.smuflMetrics.onNoteEffectPadding +
                r.smuflMetrics.glyphHeights.get(MusicFontSymbol.ArticAccentAbove)!;
            expect(dynamics.placedMagnitude).toBeGreaterThanOrEqual(accentBottom - r.height);
            checked++;
        }
        expect(checked).toBe(3);
    });
});
