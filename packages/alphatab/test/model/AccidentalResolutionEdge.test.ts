import { describe, expect, it } from 'vitest';
import { AccidentalType } from '@coderline/alphatab/model/AccidentalType';
import { KeySignature } from '@coderline/alphatab/model/KeySignature';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import { NoteAccidentalMode } from '@coderline/alphatab/model/NoteAccidentalMode';
describe('AccidentalResolutionEdgeTests', () => {
    it('spells B# in C# major for pitch C natural', () => {
        const ks = KeySignature.CSharp;
        const noteValue = 60; // C4
        const spelling = ModelUtils.resolveSpelling(ks, noteValue, NoteAccidentalMode.Default);
        expect(spelling.degree).toBe(6); // B
        expect(spelling.accidentalOffset).toBe(1); // B#
        const accidental = ModelUtils.computeAccidentalForSpelling(ks, NoteAccidentalMode.Default, spelling, false, null);
        expect(accidental).toBe(AccidentalType.None);
    });

    it('spells Fb in Cb major for pitch E natural', () => {
        const ks = KeySignature.Cb;
        const noteValue = 64; // E4
        const spelling = ModelUtils.resolveSpelling(ks, noteValue, NoteAccidentalMode.Default);
        expect(spelling.degree).toBe(3); // F
        expect(spelling.accidentalOffset).toBe(-1); // Fb
        const accidental = ModelUtils.computeAccidentalForSpelling(ks, NoteAccidentalMode.Default, spelling, false, null);
        expect(accidental).toBe(AccidentalType.None);
    });

    it('forces double sharp spelling when requested', () => {
        const ks = KeySignature.C;
        const noteValue = 62; // D
        const spelling = ModelUtils.resolveSpelling(ks, noteValue, NoteAccidentalMode.ForceDoubleSharp);
        expect(spelling.degree).toBe(0); // C
        expect(spelling.accidentalOffset).toBe(2); // C##
        const accidental = ModelUtils.computeAccidentalForSpelling(
            ks,
            NoteAccidentalMode.ForceDoubleSharp,
            spelling,
            false,
            null
        );
        expect(accidental).toBe(AccidentalType.DoubleSharp);
    });

    it('forces double flat spelling when requested', () => {
        const ks = KeySignature.C;
        const noteValue = 62; // D
        const spelling = ModelUtils.resolveSpelling(ks, noteValue, NoteAccidentalMode.ForceDoubleFlat);
        expect(spelling.degree).toBe(2); // E
        expect(spelling.accidentalOffset).toBe(-2); // Ebb
        const accidental = ModelUtils.computeAccidentalForSpelling(
            ks,
            NoteAccidentalMode.ForceDoubleFlat,
            spelling,
            false,
            null
        );
        expect(accidental).toBe(AccidentalType.DoubleFlat);
    });
});