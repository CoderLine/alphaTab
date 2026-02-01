import { AccidentalType } from '@coderline/alphatab/model/AccidentalType';
import { KeySignature } from '@coderline/alphatab/model/KeySignature';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import { NoteAccidentalMode } from '@coderline/alphatab/model/NoteAccidentalMode';
import { expect } from 'chai';

describe('QuarterToneAccidentalsTests', () => {
    it('uses natural quarter tone when no key signature offset is required', () => {
        const ks = KeySignature.C;
        const noteValue = 60; // C4
        const spelling = ModelUtils.resolveSpelling(ks, noteValue, NoteAccidentalMode.Default);
        const accidental = ModelUtils.computeAccidentalForSpelling(ks, NoteAccidentalMode.Default, spelling, true, null);
        expect(accidental).to.equal(AccidentalType.NaturalQuarterNoteUp);
    });

    it('uses sharp quarter tone for positive offset', () => {
        const ks = KeySignature.C;
        const noteValue = 61; // C#
        const spelling = ModelUtils.resolveSpelling(ks, noteValue, NoteAccidentalMode.ForceSharp);
        const accidental = ModelUtils.computeAccidentalForSpelling(ks, NoteAccidentalMode.ForceSharp, spelling, true, null);
        expect(accidental).to.equal(AccidentalType.SharpQuarterNoteUp);
    });

    it('uses flat quarter tone for negative offset', () => {
        const ks = KeySignature.C;
        const noteValue = 61; // Db
        const spelling = ModelUtils.resolveSpelling(ks, noteValue, NoteAccidentalMode.ForceFlat);
        const accidental = ModelUtils.computeAccidentalForSpelling(ks, NoteAccidentalMode.ForceFlat, spelling, true, null);
        expect(accidental).to.equal(AccidentalType.FlatQuarterNoteUp);
    });
});