import { ScoreLoader } from '@src/importer/ScoreLoader';
import { ModelUtils } from '@src/model/ModelUtils';
import { NoteAccidentalMode } from '@src/model/NoteAccidentalMode';
import { expect } from 'chai';

describe('ModelUtilsTests', () => {
    function trimTest(tex: string, expectedBars: number) {
        const score = ScoreLoader.loadAlphaTex(tex);
        expect(score.masterBars.length).to.equal(expectedBars);
    }

    it('trimEmptyBarsAtEndFullyEmpty', () => {
        trimTest('. | | | | | ', 1);
    });

    it('trimEmptyBarsAtEndSomeSet', () => {
        trimTest('C4 | C4 | C4 | | | ', 3);
    });

    it('trimEmptyBarsAtEndMultiTrackMixed', () => {
        trimTest(
            `
            \\track "T1"
            C4 | C4 | C4 | C4 | | | |
            \\track "T2"
            C4 | C4 | C4 | C4 | C4 | | |
        `,
            5
        );
    });

    it('trimEmptyBarsAtEndNonContentChange', () => {
        trimTest(
            `
            C4 | C4 | \\tempo 80 | \\ts 3 4 | | | |
        `,
            4
        );
    });

    describe('parseTuning', () => {
        function test(s:string, toneValue:number, accidental:NoteAccidentalMode, octave:number) {
            const result = ModelUtils.parseTuning(s);
            expect(result).to.be.ok;
            expect(result!.tone.noteValue).to.equal(toneValue);
            expect(result!.tone.accidentalMode).to.equal(accidental);
            expect(result!.octave).to.equal(octave);
        }

        it('octave-c', () => test('C4', 0, NoteAccidentalMode.Default, 5))
        it('octave-d', () => test('D4', 2, NoteAccidentalMode.Default, 5))
        it('octave-e', () => test('E4', 4, NoteAccidentalMode.Default, 5))
        it('octave-f', () => test('F4', 5, NoteAccidentalMode.Default, 5))
        it('octave-g', () => test('G4', 7, NoteAccidentalMode.Default, 5))
        it('octave-a', () => test('A4', 9, NoteAccidentalMode.Default, 5))
        it('octave-b', () => test('B4', 11, NoteAccidentalMode.Default, 5))

        it('c-forceNone-long', () => test('CforceNone4', 0, NoteAccidentalMode.ForceNone, 5))
        it('c-forceNatural-long', () => test('CforceNatural4', 0, NoteAccidentalMode.ForceNatural, 5))
        it('c-forceSharp-long', () => test('CforceSharp4', 1, NoteAccidentalMode.ForceSharp, 5))
        it('c-forceDoubleSharp-long', () => test('CforceDoubleSharp4', 2, NoteAccidentalMode.ForceDoubleSharp, 5))
        it('c-forceFlat-long', () => test('CforceFlat4', 11, NoteAccidentalMode.ForceFlat, 4))
        it('c-forceDoubleFlat-long', () => test('CforceDoubleFlat4', 10, NoteAccidentalMode.ForceDoubleFlat, 4))

        it('d-forceNone-long', () => test('DforceNone4', 2, NoteAccidentalMode.ForceNone, 5))
        it('d-forceNatural-long', () => test('DforceNatural4', 2, NoteAccidentalMode.ForceNatural, 5))
        it('d-forceSharp-long', () => test('DforceSharp4', 3, NoteAccidentalMode.ForceSharp, 5))
        it('d-forceDoubleSharp-long', () => test('DforceDoubleSharp4', 4, NoteAccidentalMode.ForceDoubleSharp, 5))
        it('d-forceFlat-long', () => test('DforceFlat4', 1, NoteAccidentalMode.ForceFlat, 5))
        it('d-forceDoubleFlat-long', () => test('DforceDoubleFlat4', 0, NoteAccidentalMode.ForceDoubleFlat, 5))


        it('c-forceNone-short', () => test('C-4', 0, NoteAccidentalMode.ForceNone, 5))
        it('c-forceNatural-short', () => test('Cn4', 0, NoteAccidentalMode.ForceNatural, 5))
        it('c-forceSharp-short', () => test('C#4', 1, NoteAccidentalMode.ForceSharp, 5))
        it('c-forceDoubleSharp-short1', () => test('C##4', 2, NoteAccidentalMode.ForceDoubleSharp, 5))
        it('c-forceDoubleSharp-short2', () => test('Cx4', 2, NoteAccidentalMode.ForceDoubleSharp, 5))
        it('c-forceFlat-short', () => test('Cb4', 11, NoteAccidentalMode.ForceFlat, 4))
        it('c-forceDoubleFlat-short', () => test('Cbb4', 10, NoteAccidentalMode.ForceDoubleFlat, 4))
    });
});
