import { Tuning } from '@src/model/Tuning';
import { ModelUtils } from '@src/model/ModelUtils';

describe('TuningParserTest', () => {
    it('standard', () => {
        let standard: Tuning = Tuning.getDefaultTuningFor(6)!;
        let tuningText: string[] = ['E4', 'B3', 'G3', 'D3', 'A2', 'E2'];
        let tuning = new Array<number>(tuningText.length);
        let tuningText2: string[] = new Array<string>(tuningText.length);
        for (let i: number = 0; i < tuningText.length; i++) {
            tuning[i] = ModelUtils.getTuningForText(tuningText[i]);
            tuningText2[i] = Tuning.getTextForTuning(tuning[i], true);
        }
        expect(tuning.join(',')).toEqual(standard.tunings.join(','));
        expect(tuningText2.join(',')).toEqual(tuningText.join(','));
    });
});
