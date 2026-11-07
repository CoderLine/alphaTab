import { AlphaTexImporter } from '@coderline/alphatab/importer/AlphaTexImporter';
import type { Beat } from '@coderline/alphatab/model/Beat';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { NotationMode } from '@coderline/alphatab/NotationSettings';
import { NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import type { NumberedBeatGlyph } from '@coderline/alphatab/rendering/glyphs/NumberedBeatGlyph';
import type { TieGlyph } from '@coderline/alphatab/rendering/glyphs/TieGlyph';
import type { NumberedBarRenderer } from '@coderline/alphatab/rendering/NumberedBarRenderer';
import type { NumberedBeatContainerGlyph } from '@coderline/alphatab/rendering/NumberedBeatContainerGlyph';
import { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import type { BoundsLookup } from '@coderline/alphatab/rendering/utils/BoundsLookup';
import type { NoteBounds } from '@coderline/alphatab/rendering/utils/NoteBounds';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, expect, it } from 'vitest';
import { VisualTestHelper } from '../visualTests/VisualTestHelper';

/**
 * Chords on numbered staves stack one number per note, the lowest note at the bottom;
 * every voice is written on its own row below the previous voice.
 */
describe('NumberedChords', () => {
    /**
     * Renders with the fonts of the visual tests, so the measured number height (12 px) is the same on all platforms.
     */
    async function render(tex: string, barsPerRow: number = -1, songBook: boolean = false): Promise<ScoreRenderer> {
        await VisualTestHelper.prepareAlphaSkia();
        const settings = new Settings();
        VisualTestHelper.prepareSettingsForTest(settings);
        settings.display.barsPerRow = barsPerRow;
        if (songBook) {
            // let ring notes tied to a note are hidden
            settings.notation.notationMode = NotationMode.SongBook;
        }
        settings.core.includeNoteBounds = true;
        const importer = new AlphaTexImporter();
        importer.initFromString(tex, settings);
        const score = importer.readScore();
        const renderer = new ScoreRenderer(settings);
        renderer.width = 1300;
        renderer.renderScore(score, [0]);
        return renderer;
    }

    function noteBounds(lookup: BoundsLookup, beat: Beat): NoteBounds[] {
        const bounds = lookup.findBeat(beat);
        expect(bounds).not.toBeNull();
        return bounds!.notes ?? [];
    }

    function boundsOfNote(all: NoteBounds[], realValue: number): NoteBounds {
        const found = all.filter(n => n.note.realValue === realValue);
        expect(found.length).toBe(1);
        return found[0];
    }

    /**
     * The top of the bounds of the number of the note.
     */
    function topOf(lookup: BoundsLookup, beat: Beat, realValue: number): number {
        return boundsOfNote(noteBounds(lookup, beat), realValue).noteHeadBounds.y;
    }

    /**
     * The vertical centre of the number of the note in the rendered score: the line of its slot.
     */
    function centerOf(renderer: ScoreRenderer, beat: Beat, realValue: number): number {
        const lookup = renderer.boundsLookup!;
        const note = boundsOfNote(noteBounds(lookup, beat), realValue).note;
        const barRenderer = renderer.layout!.getRendererForBar('numbered', beat.voice.bar)!;
        return lookup.findBeat(beat)!.barBounds.realBounds.y + barRenderer.getNoteY(note, NoteYPosition.Center);
    }

    function numberedRenderer(renderer: ScoreRenderer, beat: Beat): NumberedBarRenderer {
        return renderer.layout!.getRendererForBar('numbered', beat.voice.bar) as NumberedBarRenderer;
    }

    function numbersOf(renderer: ScoreRenderer, beat: Beat): NumberedBeatGlyph {
        const container = numberedRenderer(renderer, beat).getBeatContainer(beat) as NumberedBeatContainerGlyph;
        return container.onNotes as NumberedBeatGlyph;
    }

    // one step (half a staff space) in the default settings
    const step = 4.5;

    it('stacks the numbers by pitch regardless of the note order', async () => {
        // G4 C4 E4 is entered top-first; the numbers must still read 1 (bottom), 3, 5 (top)
        const renderer = await render('\\track \\staff {numbered} (G4 C4 E4).4 (C4 E4 G4).4 C4.2');
        const lookup = renderer.boundsLookup!;
        const beats = renderer.score!.tracks[0].staves[0].bars[0].voices[0].beats;

        for (const beat of [beats[0], beats[1]]) {
            const all = noteBounds(lookup, beat);
            expect(all.length).toBe(3);

            const c4 = boundsOfNote(all, 60).noteHeadBounds;
            const e4 = boundsOfNote(all, 64).noteHeadBounds;
            const g4 = boundsOfNote(all, 67).noteHeadBounds;

            // each higher note sits fully above the note below, without overlapping it
            expect(e4.y + e4.h).toBeLessThanOrEqual(c4.y);
            expect(g4.y + g4.h).toBeLessThanOrEqual(e4.y);

            // the numbers are centered on the same column
            expect(e4.x + e4.w / 2).toBeCloseTo(c4.x + c4.w / 2, 3);
            expect(g4.x + g4.w / 2).toBeCloseTo(c4.x + c4.w / 2, 3);
        }

        // the lowest number of a chord stays on the row of single notes
        const single = noteBounds(lookup, beats[2]);
        expect(single.length).toBe(1);
        expect(boundsOfNote(noteBounds(lookup, beats[0]), 60).noteHeadBounds.y).toBeCloseTo(
            single[0].noteHeadBounds.y,
            3
        );
    });

    it('writes the second voice on its own row aligned in time', async () => {
        const renderer = await render(
            '\\track \\staff {numbered} \\voice C5.4 D5 E5 F5 | C5.1 \\voice C4.2 G4.2 | C4.1'
        );
        const lookup = renderer.boundsLookup!;
        const bars = renderer.score!.tracks[0].staves[0].bars;
        const upper = bars[0].voices[0].beats;
        const lower = bars[0].voices[1].beats;

        const upperC5 = boundsOfNote(noteBounds(lookup, upper[0]), 72).noteHeadBounds;
        const upperE5 = boundsOfNote(noteBounds(lookup, upper[2]), 76).noteHeadBounds;
        const lowerC4 = boundsOfNote(noteBounds(lookup, lower[0]), 60).noteHeadBounds;
        const lowerG4 = boundsOfNote(noteBounds(lookup, lower[1]), 67).noteHeadBounds;

        // the second voice sits fully below the first voice
        expect(lowerC4.y).toBeGreaterThan(upperC5.y + upperC5.h);
        // both rows are horizontal lines
        expect(centerOf(renderer, lower[1], 67)).toBeCloseTo(centerOf(renderer, lower[0], 60), 3);
        // beats starting at the same time share their horizontal position
        expect(lowerC4.x).toBeCloseTo(upperC5.x, 3);
        expect(lowerG4.x).toBeCloseTo(upperE5.x, 3);

        // the row of the second voice is kept in the next bar
        const nextLower = boundsOfNote(noteBounds(lookup, bars[1].voices[1].beats[0]), 60).noteHeadBounds;
        expect(nextLower.y).toBeCloseTo(lowerC4.y, 3);
    });

    // the step counts follow the measured number height of Noto Sans in the visual test setup (12 px)
    it('lines up the chord numbers along the system', async () => {
        // system 1: C5 carries a high dot below G5 (6 steps), bar 2 is dot-free on its own (4 steps)
        // system 2: G3 carries a low dot above C3 (7 steps), C5 below G5 needs 6: the position takes 7
        // system 3: no octave dots in the gaps (4 steps)
        const renderer = await render(
            `\\track \\staff {numbered}
            (C4 E4).4 (C5 G5).4 r.2 | (D4 F4).4 D4.4 r.2 |
            (C4 E4).4 (C3 G3).4 r.2 | (C5 G5).4 r.4 r.2 |
            (C4 E4).4 r.4 r.2 | (D4 F4).2 r.2`,
            2
        );
        const bars = renderer.score!.tracks[0].staves[0].bars;
        const distance = (barIndex: number, beatIndex: number, lower: number, upper: number) =>
            centerOf(renderer, bars[barIndex].voices[0].beats[beatIndex], lower) -
            centerOf(renderer, bars[barIndex].voices[0].beats[beatIndex], upper);

        expect(distance(0, 0, 60, 64)).toBeCloseTo(6 * step, 3);
        expect(distance(0, 1, 72, 79)).toBeCloseTo(6 * step, 3);
        expect(distance(1, 0, 62, 65)).toBeCloseTo(6 * step, 3);

        expect(distance(2, 0, 60, 64)).toBeCloseTo(7 * step, 3);
        expect(distance(2, 1, 48, 55)).toBeCloseTo(7 * step, 3);
        expect(distance(3, 0, 72, 79)).toBeCloseTo(7 * step, 3);

        expect(distance(4, 0, 60, 64)).toBeCloseTo(4 * step, 3);
        expect(distance(5, 0, 62, 65)).toBeCloseTo(4 * step, 3);

        // the lowest number of a moved chord stays on the line of single numbers
        expect(centerOf(renderer, bars[1].voices[0].beats[0], 62)).toBeCloseTo(
            centerOf(renderer, bars[1].voices[0].beats[1], 62),
            3
        );
    });

    it('places the voice rows by their content', async () => {
        // system 1: plain numbers, the time signature written in front of both rows sets the distance:
        //   2 * 18.036 (numerator and denominator) + 9 (staff content padding) = 45.07 px -> 11 steps
        // system 2: low dots below two underlines in the first row, a chord in the second row:
        //   30.03 (number half, underlines, low dot) + 18 (row separation) + 18 + 6 (chord) = 72.03 px -> 17 steps
        // system 3: as system 2 with a tie in the second row: + 18.29 (tuplet number and offset) = 90.32 px -> 21 steps
        const renderer = await render(
            `\\track \\staff {numbered}
            \\voice C5.4 D5 E5 F5 | C3.16 D3 E3 F3 C4.4 C4.2 | C3.16 D3 E3 F3 C4.4 C4.2
            \\voice C4.4 D4 E4 F4 | (C4 E4).4 r.4 r.2 | (C4 E4).4 E4{t}.4 r.2`,
            1
        );
        const lookup = renderer.boundsLookup!;
        const bars = renderer.score!.tracks[0].staves[0].bars;
        const rowDistance = (barIndex: number, upper: number, lower: number) =>
            centerOf(renderer, bars[barIndex].voices[1].beats[0], lower) -
            centerOf(renderer, bars[barIndex].voices[0].beats[0], upper);

        expect(rowDistance(0, 72, 60)).toBeCloseTo(11 * step, 3);
        expect(rowDistance(1, 48, 60)).toBeCloseTo(17 * step, 3);
        expect(rowDistance(2, 48, 60)).toBeCloseTo(21 * step, 3);

        // beats starting at the same time share their horizontal position
        expect(boundsOfNote(noteBounds(lookup, bars[1].voices[1].beats[0]), 60).noteHeadBounds.x).toBeCloseTo(
            boundsOfNote(noteBounds(lookup, bars[1].voices[0].beats[0]), 48).noteHeadBounds.x,
            3
        );
    });

    it('keeps the copies of the time signature apart only in systems writing it', async () => {
        // systems 1 and 3 write 4/4 and 3/4 in front of both rows; the copies keep the staff content padding:
        //   2 * 18.036 (numerator and denominator) + 9 = 45.07 px -> 11 steps
        // system 2 writes none, the plain rows need 6 (number half) + 18 (row separation) + 6 = 30 px -> 7 steps
        const renderer = await render(
            `\\track \\staff {numbered}
            \\voice C4.4 D4 E4 F4 | C4.4 D4 E4 F4 | \\ts (3 4) C4.4 D4 E4
            \\voice C4.4 D4 E4 F4 | C4.4 D4 E4 F4 | C4.4 D4 E4`,
            1
        );
        const bars = renderer.score!.tracks[0].staves[0].bars;
        const rowDistance = (barIndex: number) =>
            centerOf(renderer, bars[barIndex].voices[1].beats[0], 60) -
            centerOf(renderer, bars[barIndex].voices[0].beats[0], 60);
        expect(rowDistance(0)).toBeCloseTo(11 * step, 3);
        expect(rowDistance(1)).toBeCloseTo(7 * step, 3);
        expect(rowDistance(2)).toBeCloseTo(11 * step, 3);
    });

    it('spaces the time signature copies by the glyph written in front of the rows', async () => {
        const rowDistance = (renderer: ScoreRenderer, barIndex: number) => {
            const bar = renderer.score!.tracks[0].staves[0].bars[barIndex];
            return centerOf(renderer, bar.voices[1].beats[0], 60) - centerOf(renderer, bar.voices[0].beats[0], 60);
        };

        // the time signature of `score numbered` is written on the standard notation staff only: 7 steps
        const cascade = await render(
            `\\track \\staff {score numbered}
            \\voice C4.4 D4 E4 F4 \\voice C4.4 D4 E4 F4`
        );
        expect(rowDistance(cascade, 0)).toBeCloseTo(7 * step, 3);

        // the common time glyph is 18 px high: 18 + 9 = 27 px -> 6 steps, the plain rows (7 steps) decide
        const common = await render(
            `\\track \\staff {numbered}
            \\ts common \\voice C4.4 D4 E4 F4 \\voice C4.4 D4 E4 F4`
        );
        expect(rowDistance(common, 0)).toBeCloseTo(7 * step, 3);

        // bar 2 changes to 3/4 with an empty second voice: the time signature is written in front of the first
        // and third row only, which the plain rows already keep apart (2 * 7 steps)
        const gap = await render(
            `\\track \\staff {numbered}
            \\voice C4.4 D4 E4 F4 | \\ts (3 4) C4.4 D4 E4
            \\voice C4.1
            \\voice C4.4 D4 E4 F4 | C4.4 D4 E4`,
            1
        );
        const gapBar = gap.score!.tracks[0].staves[0].bars[1];
        expect(gapBar.masterBar.timeSignatureNumerator).toBe(3);
        expect(gapBar.filledVoices.has(1)).toBe(false);
        expect(centerOf(gap, gapBar.voices[2].beats[0], 60) - centerOf(gap, gapBar.voices[0].beats[0], 60)).toBeCloseTo(
            14 * step,
            3
        );
    });

    it('pairs the parts of a row distance within each bar', async () => {
        // bar 1: deep first row, plain second row: 30.03 + 18 + 6 = 54.03 px -> 13 steps
        // bar 2: plain first row, chord with a tie in the second row: 6 + 18 + 18 + 6 + 18.29 = 66.29 px -> 15 steps
        // the system takes 15, not the deepest first row of bar 1 plus the highest second row of bar 2
        const renderer = await render(
            `\\track \\staff {numbered}
            \\voice C3.16 D3 E3 F3 C4.4 C4.2 | C5.4 D5 E5 F5
            \\voice C4.4 D4 E4 F4 | (C4 E4).4 E4{t}.4 r.2`,
            2
        );
        const bars = renderer.score!.tracks[0].staves[0].bars;
        expect(
            centerOf(renderer, bars[0].voices[1].beats[0], 60) - centerOf(renderer, bars[0].voices[0].beats[0], 48)
        ).toBeCloseTo(15 * step, 3);
        expect(
            centerOf(renderer, bars[1].voices[1].beats[0], 60) - centerOf(renderer, bars[1].voices[0].beats[0], 72)
        ).toBeCloseTo(15 * step, 3);
    });

    it('writes a system without the second voice like a single voice', async () => {
        const withVoice = await render(
            '\\track \\staff {numbered} \\voice C5.4 D5 E5 F5 | C5.4 D5 E5 F5 \\voice C4.1',
            1
        );
        const single = await render('\\track \\staff {numbered} C5.4 D5 E5 F5 | C5.4 D5 E5 F5', 1);
        const a = withVoice.boundsLookup!.staffSystems;
        const b = single.boundsLookup!.staffSystems;
        expect(a.length).toBe(2);
        expect(b.length).toBe(2);
        expect(a[1].realBounds.h).toBeCloseTo(b[1].realBounds.h, 3);
        expect(a[1].bars[0].bars[0].realBounds.h).toBeCloseTo(b[1].bars[0].bars[0].realBounds.h, 3);
        const aBeat = withVoice.score!.tracks[0].staves[0].bars[1].voices[0].beats[0];
        const bBeat = single.score!.tracks[0].staves[0].bars[1].voices[0].beats[0];
        expect(centerOf(withVoice, aBeat, 72) - a[1].realBounds.y).toBeCloseTo(
            centerOf(single, bBeat, 72) - b[1].realBounds.y,
            3
        );
        // the first system has both rows
        expect(a[0].realBounds.h).toBeGreaterThan(b[0].realBounds.h);
    });

    it('keeps the row of an empty first voice blank', async () => {
        // bar 2 has no first voice; its second voice stays on the second row, 11 steps apart as bar 1 writes
        // the time signature in front of both rows
        const renderer = await render('\\track \\staff {numbered} \\voice C5.1 | | \\voice C4.1 | C4.1');
        const lookup = renderer.boundsLookup!;
        const bars = renderer.score!.tracks[0].staves[0].bars;
        const firstRow = centerOf(renderer, bars[0].voices[0].beats[0], 72);
        expect(centerOf(renderer, bars[0].voices[1].beats[0], 60) - firstRow).toBeCloseTo(11 * step, 3);
        expect(centerOf(renderer, bars[1].voices[1].beats[0], 60) - firstRow).toBeCloseTo(11 * step, 3);
        expect(noteBounds(lookup, bars[1].voices[0].beats[0]).length).toBe(0);
    });

    it('ends a tie of the second voice across a system break on the second row', async () => {
        // the bounds of the tied notes, which the tie is laid out from after the alignment;
        // with the tie reserve the rows need 6 + 18 + 6 + 18.29 = 48.29 px -> 11 steps in both systems, with or
        // without the time signature
        const renderer = await render('\\track \\staff {numbered} \\voice C5.1 | C5.1 \\voice C4.1 | C4{t}.1', 1);
        const lookup = renderer.boundsLookup!;
        const bars = renderer.score!.tracks[0].staves[0].bars;
        for (const bar of bars) {
            const firstRow = centerOf(renderer, bar.voices[0].beats[0], 72);
            expect(centerOf(renderer, bar.voices[1].beats[0], 60) - firstRow).toBeCloseTo(11 * step, 3);
        }
        const beat = bars[1].voices[1].beats[0];
        const r = renderer.layout!.getRendererForBar('numbered', bars[1])!;
        const barY = lookup.findBeat(beat)!.barBounds.realBounds.y;
        expect(topOf(lookup, beat, 60)).toBeCloseTo(barY + r.getNoteY(beat.notes[0], NoteYPosition.Top), 3);
    });

    it('reports the aligned positions of moved bars', async () => {
        // bar 1 is dot-free on its own and moves onto the wider slots of bar 2 (C5 under G5) in the same system;
        // its tied E4 is laid out after the alignment from the same positions as the bounds
        const renderer = await render('\\track \\staff {numbered} (C4 E4).2 (C4 E4).2 | (C4 E4{t}).4 (C5 G5).4 r.2');
        const lookup = renderer.boundsLookup!;
        const bars = renderer.score!.tracks[0].staves[0].bars;
        const distance = (barIndex: number, beatIndex: number, lower: number, upper: number) =>
            centerOf(renderer, bars[barIndex].voices[0].beats[beatIndex], lower) -
            centerOf(renderer, bars[barIndex].voices[0].beats[beatIndex], upper);
        expect(distance(0, 0, 60, 64)).toBeCloseTo(6 * step, 3);
        expect(distance(0, 1, 60, 64)).toBeCloseTo(6 * step, 3);
        expect(distance(1, 0, 60, 64)).toBeCloseTo(6 * step, 3);
        expect(distance(1, 1, 72, 79)).toBeCloseTo(6 * step, 3);

        const r = renderer.layout!.getRendererForBar('numbered', bars[0])!;
        for (const beat of bars[0].voices[0].beats) {
            const barY = lookup.findBeat(beat)!.barBounds.realBounds.y;
            for (const note of beat.notes) {
                expect(topOf(lookup, beat, note.realValue)).toBeCloseTo(barY + r.getNoteY(note, NoteYPosition.Top), 3);
            }
        }
    });

    it('writes the highest visible note in single note mode', async () => {
        // the let ring G4 tied into beat 2 is hidden: beat 2 writes E4; the tie of the hidden G4 is not drawn
        const renderer = await render(
            `\\track \\staff {numbered} \\staffDisplay numbered { notes singleNote }
            (C4 E4 G4{lr}).4 (C4 E4 G4{lr t}).4 (C4 G4).4 (C4{t} G4{t}).4`,
            -1,
            true
        );
        const lookup = renderer.boundsLookup!;
        const beats = renderer.score!.tracks[0].staves[0].bars[0].voices[0].beats;
        expect(beats[1].notes[2].isVisible).toBe(false);

        const written = [67, 64, 67, 67];
        for (let i = 0; i < beats.length; i++) {
            const notes = noteBounds(lookup, beats[i]);
            expect(notes.length).toBe(1);
            expect(notes[0].note.realValue).toBe(written[i]);
        }

        // only the written G4 of beats 3 and 4 is tied, once from its start and once to its end
        const g4 = beats[2].notes[1];
        const ties = numberedRenderer(renderer, beats[0]).ties;
        expect(ties.length).toBe(2);
        for (const tie of ties) {
            expect((tie as unknown as TieGlyph).slurEffectId).toBe(`numbered.tie.${g4.id}`);
        }
    });

    it('writes no number for a beat with only hidden notes', async () => {
        // the let ring C#4 and E4 tied into beat 2 are hidden, which makes the beat empty: no number and no
        // accidental is written
        const renderer = await render(
            '\\track \\staff {numbered} (C#4{lr} E4{lr}).4 (C#4{lr t} E4{lr t}).4 C4.2',
            -1,
            true
        );
        const lookup = renderer.boundsLookup!;
        const beats = renderer.score!.tracks[0].staves[0].bars[0].voices[0].beats;
        expect(beats[1].isEmpty).toBe(true);
        expect(noteBounds(lookup, beats[0]).length).toBe(2);
        expect(noteBounds(lookup, beats[1]).length).toBe(0);
        const numbers = numbersOf(renderer, beats[1]);
        expect(numbers.noteHead).toBeNull();
        expect(numbers.chord).toBeNull();
        // a beat without accidentals has no pre-notes glyph
        expect(numbers.container.preNotes).toBeNull();
        expect(numbersOf(renderer, beats[0]).container.preNotes).not.toBeNull();
    });

    it('writes the accidental and the augmentation dot of every chord number at the number', async () => {
        // dot-free numbers 4 steps apart; C#4 and G#4 carry a sharp, E4 none; every number gets one dot
        const renderer = await render('\\track \\staff {numbered} (C#4 E4 G#4).4{d} r.8 r.2');
        const lookup = renderer.boundsLookup!;
        const beat = renderer.score!.tracks[0].staves[0].bars[0].voices[0].beats[0];
        const barY = lookup.findBeat(beat)!.barBounds.realBounds.y;
        const chord = numbersOf(renderer, beat).chord!;
        const container = numbersOf(renderer, beat).container;
        expect(chord.heads.length).toBe(3);

        const values = [61, 64, 68];
        const accidentals = [true, false, true];
        for (let k = 0; k < 3; k++) {
            const head = chord.heads[k];
            expect(head.note!.realValue).toBe(values[k]);
            const bounds = boundsOfNote(noteBounds(lookup, beat), values[k]).noteHeadBounds;
            const center = bounds.y + bounds.h / 2 - barY - container.y;
            expect(center).toBeCloseTo(chord.y + head.y, 3);
            if (k > 0) {
                expect(chord.heads[k - 1].y - head.y).toBeCloseTo(4 * step, 3);
            }
            if (accidentals[k]) {
                expect(head.accidental!.y).toBeCloseTo(center, 3);
            } else {
                expect(head.accidental).toBeNull();
            }
            expect(head.dots!.length).toBe(1);
            expect(head.dots![0].y).toBeCloseTo(center, 3);
        }
    });

    it('writes the time signature and the repeat dots in front of every row with content', async () => {
        // voices 1 and 3 are filled, voice 2 is empty: the rows of voices 1 and 3 are written, 14 steps apart
        // (twice the 7 steps of plain rows, see the time signature spacing above)
        const renderer = await render(
            `\\track \\staff {numbered}
            \\voice \\ro C4.4 D4 E4 F4 | \\ts (3 4) C4.4 D4 E4
            \\voice C4.1
            \\voice C4.4 D4 E4 F4 | C4.4 D4 E4`,
            1
        );
        const bar = renderer.score!.tracks[0].staves[0].bars[1];
        const r = numberedRenderer(renderer, bar.voices[0].beats[0]);
        expect(r.isRowWritten(0)).toBe(true);
        expect(r.isRowWritten(1)).toBe(false);
        expect(r.isRowWritten(2)).toBe(true);
        expect(r.staffRowCount).toBe(2);
        expect(r.getStaffRowOffset(0)).toBe(0);
        expect(r.getStaffRowOffset(1)).toBeCloseTo(14 * step, 3);

        // the first bar starts a repeat in front of all three rows
        const first = numberedRenderer(renderer, renderer.score!.tracks[0].staves[0].bars[0].voices[0].beats[0]);
        expect(first.bar.masterBar.isRepeatStart).toBe(true);
        expect(first.staffRowCount).toBe(3);
        expect(first.getStaffRowOffset(1)).toBeCloseTo(11 * step, 3);
        expect(first.getStaffRowOffset(2)).toBeCloseTo(22 * step, 3);
    });

    it('keeps a grace chord of a lower row below the row above', async () => {
        // system 2 writes no time signature. The grace numbers 1, 3 and 5 are 10, 12 and 11 px high and stacked
        // 4.5 px apart, so the top of the grace chord is 5 + 4.5 + 12 + 4.5 + 11 = 37 px above its row:
        // 6 (number half) + 18 (row separation) + 37 = 61 px -> 14 steps; the plain rows of bar 3 need 7 steps
        const renderer = await render(
            `\\track \\staff {numbered}
            \\voice C4.4 D4 E4 F4 | C4.4 D4 E4 F4 | C4.4 D4 E4 F4
            \\voice C4.4 D4 E4 F4 | (C4 E4 G4).16{gr} C4.4 D4 E4 F4 | C4.4 D4 E4 F4`,
            1
        );
        const bars = renderer.score!.tracks[0].staves[0].bars;
        expect(
            centerOf(renderer, bars[1].voices[1].beats[1], 60) - centerOf(renderer, bars[1].voices[0].beats[0], 60)
        ).toBeCloseTo(14 * step, 3);
        expect(
            centerOf(renderer, bars[2].voices[1].beats[0], 60) - centerOf(renderer, bars[2].voices[0].beats[0], 60)
        ).toBeCloseTo(7 * step, 3);
    });

    it('rests the bar number above the bracket spike also on a first bar moved onto the system slots', async () => {
        // the chords of bars 2 and 4 move the numbers of bars 1 and 3, the first bars of the two systems;
        // the bracket of the two staves curls into the first bar of the top staff
        const renderer = await render(
            `\\track \\staff {numbered}
            \\voice C5.1 | (C5 E5 G5).4 C5 D5 E5 | C5.1 | (C5 E5 G5).4 C5 D5 E5
            \\voice r.1 | C4.1 | r.1 | C4.1
            \\staff {numbered} C3.1 | C3.1 | C3.1 | C3.1`,
            2
        );
        const smufl = renderer.settings.display.resources.engravingSettings;
        const spikeHeight = smufl.glyphHeights.get(MusicFontSymbol.BracketTop)! + smufl.oneStaffSpace * 0.25;
        const bars = renderer.score!.tracks[0].staves[0].bars;
        for (const index of [0, 2]) {
            const r = numberedRenderer(renderer, bars[index].voices[0].beats[0]);
            expect(r.index).toBe(0);
            let barNumberMagnitude = -1;
            for (const band of r.topEffects.bands) {
                if (band.info.effectId === 'BarNumber' && !band.isEmpty) {
                    barNumberMagnitude = band.placedMagnitude;
                }
            }
            expect(barNumberMagnitude).toBeGreaterThan(spikeHeight);
        }
    });
});
