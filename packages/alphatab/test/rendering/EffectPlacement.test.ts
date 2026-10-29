import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import { LayoutMode } from '@coderline/alphatab/LayoutMode';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import type { Score } from '@coderline/alphatab/model/Score';
import { type BarRendererBase, NoteXPosition, NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { BeatXPosition } from '@coderline/alphatab/rendering/BeatXPosition';
import type { EffectBand } from '@coderline/alphatab/rendering/EffectBand';
import { TieGlyph } from '@coderline/alphatab/rendering/glyphs/TieGlyph';
import { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import type { RenderStaff } from '@coderline/alphatab/rendering/staves/RenderStaff';
import { Settings } from '@coderline/alphatab/Settings';
import { VisualTestHelper } from 'test/visualTests/VisualTestHelper';
import { describe, expect, it } from 'vitest';

/**
 * Vertical placement of effect bands against the content of the staff.
 */
describe('EffectPlacementTests', () => {
    async function render(
        tex: string,
        configure?: (settings: Settings, score: Score) => void,
        tracks?: number[]
    ): Promise<ScoreRenderer> {
        await VisualTestHelper.prepareAlphaSkia();
        const settings = new Settings();
        // skia engine and fonts of the visual references: text sizes take part in the placement
        VisualTestHelper.prepareSettingsForTest(settings);
        const score = ScoreLoader.loadAlphaTex(tex, settings);
        if (configure) {
            configure(settings, score);
        }
        const renderer = new ScoreRenderer(settings);
        renderer.width = 1300;
        renderer.error.on(e => {
            throw e;
        });
        renderer.renderScore(score, tracks ?? [0]);
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

    it('beat-text-on-other-staff-does-not-widen-the-bar', async () => {
        // each text alone fits its 16th; side by side in one row they would need more space
        const tex = `
            \\track "A" \\staff {score}
            :16 c4{txt "crescendo"} d4 e4 f4 c4 d4 e4 f4 c4 d4 e4 f4 c4 d4 e4 f4
            \\track "B" \\staff {score}
            :16 c4 d4{txt "dolcissimo"} e4 f4 c4 d4 e4 f4 c4 d4 e4 f4 c4 d4 e4 f4
        `;
        const horizontal = (settings: Settings) => {
            settings.display.layoutMode = LayoutMode.Horizontal;
        };
        const secondBeatX = (renderer: ScoreRenderer) => {
            const r = firstStaff(renderer).barRenderers[0];
            return r.getBeatX(r.bar.voices[0].beats[1], BeatXPosition.OnNotes);
        };
        const alone = secondBeatX(await render(tex, horizontal, [0]));
        const both = secondBeatX(await render(tex, horizontal, [0, 1]));
        expect(both).toBeCloseTo(alone, 1);
    });

    it('bracket-spike-reserved-once', async () => {
        // the bar number is placed above the bracket spike; the spike must not add its height again
        const renderer = await render(
            `
            \\tuningDisplayMode staff
            \\bracketExtendMode groupsimilarinstruments
            \\track "Guitar 1"
            \\staff { tabs }
            0.6.4 2.6.4 3.6.4 0.5.4 |
            \\track "Guitar 2"
            \\staff { tabs }
            0.6.4 2.6.4 3.6.4 0.5.4 |
        `,
            (settings, _score) => {
                settings.display.layoutMode = LayoutMode.Parchment;
            },
            [0, 1]
        );
        const staff = firstStaff(renderer);
        const spikeHeight = renderer.settings.display.resources.engravingSettings.glyphHeights.get(
            MusicFontSymbol.BracketTop
        )!;
        const barNumber = band(staff.barRenderers[0], 'BarNumber', true)!;
        expect(barNumber.placedMagnitude + barNumber.height).toBeGreaterThan(spikeHeight);
        expect(staff.topOverflow).toBeGreaterThan(spikeHeight);
        expect(staff.y).toBe(0);
    });

    it('lyrics-share-one-baseline', async () => {
        // low and high notes under the lyrics: the row stays on one baseline
        const renderer = await render(`
            \\lyrics "this is my life and more and more of it"
            \\staff {score}
            :4 3.3 5.3 7.3 8.3 | 1.1 20.1 20.1 20.1 | 3.6 0.6 3.6 0.6
        `);
        const staff = firstStaff(renderer);
        // the magnitude is the distance to the staff, the same for all bars of the row
        let magnitude = -1;
        let checked = 0;
        for (const r of staff.barRenderers) {
            const lyrics = band(r, 'EffectLyrics', false)!;
            expect(lyrics).toBeTruthy();
            if (checked === 0) {
                magnitude = lyrics.placedMagnitude;
            }
            expect(lyrics.placedMagnitude).toBe(magnitude);
            checked++;
        }
        expect(checked).toBe(3);
    });

    it('slur-labels-not-in-lyrics-row', async () => {
        // the lyrics row is below the staff, slide and hammer-on labels above it
        const renderer = await render(`
            \\lyrics "this is my life"
            \\staff {score}
            :4 10.3 12.3{h} 14.3 7.3{sl} | 9.3 r r r
        `);
        const staff = firstStaff(renderer);
        let labels = 0;
        for (const r of staff.barRenderers) {
            for (const b of r.bottomEffects.bands) {
                expect(b.isEmpty || b.info.effectId === 'EffectLyrics' || b.info.effectId === 'EffectDynamics').toBe(
                    true
                );
            }
            for (const b of r.topEffects.bands) {
                if (!b.isEmpty && b.info.effectId !== 'BarNumber') {
                    labels++;
                }
            }
        }
        expect(labels).toBeGreaterThan(0);
        expect(band(staff.barRenderers[0], 'EffectLyrics', false)).toBeTruthy();
    });

    it('key-signature-skyline-per-accidental', async () => {
        // the flats of A flat major sit at different heights, each takes only its own width
        const renderer = await render(`
            \\ks Ab
            \\staff {score}
            :1 C5
        `);
        const r = firstStaff(renderer).barRenderers[0];
        const heights: number[] = [];
        r.preBeatLocalSkyline.upSky.forEachSegment((_xStart, _xEnd, height) => {
            if (height > 0) {
                heights.push(height);
            }
        });
        // barline, clef, then E flat and D flat (the flats reaching above the staff) each on their own
        expect(heights.length).toBe(4);
        expect(heights[3]).toBeLessThan(heights[2]);
    });

    it('let-ring-above-tab-bend', async () => {
        const renderer = await render(`
            \\staff {tabs}
            :4 7.3{b (0 4) lr} -.3{lr} 7.3{lr} 7.3{lr}
        `);
        const r = firstStaff(renderer).barRenderers[0];
        const letRing = band(r, 'EffectLetRing', true)!;
        expect(letRing).toBeTruthy();
        // the bend (with its "full" label) is the only content above this tab staff (overflow is rounded up)
        expect(r.contentTopOverflow).toBeGreaterThan(20);
        expect(letRing.placedMagnitude).toBeGreaterThanOrEqual(r.contentTopOverflow - 1);
    });

    it('tab-bend-skyline-follows-curve', async () => {
        // the bend curve starts at the note and only rises at its end: the skyline must not claim the peak height over it
        const renderer = await render(`
            \\staff {tabs}
            :2 7.3{b (0 4)} 7.3
        `);
        const r = firstStaff(renderer).barRenderers[0];
        const note = r.bar.voices[0].beats[0].notes[0];
        const curveStart = r.getNoteX(note, NoteXPosition.Right);
        const sky = r.barLocalSkyline.upSky;
        const peak = sky.maxHeight();
        expect(peak).toBeGreaterThan(20);
        expect(sky.maxHeightInRange(curveStart, curveStart + 5)).toBeLessThan(peak / 2);
    });
});
