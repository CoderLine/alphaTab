import { MidiPlaybackController } from '@src/midi/MidiPlaybackController';
import { AlphaTexImporter } from '@src/importer/AlphaTexImporter';
import { Score } from '@src/model/Score';
import { Settings } from '@src/Settings';
import { Logger } from '@src/Logger';
import { GpImporterTestHelper } from '@test/importer/GpImporterTestHelper';

describe('MidiPlaybackControllerTest', () => {
    const testRepeat: ((score: Score, expectedIndexes: number[], maxBars: number) => void) = (score: Score, expectedIndexes: number[], maxBars: number): void => {
        let controller: MidiPlaybackController = new MidiPlaybackController(score);
        let i: number = 0;
        let errors:number[] = [];
        let actual:number[] = [];
        while (!controller.finished) {
            let index: number = controller.index;
            controller.processCurrent();
            if (controller.shouldPlay) {
                if (i > maxBars) {
                    fail('Too many bars generated');
                }
                Logger.debug('Test', `Checking index ${i}, expected[${expectedIndexes[i]}]`, i, expectedIndexes[i]);
                if(index !== expectedIndexes[i]) {
                    errors.push(i);
                }
                actual.push(index);
                expect(index).toEqual(expectedIndexes[i]);
                i++;
            }
            controller.moveNext();
        }
        if(errors.length > 0) {
            fail(`Sequence errors: ${errors.join(', ')}, Expected: [${expectedIndexes.join(', ')}], Actual: [${actual.join(', ')}]`)
        }
        expect(i).toEqual(expectedIndexes.length);
        expect(controller.finished).toBe(true);
    };

    const testGuitarProRepeat: ((file: string, expectedBars: number[], maxBars: number) => Promise<void>) = async (file: string, expectedBars: number[], maxBars: number): Promise<void> => {
        let reader = await GpImporterTestHelper.prepareImporterWithFile(file);
        let score: Score = reader.readScore();
        testRepeat(score, expectedBars, maxBars);
    }

    const testAlphaTexRepeat: ((tex: string, expectedBars: number[], maxBars: number) => void) = (tex: string, expectedBars: number[], maxBars: number): void => {
        let importer: AlphaTexImporter = new AlphaTexImporter();
        importer.initFromString(tex, new Settings());
        let score: Score = importer.readScore();
        testRepeat(score, expectedBars, maxBars);
    }

    it('repeat-close', async () => {
        let file = 'audio/repeat-close.gp5';
        let expectedIndexes = [0, 1, 0, 1, 2];
        await testGuitarProRepeat(file, expectedIndexes, 20);
    });

    it('repeat-close-multi', async () => {
        let file = 'audio/repeat-close-multi.gp5';
        let expectedIndexes = [0, 1, 0, 1, 0, 1, 0, 1, 2];
        await testGuitarProRepeat(file, expectedIndexes, 20);
    });

    it('repeat-close-without-start-at-beginning', async () => {
        let file = 'audio/repeat-close-without-start-at-beginning.gp5';
        let expectedIndexes = [0, 1, 0, 1];
        await testGuitarProRepeat(file, expectedIndexes, 20);
    });

    it('repeat-close-alternate-endings', async () => {
        let file = 'audio/repeat-close-alternate-endings.gp5';
        let expectedIndexes = [0, 1, 0, 2, 3, 0, 1, 0, 4];
        await testGuitarProRepeat(file, expectedIndexes, 20);
    });

    it('repeat-with-alphaTex', () => {
        let tex: string =
            '\\ro 1.3 2.3 3.3 4.3 | 5.3 6.3 7.3 8.3 | \\rc 2 1.3 2.3 3.3 4.3 | \\ro \\rc 3 1.3 2.3 3.3 4.3';
        let expectedBars: number[] = [0, 1, 2, 0, 1, 2, 3, 3, 3];
        testAlphaTexRepeat(tex, expectedBars, 50);
    });

    it('alternate-endings-with-alphaTex', () => {
        let tex: string = `
            \\ro \\ae 1 1.1.1 | \\ae 2 2.1 | \\ae 3 3.1 |
            4.3.4*4 |
            \\ae 1 1.1.1 | \\ae 2 2.1 | \\ae 3 3.1 |
            4.3.4*4 |
            \\ae (1 3) 1.1.1 | \\ae 2 \\rc 3 2.1
        `;
        let expectedBars: number[] = [
            0, 4, 8, // First round: 1st, 5th and 9th bar which have the ending for 1.
            1, 5, 9, // Second round: 2nd, 6th and 10th bar which have the ending for 2.
            2, 3, 6, 7, 8 // Third round: 3rd, 4th, 7th, 8th and 9th which have the ending for 3.
                            // 4th and 8th bar don't have the ending explicitly
                            // but extended from the previous bar.
        ];
        testAlphaTexRepeat(tex, expectedBars, 50);
    });

    it('multiple-closes', () => {
        let tex: string = `
            .
            4.3.4*4 | \\ro 4.3.4*4 | \\rc 2 4.3.4*4 | 4.3.4*4 | 4.3.4*4 | \\rc 2 4.3.4*4 | 4.3.4*4 | 
            \\ro 4.3.4*4 | \\rc 2 4.3.4*4 | 4.3.4*4 | 4.3.4*4 
        `;
        let expectedBars: number[] = [
            0, // no repeat
            // First round of outer repeat
            1, 2, // First round of inner repeat
            1, 2, // Second round of inner repeat
            3, 4, 5,
            // Second round of outer repeat
            1, 2, // First round of inner repeat
            1, 2, // Second round of inner repeat
            3, 4, 5,
            6,
            // next repeat
            7, 8,
            7, 8,
            // Second repeat done
            9, 10 // last two bars
        ];
        testAlphaTexRepeat(tex, expectedBars, 50);
    });

    it('nested-repeats', () => {
        let tex: string = `
            .
            \\ro 4.3.4*4 | \\ro 4.3.4*4 | \\rc 2 4.3.4*4  | 4.3.4*4 | \\rc 2 4.3.4*4 |
            3.3.4*4 |
            \\ro 4.3.4*4 | \\ro 4.3.4*4 | \\rc 2 4.3.4*4  | 4.3.4*4 | \\rc 2 4.3.4*4 
        `;
        let expectedBars: number[] = [
            0, 1, 2, 1, 2, 3, 4, 
            0, 1, 2, 1, 2, 3, 4, 
            5,
            6, 7, 8, 7, 8, 9, 10, 
            6, 7, 8, 7, 8, 9, 10
        ];
        testAlphaTexRepeat(tex, expectedBars, 50);
    });
});
