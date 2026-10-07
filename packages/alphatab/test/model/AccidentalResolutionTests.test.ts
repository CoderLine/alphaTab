import { describe, expect, it } from 'vitest';
import { AccidentalType } from '@coderline/alphatab/model/AccidentalType';
import { KeySignature } from '@coderline/alphatab/model/KeySignature';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import { NoteAccidentalMode } from '@coderline/alphatab/model/NoteAccidentalMode';
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
                expect(spelling.degree, `ks=${ks} degree=${degree}`).toBe(degree);
                expect(spelling.accidentalOffset, `ks=${ks} degree=${degree}`).toBe(
                    ModelUtils.getKeySignatureAccidentalOffset(ks, degree)
                );

                const accidental = ModelUtils.computeAccidentalForSpelling(
                    ks,
                    NoteAccidentalMode.Default,
                    spelling,
                    false,
                    null
                );
                expect(accidental, `ks=${ks} degree=${degree}`).toBe(AccidentalType.None);
            }
        }
    });

    it('spells E# in F# major for pitch F natural', () => {
        const ks = KeySignature.FSharp;
        const noteValue = 65; // F natural
        const spelling = ModelUtils.resolveSpelling(ks, noteValue, NoteAccidentalMode.Default);
        expect(spelling.degree).toBe(2); // E
        expect(spelling.accidentalOffset).toBe(1); // E#
        const accidental = ModelUtils.computeAccidentalForSpelling(ks, NoteAccidentalMode.Default, spelling, false, null);
        expect(accidental).toBe(AccidentalType.None);
    });

    it('spells Cb in Cb major for pitch B natural', () => {
        const ks = KeySignature.Cb;
        const noteValue = 59; // B natural
        const spelling = ModelUtils.resolveSpelling(ks, noteValue, NoteAccidentalMode.Default);
        expect(spelling.degree).toBe(0); // C
        expect(spelling.accidentalOffset).toBe(-1); // Cb
        const accidental = ModelUtils.computeAccidentalForSpelling(ks, NoteAccidentalMode.Default, spelling, false, null);
        expect(accidental).toBe(AccidentalType.None);
    });

    it('forces flat spelling preference when requested', () => {
        const ks = KeySignature.C;
        const noteValue = 61; // C# / Db
        const spelling = ModelUtils.resolveSpelling(ks, noteValue, NoteAccidentalMode.ForceFlat);
        expect(spelling.degree).toBe(1); // D
        expect(spelling.accidentalOffset).toBe(-1); // Db
        const accidental = ModelUtils.computeAccidentalForSpelling(ks, NoteAccidentalMode.ForceFlat, spelling, false, null);
        expect(accidental).toBe(AccidentalType.Flat);
    });

    it('forces sharp spelling preference when requested', () => {
        const ks = KeySignature.C;
        const noteValue = 61; // C# / Db
        const spelling = ModelUtils.resolveSpelling(ks, noteValue, NoteAccidentalMode.ForceSharp);
        expect(spelling.degree).toBe(0); // C
        expect(spelling.accidentalOffset).toBe(1); // C#
        const accidental = ModelUtils.computeAccidentalForSpelling(ks, NoteAccidentalMode.ForceSharp, spelling, false, null);
        expect(accidental).toBe(AccidentalType.Sharp);
    });

    it('force natural displays a natural accidental when key signature would otherwise apply one', () => {
        const ks = KeySignature.D; // F#, C#
        const noteValue = 65; // F natural
        const spelling = ModelUtils.resolveSpelling(ks, noteValue, NoteAccidentalMode.ForceNatural);
        expect(spelling.degree).toBe(3); // F
        expect(spelling.accidentalOffset).toBe(0); // natural
        const accidental = ModelUtils.computeAccidentalForSpelling(ks, NoteAccidentalMode.ForceNatural, spelling, false, null);
        expect(accidental).toBe(AccidentalType.Natural);
    });

    it('force none suppresses accidentals regardless of spelling', () => {
        const ks = KeySignature.C;
        const noteValue = 61; // C#
        const spelling = ModelUtils.resolveSpelling(ks, noteValue, NoteAccidentalMode.ForceNone);
        const accidental = ModelUtils.computeAccidentalForSpelling(ks, NoteAccidentalMode.ForceNone, spelling, false, null);
        expect(accidental).toBe(AccidentalType.None);
    });

    it('no accidental when current accidental already matches', () => {
        const ks = KeySignature.C;
        const noteValue = 61; // C#
        const spelling = ModelUtils.resolveSpelling(ks, noteValue, NoteAccidentalMode.Default);
        const accidental = ModelUtils.computeAccidentalForSpelling(ks, NoteAccidentalMode.Default, spelling, false, 1);
        expect(accidental).toBe(AccidentalType.None);
    });

    it('quarter tone accidentals are chosen when quarter bend is true', () => {
        const ks = KeySignature.C;
        const noteValue = 61; // C# -> requires sharp
        const spelling = ModelUtils.resolveSpelling(ks, noteValue, NoteAccidentalMode.Default);
        const accidental = ModelUtils.computeAccidentalForSpelling(ks, NoteAccidentalMode.Default, spelling, true, null);
        expect(accidental).toBe(AccidentalType.SharpQuarterNoteUp);
    });

    it('forced modes keep every written spelling', () => {
        // index: accidental offset + 2
        const modes = [
            NoteAccidentalMode.ForceDoubleFlat,
            NoteAccidentalMode.ForceFlat,
            NoteAccidentalMode.ForceNatural,
            NoteAccidentalMode.ForceSharp,
            NoteAccidentalMode.ForceDoubleSharp
        ];
        for (const ks of allKeySignatures) {
            for (let degree = 0; degree < 7; degree++) {
                for (let offset = -2; offset <= 2; offset++) {
                    for (let octave = 0; octave < 9; octave++) {
                        const noteValue = (octave + 1) * 12 + degreeSemitones[degree] + offset;
                        const spelling = ModelUtils.resolveSpelling(ks, noteValue, modes[offset + 2]);
                        const context = `ks=${ks} degree=${degree} offset=${offset} octave=${octave}`;
                        expect(spelling.degree, context).toBe(degree);
                        expect(spelling.accidentalOffset, context).toBe(offset);
                        expect(spelling.octave, context).toBe(octave);
                    }
                }
            }
        }
    });

    it('simplify keeps only spelling hints which change the spelling', () => {
        // F# in F major: default spelling is Gb
        expect(ModelUtils.simplifyAccidentalMode(KeySignature.F, 66, NoteAccidentalMode.ForceSharp)).toBe(
            NoteAccidentalMode.ForceSharp
        );
        // Bb in F major: default spelling is Bb
        expect(ModelUtils.simplifyAccidentalMode(KeySignature.F, 70, NoteAccidentalMode.ForceFlat)).toBe(
            NoteAccidentalMode.Default
        );
        // B natural in Gb major: default spelling is Cb
        expect(ModelUtils.simplifyAccidentalMode(KeySignature.Gb, 71, NoteAccidentalMode.ForceNatural)).toBe(
            NoteAccidentalMode.ForceNatural
        );
        // C natural in C major
        expect(ModelUtils.simplifyAccidentalMode(KeySignature.C, 60, NoteAccidentalMode.ForceNatural)).toBe(
            NoteAccidentalMode.Default
        );
        // G with a sharp hint has no sharp spelling, the default spelling is used anyhow
        expect(ModelUtils.simplifyAccidentalMode(KeySignature.C, 67, NoteAccidentalMode.ForceSharp)).toBe(
            NoteAccidentalMode.Default
        );
        // ForceNone affects the accidental, not the spelling
        expect(ModelUtils.simplifyAccidentalMode(KeySignature.C, 61, NoteAccidentalMode.ForceNone)).toBe(
            NoteAccidentalMode.ForceNone
        );
        expect(ModelUtils.simplifyAccidentalMode(KeySignature.C, 61, NoteAccidentalMode.Default)).toBe(
            NoteAccidentalMode.Default
        );
    });
});