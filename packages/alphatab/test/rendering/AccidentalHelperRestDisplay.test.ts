import { Bar } from '@coderline/alphatab/model/Bar';
import { Clef } from '@coderline/alphatab/model/Clef';
import { KeySignature } from '@coderline/alphatab/model/KeySignature';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import { NoteAccidentalMode } from '@coderline/alphatab/model/NoteAccidentalMode';
import { Ottavia } from '@coderline/alphatab/model/Ottavia';
import { AccidentalHelper } from '@coderline/alphatab/rendering/utils/AccidentalHelper';
import { describe, expect, it } from 'vitest';

// calculateRestDisplaySteps must return the same staff step as calculateNoteSteps for the same pitch.
// Per MusicXML semantics a rest override is displayed where a note of that pitch would render;
// SMuFL rest glyphs share the note-head baseline convention. The whole-rest one-line shift is applied
// by the caller, not by this function.

// diatonic tones (semitone offsets within an octave): C=0, D=2, E=4, F=5, G=7, A=9, B=11
const diatonicTones = [0, 2, 4, 5, 7, 9, 11];
const octaves = [2, 3, 4, 5, 6];

function makeBar(clef: Clef, clefOttava: Ottavia = Ottavia.Regular): Bar {
    const bar = new Bar();
    bar.clef = clef;
    bar.clefOttava = clefOttava;
    bar.keySignature = KeySignature.C;
    return bar;
}

function expectedNoteSteps(bar: Bar, tone: number, octave: number): number {
    let noteValue = (octave + 1) * 12 + tone;
    switch (bar.clefOttava) {
        case Ottavia._15ma:
            noteValue -= 24;
            break;
        case Ottavia._8va:
            noteValue -= 12;
            break;
        case Ottavia._8vb:
            noteValue += 12;
            break;
        case Ottavia._15mb:
            noteValue += 24;
            break;
    }
    const spelling = ModelUtils.resolveSpelling(bar.keySignature, noteValue, NoteAccidentalMode.Default);
    return AccidentalHelper.calculateNoteSteps(bar.clef, spelling);
}

function expectStepsMatchForClef(clef: Clef): void {
    const bar = makeBar(clef);
    for (const octave of octaves) {
        for (const tone of diatonicTones) {
            const restSteps = AccidentalHelper.calculateRestDisplaySteps(bar, tone, octave);
            const noteSteps = expectedNoteSteps(bar, tone, octave);
            expect(restSteps).toBe(noteSteps);
        }
    }
}

describe('AccidentalHelper.calculateRestDisplaySteps', () => {
    it('matches calculateNoteSteps for treble clef', () => {
        expectStepsMatchForClef(Clef.G2);
    });

    it('matches calculateNoteSteps for bass clef', () => {
        expectStepsMatchForClef(Clef.F4);
    });

    it('matches calculateNoteSteps for alto clef', () => {
        expectStepsMatchForClef(Clef.C3);
    });

    it('matches calculateNoteSteps for tenor clef', () => {
        expectStepsMatchForClef(Clef.C4);
    });

    it('matches calculateNoteSteps for neutral clef', () => {
        expectStepsMatchForClef(Clef.Neutral);
    });

    it('applies ottava shifts consistently', () => {
        for (const ottava of [Ottavia._15ma, Ottavia._8va, Ottavia.Regular, Ottavia._8vb, Ottavia._15mb]) {
            const bar = makeBar(Clef.G2, ottava);
            const restSteps = AccidentalHelper.calculateRestDisplaySteps(bar, 0, 4); // C4
            expect(restSteps).toBe(expectedNoteSteps(bar, 0, 4));
        }
    });
});
