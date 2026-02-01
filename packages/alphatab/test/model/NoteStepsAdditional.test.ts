import { Clef } from '@coderline/alphatab/model/Clef';
import { KeySignature } from '@coderline/alphatab/model/KeySignature';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import { NoteAccidentalMode } from '@coderline/alphatab/model/NoteAccidentalMode';
import { AccidentalHelper } from '@coderline/alphatab/rendering/utils/AccidentalHelper';
import { expect } from 'chai';

describe('NoteStepsAdditionalTests', () => {
    it('same pitch yields different steps across clefs', () => {
        const spelling = ModelUtils.resolveSpelling(KeySignature.C, 60, NoteAccidentalMode.Default); // C4
        const stepsG2 = AccidentalHelper.calculateNoteSteps(Clef.G2, spelling);
        const stepsC4 = AccidentalHelper.calculateNoteSteps(Clef.C4, spelling);
        expect(stepsG2 - stepsC4).to.equal(8);
    });

    it('enharmonic spelling changes steps (C# vs Db)', () => {
        const noteValue = 61; // C#/Db
        const spellingSharp = ModelUtils.resolveSpelling(KeySignature.C, noteValue, NoteAccidentalMode.ForceSharp);
        const spellingFlat = ModelUtils.resolveSpelling(KeySignature.C, noteValue, NoteAccidentalMode.ForceFlat);

        const stepsSharp = AccidentalHelper.calculateNoteSteps(Clef.G2, spellingSharp);
        const stepsFlat = AccidentalHelper.calculateNoteSteps(Clef.G2, spellingFlat);

        expect(stepsSharp - stepsFlat).to.equal(1);
    });
});