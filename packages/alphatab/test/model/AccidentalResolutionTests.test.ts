import { AccidentalType } from '@coderline/alphatab/model/AccidentalType';
import { KeySignature } from '@coderline/alphatab/model/KeySignature';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import { NoteAccidentalMode } from '@coderline/alphatab/model/NoteAccidentalMode';
import { expect } from 'chai';

describe('AccidentalResolutionTests', () => {
    const degreeSemitones = [0, 2, 4, 5, 7, 9, 11];

    function noteValueForDegree(keySignature: KeySignature, degree: number, octave: number): number {
        const ksOffset = ModelUtils.getKeySignatureAccidentalOffset(keySignature, degree);
        const baseSemitone = degreeSemitones[degree] + ksOffset;
        return (octave + 1) * 12 + baseSemitone;
    }

    const allKeySignatures: KeySignature[] = [
        KeySignature.Cb,
        KeySignature.Gb,
        KeySignature.Db,
        KeySignature.Ab,
        KeySignature.Eb,
        KeySignature.Bb,
        KeySignature.F,
        KeySignature.C,
        KeySignature.G,
        KeySignature.D,
        KeySignature.A,
        KeySignature.E,
        KeySignature.B,
        KeySignature.FSharp,
        KeySignature.CSharp
    ];

    it('diatonic notes require no accidental in each key signature', () => {
        for (const ks of allKeySignatures) {
            for (let degree = 0; degree < 7; degree++) {
                const noteValue = noteValueForDegree(ks, degree, 4);
                const spelling = ModelUtils.resolveSpelling(ks, noteValue, NoteAccidentalMode.Default);
                expect(spelling.degree, `ks=${ks} degree=${degree}`).to.equal(degree);
                expect(spelling.accidentalOffset, `ks=${ks} degree=${degree}`).to.equal(
                    ModelUtils.getKeySignatureAccidentalOffset(ks, degree)
                );

                const accidental = ModelUtils.computeAccidentalForSpelling(
                    ks,
                    NoteAccidentalMode.Default,
                    spelling,
                    false,
                    null
                );
                expect(accidental, `ks=${ks} degree=${degree}`).to.equal(AccidentalType.None);
            }
        }
    });

    it('spells E# in F# major for pitch F natural', () => {
        const ks = KeySignature.FSharp;
        const noteValue = 65; // F natural
        const spelling = ModelUtils.resolveSpelling(ks, noteValue, NoteAccidentalMode.Default);
        expect(spelling.degree).to.equal(2); // E
        expect(spelling.accidentalOffset).to.equal(1); // E#
        const accidental = ModelUtils.computeAccidentalForSpelling(ks, NoteAccidentalMode.Default, spelling, false, null);
        expect(accidental).to.equal(AccidentalType.None);
    });

    it('spells Cb in Cb major for pitch B natural', () => {
        const ks = KeySignature.Cb;
        const noteValue = 59; // B natural
        const spelling = ModelUtils.resolveSpelling(ks, noteValue, NoteAccidentalMode.Default);
        expect(spelling.degree).to.equal(0); // C
        expect(spelling.accidentalOffset).to.equal(-1); // Cb
        const accidental = ModelUtils.computeAccidentalForSpelling(ks, NoteAccidentalMode.Default, spelling, false, null);
        expect(accidental).to.equal(AccidentalType.None);
    });

    it('forces flat spelling preference when requested', () => {
        const ks = KeySignature.C;
        const noteValue = 61; // C# / Db
        const spelling = ModelUtils.resolveSpelling(ks, noteValue, NoteAccidentalMode.ForceFlat);
        expect(spelling.degree).to.equal(1); // D
        expect(spelling.accidentalOffset).to.equal(-1); // Db
        const accidental = ModelUtils.computeAccidentalForSpelling(ks, NoteAccidentalMode.ForceFlat, spelling, false, null);
        expect(accidental).to.equal(AccidentalType.Flat);
    });

    it('forces sharp spelling preference when requested', () => {
        const ks = KeySignature.C;
        const noteValue = 61; // C# / Db
        const spelling = ModelUtils.resolveSpelling(ks, noteValue, NoteAccidentalMode.ForceSharp);
        expect(spelling.degree).to.equal(0); // C
        expect(spelling.accidentalOffset).to.equal(1); // C#
        const accidental = ModelUtils.computeAccidentalForSpelling(ks, NoteAccidentalMode.ForceSharp, spelling, false, null);
        expect(accidental).to.equal(AccidentalType.Sharp);
    });

    it('force natural displays a natural accidental when key signature would otherwise apply one', () => {
        const ks = KeySignature.D; // F#, C#
        const noteValue = 65; // F natural
        const spelling = ModelUtils.resolveSpelling(ks, noteValue, NoteAccidentalMode.ForceNatural);
        expect(spelling.degree).to.equal(3); // F
        expect(spelling.accidentalOffset).to.equal(0); // natural
        const accidental = ModelUtils.computeAccidentalForSpelling(ks, NoteAccidentalMode.ForceNatural, spelling, false, null);
        expect(accidental).to.equal(AccidentalType.Natural);
    });

    it('force none suppresses accidentals regardless of spelling', () => {
        const ks = KeySignature.C;
        const noteValue = 61; // C#
        const spelling = ModelUtils.resolveSpelling(ks, noteValue, NoteAccidentalMode.ForceNone);
        const accidental = ModelUtils.computeAccidentalForSpelling(ks, NoteAccidentalMode.ForceNone, spelling, false, null);
        expect(accidental).to.equal(AccidentalType.None);
    });

    it('no accidental when current accidental already matches', () => {
        const ks = KeySignature.C;
        const noteValue = 61; // C#
        const spelling = ModelUtils.resolveSpelling(ks, noteValue, NoteAccidentalMode.Default);
        const accidental = ModelUtils.computeAccidentalForSpelling(ks, NoteAccidentalMode.Default, spelling, false, 1);
        expect(accidental).to.equal(AccidentalType.None);
    });

    it('quarter tone accidentals are chosen when quarter bend is true', () => {
        const ks = KeySignature.C;
        const noteValue = 61; // C# -> requires sharp
        const spelling = ModelUtils.resolveSpelling(ks, noteValue, NoteAccidentalMode.Default);
        const accidental = ModelUtils.computeAccidentalForSpelling(ks, NoteAccidentalMode.Default, spelling, true, null);
        expect(accidental).to.equal(AccidentalType.SharpQuarterNoteUp);
    });
});