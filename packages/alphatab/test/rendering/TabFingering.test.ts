import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import type { Score } from '@coderline/alphatab/model/Score';
import { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import { TabBarRenderer } from '@coderline/alphatab/rendering/TabBarRenderer';
import { TabFingering } from '@coderline/alphatab/rendering/utils/TabFingering';
import { Settings } from '@coderline/alphatab/Settings';
import { StaveProfile } from '@coderline/alphatab/StaveProfile';
import { describe, expect, it } from 'vitest';

describe('TabFingeringTest', () => {
    /**
     * @static
     */
    function load(tex: string): Score {
        const settings = new Settings();
        return ScoreLoader.loadAlphaTex(tex, settings);
    }

    /**
     * Renders the tab and describes every note as `fret.string` in alphaTex string numbering,
     * plus `*` when it moved to another string and `!` when it is unplayable.
     * @static
     */
    function display(tex: string): string[][] {
        const score = load(tex);
        const settings = new Settings();
        settings.core.engine = 'svg';
        settings.display.staveProfile = StaveProfile.Tab;
        const renderer = new ScoreRenderer(settings);
        renderer.width = 1500;
        renderer.renderScore(score, [0]);

        const staff = score.tracks[0].staves[0];
        const stringCount = staff.tuning.length;
        const bars: string[][] = [];
        for (const bar of staff.bars) {
            const tab = renderer.layout!.getRendererForBar(TabBarRenderer.StaffId, bar) as TabBarRenderer;
            const result: string[] = [];
            for (const voice of bar.voices) {
                for (const beat of voice.beats) {
                    for (const note of beat.notes) {
                        const glyph = tab.getNoteGlyph(note)!;
                        let s = `${glyph.displayFret}.${stringCount - glyph.displayString + 1}`;
                        if (glyph.isMoved) {
                            s += '*';
                        }
                        if (glyph.isUnplayable) {
                            s += '!';
                        }
                        result.push(s);
                    }
                }
            }
            bars.push(result);
        }
        return bars;
    }

    it('is inactive without transposition and on percussion', () => {
        expect(TabFingering.isActive(load('3.3').tracks[0].staves[0])).toBe(false);
        const staff = load('\\transpose -4 3.3').tracks[0].staves[0];
        expect(TabFingering.isActive(staff)).toBe(true);
        staff.isPercussion = true;
        expect(TabFingering.isActive(staff)).toBe(false);
    });

    it('keeps strings when the shifted frets are playable', () => {
        expect(display('\\transpose 2 3.3 5.2 0.1 | 12.6')).toEqual([['5.3', '7.2', '2.1'], ['14.6']]);
    });

    it('moves notes below the open string to lower strings', () => {
        expect(display('\\transpose -4 3.5 2.4 5.3 0.6')).toEqual([['4.6*', '3.5*', '1.3', '-4.6!']]);
    });

    it('places chord notes on distinct strings', () => {
        expect(display('\\transpose -4 (0.1 0.2)')).toEqual([['1.2*', '0.3*']]);
    });

    it('keeps tied notes on the string of their origin', () => {
        expect(display('\\transpose -4 3.5 3.5 | -.5 2.4')).toEqual([
            ['4.6*', '4.6*'],
            ['4.6*', '3.5*']
        ]);
    });

    it('moves hammer-ons and slides as a whole', () => {
        expect(display('\\transpose -4 2.3{h} 4.3 2.3{ss} 4.3')).toEqual([['3.4*', '5.4*', '3.4*', '5.4*']]);
    });

    it('allows pull-offs to open strings', () => {
        expect(display('\\transpose -2 6.3{h} 2.3')).toEqual([['4.3', '0.3']]);
    });

    it('does not bend on open strings', () => {
        expect(display('\\transpose -4 4.3{b (0 4)}')).toEqual([['5.4*']]);
    });

    it('moves natural harmonics to the node of the transposed pitch', () => {
        expect(display('\\transpose 7 12.6{nh}')).toEqual([['7.6']]);
        expect(display('\\transpose -4 12.5{nh}')).toEqual([['8.5!']]);
    });

    it('ignores the fret of dead notes', () => {
        expect(display('\\transpose -4 0.6{x}')).toEqual([['-4.6']]);
    });

    it('requires a playable trill fret', () => {
        expect(display('\\transpose -5 5.3{tr 7 16}')).toEqual([['0.3']]);
        expect(display('\\transpose -6 5.3{tr 7 16}')).toEqual([['4.4*']]);
    });

    it('handles re-entrant tunings', () => {
        expect(display('\\tuning A4 E4 C4 G4 \\transpose -6 2.1')).toEqual([['1.2*']]);
    });

    it('handles bass tunings', () => {
        expect(display('\\tuning G2 D2 A1 E1 \\transpose -1 0.3 0.4')).toEqual([['4.4*', '-1.4!']]);
    });

    it('counts the fret limit from the capo', () => {
        expect(display('\\capo 2 \\transpose 3 20.1')).toEqual([['23.1!']]);
        expect(display('\\capo 2 \\transpose 2 20.1')).toEqual([['22.1']]);
    });

    it('keeps grace notes connected to their main note', () => {
        expect(display('\\transpose -4 2.3{ss} {gr ob} 4.3')).toEqual([['3.4*', '5.4*']]);
    });

    it('fingers repeated bars identically', () => {
        const result = display('\\transpose -4 3.5 2.4 0.3 | 3.5 2.4 0.3');
        expect(result[1]).toEqual(result[0]);
    });
});
