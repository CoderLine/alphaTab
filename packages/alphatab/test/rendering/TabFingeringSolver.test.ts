import { AlphaTexImporter } from '@coderline/alphatab/importer/AlphaTexImporter';
import type { Note } from '@coderline/alphatab/model/Note';
import type { Score } from '@coderline/alphatab/model/Score';
import type { Staff } from '@coderline/alphatab/model/Staff';
import { TabFingeringSegment } from '@coderline/alphatab/rendering/utils/TabFingeringSegment';
import { TabFingeringSolver } from '@coderline/alphatab/rendering/utils/TabFingeringSolver';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, expect, it } from 'vitest';

describe('TabFingeringSolverTest', () => {
    /**
     * @static
     */
    function parseTex(tex: string): Score {
        const importer = new AlphaTexImporter();
        importer.logErrors = true;
        importer.initFromString(tex, new Settings());
        return importer.readScore();
    }

    /**
     * @static
     */
    function solveStaff(staff: Staff): (TabFingeringSegment | null)[] {
        const segments: (TabFingeringSegment | null)[] = [];
        let start = 0;
        while (start < staff.bars.length) {
            const end = TabFingeringSolver.segmentEnd(staff, start);
            const segment = TabFingeringSolver.solve(staff, start, end);
            for (let b = start; b <= end; b++) {
                segments.push(segment);
            }
            start = end + 1;
        }
        return segments;
    }

    /**
     * Describes the displayed position of every note as `fret.string` in alphaTex string numbering
     * plus `*` for moved, `!` for unplayable and `A` for natural harmonics shown as artificial ones.
     * @static
     */
    function display(staff: Staff): string[][] {
        const segments = solveStaff(staff);
        const stringCount = staff.tuning.length;
        const bars: string[][] = [];
        for (const bar of staff.bars) {
            const result: string[] = [];
            const segment = segments[bar.index];
            for (const voice of bar.voices) {
                for (const beat of voice.beats) {
                    for (const note of beat.notes) {
                        result.push(describeNote(note, segment, stringCount));
                    }
                }
            }
            bars.push(result);
        }
        return bars;
    }

    /**
     * @static
     */
    function describeNote(note: Note, segment: TabFingeringSegment | null, stringCount: number): string {
        if (segment === null) {
            return `${note.fret - note.beat.voice.bar.staff.transpositionPitch}.${stringCount - note.string + 1}`;
        }
        const flags = segment.getFlags(note);
        let s = '';
        const node = segment.getNode(note);
        if (node >= 0) {
            s += `<${TabFingeringSolver.naturalNodeValues[node]}>`;
        } else {
            s += `${segment.getFret(note)}`;
        }
        s += `.${stringCount - segment.getString(note) + 1}`;
        if ((flags & TabFingeringSegment.flagMoved) !== 0) {
            s += '*';
        }
        if ((flags & TabFingeringSegment.flagUnplayable) !== 0) {
            s += '!';
        }
        if ((flags & TabFingeringSegment.flagAsArtificial) !== 0) {
            s += 'A';
        }
        return s;
    }

    /**
     * @static
     */
    function staffOf(tex: string): Staff {
        return parseTex(tex).tracks[0].staves[0];
    }

    it('is inactive without transposition and on percussion', () => {
        expect(TabFingeringSolver.isActive(staffOf('3.3'))).toBe(false);
        expect(TabFingeringSolver.isActive(staffOf('\\transpose -4 3.3'))).toBe(true);
        const percussion = staffOf('\\transpose -4 3.3');
        percussion.isPercussion = true;
        expect(TabFingeringSolver.isActive(percussion)).toBe(false);
    });

    it('keeps strings when the shifted frets are playable', () => {
        const staff = staffOf('\\transpose 2 3.3 5.2 0.1 | 12.6');
        expect(TabFingeringSolver.solve(staff, 0, 0)).toBe(null);
        expect(display(staff)).toEqual([['5.3', '7.2', '2.1'], ['14.6']]);
    });

    it('moves notes below the open string to lower strings', () => {
        const staff = staffOf('\\transpose -4 3.5 2.4 5.3 0.6');
        expect(display(staff)).toEqual([['4.6*', '3.5*', '1.3', '-4.6!']]);
    });

    it('places chord notes on distinct strings', () => {
        const staff = staffOf('\\transpose -4 (0.1 0.2)');
        expect(display(staff)).toEqual([['1.2*', '0.3*']]);
    });

    it('keeps tied notes on the string of their origin', () => {
        const staff = staffOf('\\transpose -4 3.5 3.5 | -.5 2.4');
        expect(TabFingeringSolver.segmentEnd(staff, 0)).toBe(1);
        expect(TabFingeringSolver.segmentStart(staff, 1)).toBe(0);
        expect(TabFingeringSolver.isSegmentStart(staff, 1)).toBe(false);
        expect(display(staff)).toEqual([
            ['4.6*', '4.6*'],
            ['4.6*', '3.5*']
        ]);
    });

    it('moves hammer-ons and slides as a whole', () => {
        expect(display(staffOf('\\transpose -4 2.3{h} 4.3 2.3{ss} 4.3'))).toEqual([
            ['3.4*', '5.4*', '3.4*', '5.4*']
        ]);
    });

    it('allows pull-offs to open strings', () => {
        const staff = staffOf('\\transpose 2 6.3{h} 2.3');
        expect(TabFingeringSolver.solve(staff, 0, 0)).toBe(null);
    });

    it('does not bend on open strings', () => {
        expect(display(staffOf('\\transpose -4 4.3{b (0 4)}'))).toEqual([['5.4*']]);
    });

    it('remaps natural harmonics to nodes of the transposed pitch', () => {
        const sameString = staffOf('\\transpose 7 12.6{nh}');
        expect(TabFingeringSolver.solve(sameString, 0, 0)).toBe(null);
        const note = sameString.bars[0].voices[0].beats[0].notes[0];
        expect(TabFingeringSolver.naturalNodeValues[TabFingeringSolver.findNaturalNodeOnModelString(note)]).toBe(7);

        expect(display(staffOf('\\transpose -4 12.5{nh}'))).toEqual([['1.6*A']]);
    });

    it('ignores the fret of dead notes', () => {
        const staff = staffOf('\\transpose -4 0.6{x}');
        expect(TabFingeringSolver.solve(staff, 0, 0)).toBe(null);
    });

    it('requires a playable trill fret', () => {
        expect(TabFingeringSolver.solve(staffOf('\\transpose -5 5.3{tr 7 16}'), 0, 0)).toBe(null);
        expect(display(staffOf('\\transpose -6 5.3{tr 7 16}'))).toEqual([['4.4*']]);
    });

    it('handles re-entrant tunings', () => {
        expect(display(staffOf('\\tuning A4 E4 C4 G4 \\transpose -6 2.1'))).toEqual([['1.2*']]);
    });

    it('handles bass tunings', () => {
        expect(display(staffOf('\\tuning G2 D2 A1 E1 \\transpose -1 0.3 0.4'))).toEqual([['4.4*', '-1.4!']]);
    });

    it('counts the fret limit from the capo', () => {
        expect(display(staffOf('\\capo 2 \\transpose 3 20.1'))).toEqual([['23.1!']]);
        expect(display(staffOf('\\capo 2 \\transpose 2 20.1'))).toEqual([['22.1']]);
    });

    it('avoids collisions across voices', () => {
        const staff = staffOf('\\transpose -4 \\voice 0.1 \\voice 1.2');
        expect(display(staff)).toEqual([['1.2*', '1.3*']]);
    });

    it('keeps grace notes connected to their main note', () => {
        expect(display(staffOf('\\transpose -4 2.3{ss} {gr ob} 4.3'))).toEqual([['3.4*', '5.4*']]);
    });

    it('fingers repeated bars identically', () => {
        const result = display(staffOf('\\transpose -4 3.5 2.4 0.3 | 3.5 2.4 0.3'));
        expect(result[1]).toEqual(result[0]);
    });

    it('is deterministic', () => {
        const tex = '\\transpose -4 (0.1 0.2 0.3) (3.5 2.4) 0.6 | (0.1 1.2) 3.3{h} 5.3';
        expect(display(staffOf(tex))).toEqual(display(staffOf(tex)));
    });
});
