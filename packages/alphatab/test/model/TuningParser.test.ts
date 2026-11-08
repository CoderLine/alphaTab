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

    describe('pitches', () => {
        function createTuning(): Tuning {
            const tuning = new Tuning();
            tuning.pitches = [
                new SpelledPitch(1, 1, 4),
                new SpelledPitch(6, -1, 3),
                new SpelledPitch(3, 1, 3),
                new SpelledPitch(0, 1, 3),
                new SpelledPitch(5, -1, 2),
                new SpelledPitch(2, -1, 2)
            ];
            return tuning;
        }

        it('tunings-from-pitches', () => {
            const tuning = createTuning();
            expect(tuning.tunings).toEqual([63, 58, 54, 49, 44, 39]);
            expect(tuning.pitches.map(p => p.toString())).toEqual(['D#4', 'Bb3', 'F#3', 'C#3', 'Ab2', 'Eb2']);
        });

        it('tunings-spelled-with-flats', () => {
            const tuning = createTuning();
            tuning.tunings = [64, 61, 54, 49, 44, 40];
            expect(tuning.tunings).toEqual([64, 61, 54, 49, 44, 40]);
            expect(tuning.pitches.map(p => p.toString())).toEqual(['E4', 'Db4', 'Gb3', 'Db3', 'Ab2', 'E2']);
        });

        it('constructor-spelled-with-flats', () => {
            const tuning = new Tuning('Test', [63, 58]);
            expect(tuning.pitches.map(p => p.toString())).toEqual(['Eb4', 'Bb3']);
        });

        it('reset-clears-strings', () => {
            const tuning = createTuning();
            tuning.reset();
            expect(tuning.tunings).toHaveLength(0);
            expect(tuning.pitches).toHaveLength(0);
        });

        it('presets-are-copies', () => {
            const tuning = Tuning.getDefaultTuningFor(6)!;
            tuning.pitches = [new SpelledPitch(1, 1, 4)];
            expect(Tuning.getDefaultTuningFor(6)!.tunings).toEqual([64, 59, 55, 50, 45, 40]);
            expect(Tuning.findTuning([64, 59, 55, 50, 45, 40])!.pitches).toHaveLength(6);
        });
    });
});
