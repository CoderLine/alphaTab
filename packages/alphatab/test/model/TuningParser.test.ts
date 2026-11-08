import { describe, expect, it } from 'vitest';
import { Tuning } from '@coderline/alphatab/model/Tuning';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import { SpelledPitch } from '@coderline/alphatab/model/SpelledPitch';
describe('TuningParserTest', () => {
    it('standard', () => {
        const standard: Tuning = Tuning.getDefaultTuningFor(6)!;
        const tuningText: string[] = ['E4', 'B3', 'G3', 'D3', 'A2', 'E2'];
        const tuning = new Array<number>(tuningText.length);
        const tuningText2: string[] = new Array<string>(tuningText.length);
        for (let i: number = 0; i < tuningText.length; i++) {
            tuning[i] = ModelUtils.parsePitch(tuningText[i])!.pitch.value;
            tuningText2[i] = Tuning.getTextForTuning(tuning[i], true);
        }
        expect(tuning.join(',')).toBe(standard.tunings.join(','));
        expect(tuningText2.join(',')).toBe(tuningText.join(','));
    });

    describe('getSpelling', () => {
        function createTuning(): Tuning {
            const tuning = new Tuning('', [63, 58, 54, 49, 44, 39]);
            tuning.spellings = [
                new SpelledPitch(1, 1, 4),
                new SpelledPitch(6, -1, 3),
                new SpelledPitch(3, 1, 3),
                new SpelledPitch(0, 1, 3),
                new SpelledPitch(5, -1, 2),
                new SpelledPitch(2, -1, 2)
            ];
            return tuning;
        }

        it('uses-stored-spelling', () => {
            const tuning = createTuning();
            expect(tuning.tunings.map((_, i) => tuning.getSpelling(i).toString())).toEqual([
                'D#4',
                'Bb3',
                'F#3',
                'C#3',
                'Ab2',
                'Eb2'
            ]);
        });

        it('falls-back-without-spellings', () => {
            const tuning = createTuning();
            tuning.spellings = null;
            expect(tuning.tunings.map((_, i) => tuning.getSpelling(i).toString())).toEqual([
                'Eb4',
                'Bb3',
                'Gb3',
                'Db3',
                'Ab2',
                'Eb2'
            ]);
        });

        it('falls-back-on-changed-tuning-value', () => {
            const tuning = createTuning();
            tuning.tunings[2] = 55;
            expect(tuning.getSpelling(2).toString()).toBe('G3');
            expect(tuning.getSpelling(3).toString()).toBe('C#3');
        });

        it('falls-back-on-missing-entries', () => {
            const tuning = createTuning();
            tuning.spellings = tuning.spellings!.slice(0, 2);
            expect(tuning.getSpelling(1).toString()).toBe('Bb3');
            expect(tuning.getSpelling(2).toString()).toBe('Gb3');
        });

        it('reset-clears-spellings', () => {
            const tuning = createTuning();
            tuning.reset();
            expect(tuning.spellings).toBeNull();
        });
    });
});
