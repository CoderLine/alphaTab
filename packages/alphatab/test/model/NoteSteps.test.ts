import { Clef } from '@coderline/alphatab/model/Clef';
import { KeySignature } from '@coderline/alphatab/model/KeySignature';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import { NoteAccidentalMode } from '@coderline/alphatab/model/NoteAccidentalMode';
import { AccidentalHelper } from '@coderline/alphatab/rendering/utils/AccidentalHelper';
import { expect } from 'chai';

describe('NoteStepsTests', () => {
    it('calculates known steps for C4 in G2 and F4 clef', () => {
        const spelling = ModelUtils.resolveSpelling(KeySignature.C, 60, NoteAccidentalMode.Default); // C4
        const stepsG2 = AccidentalHelper.calculateNoteSteps(Clef.G2, spelling);
        const stepsF4 = AccidentalHelper.calculateNoteSteps(Clef.F4, spelling);

        expect(stepsG2).to.equal(10);
        expect(stepsF4).to.equal(-2);
    });

    it('octave shift changes steps by 7', () => {
        const spellingC4 = ModelUtils.resolveSpelling(KeySignature.C, 60, NoteAccidentalMode.Default); // C4
        const spellingC5 = ModelUtils.resolveSpelling(KeySignature.C, 72, NoteAccidentalMode.Default); // C5
        const stepsC4 = AccidentalHelper.calculateNoteSteps(Clef.G2, spellingC4);
        const stepsC5 = AccidentalHelper.calculateNoteSteps(Clef.G2, spellingC5);
        expect(stepsC4 - stepsC5).to.equal(7);
    });

    it('adjacent diatonic degrees differ by one step', () => {
        const spellingC4 = ModelUtils.resolveSpelling(KeySignature.C, 60, NoteAccidentalMode.Default); // C4
        const spellingD4 = ModelUtils.resolveSpelling(KeySignature.C, 62, NoteAccidentalMode.Default); // D4
        const stepsC4 = AccidentalHelper.calculateNoteSteps(Clef.G2, spellingC4);
        const stepsD4 = AccidentalHelper.calculateNoteSteps(Clef.G2, spellingD4);
        expect(stepsC4 - stepsD4).to.equal(1);
    });

    it('same pitch with different spelling yields different steps', () => {
        const noteValue = 61; // C# / Db
        const spellingSharp = ModelUtils.resolveSpelling(KeySignature.C, noteValue, NoteAccidentalMode.ForceSharp);
        const spellingFlat = ModelUtils.resolveSpelling(KeySignature.C, noteValue, NoteAccidentalMode.ForceFlat);

        const stepsSharp = AccidentalHelper.calculateNoteSteps(Clef.G2, spellingSharp);
        const stepsFlat = AccidentalHelper.calculateNoteSteps(Clef.G2, spellingFlat);

        expect(stepsSharp - stepsFlat).to.equal(1); // C# (degree 0) above Db (degree 1)
    });
});