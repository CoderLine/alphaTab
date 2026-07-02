import { describe, expect, it } from 'vitest';
import { Tuning } from '@coderline/alphatab/model/Tuning';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
describe('TuningParserTest', () => {
    it('standard', () => {
        const standard: Tuning = Tuning.getDefaultTuningFor(6)!;
        const tuningText: string[] = ['E4', 'B3', 'G3', 'D3', 'A2', 'E2'];
        const tuning = new Array<number>(tuningText.length);
        const tuningText2: string[] = new Array<string>(tuningText.length);
        for (let i: number = 0; i < tuningText.length; i++) {
            tuning[i] = ModelUtils.getTuningForText(tuningText[i]);
            tuningText2[i] = Tuning.getTextForTuning(tuning[i], true);
        }
        expect(tuning.join(',')).toBe(standard.tunings.join(','));
        expect(tuningText2.join(',')).toBe(tuningText.join(','));
    });
});
