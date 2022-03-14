import { MidiPlaybackController } from '@src/midi/MidiPlaybackController';
import { AlphaTexImporter } from '@src/importer/AlphaTexImporter';
import { Score } from '@src/model/Score';
import { Settings } from '@src/Settings';
import { Logger } from '@src/Logger';
import { GpImporterTestHelper } from '@test/importer/GpImporterTestHelper';

describe('MidiPlaybackControllerTest', () => {
    const testRepeat: ((score: Score, expectedIndexes: number[]) => void) = (score: Score, expectedIndexes: number[]): void => {
        let controller: MidiPlaybackController = new MidiPlaybackController(score);
        let i: number = 0;
        while (!controller.finished) {
            let index: number = controller.index;
            controller.processCurrent();
            if (controller.shouldPlay) {
                Logger.debug('Test', `Checking index ${i}, expected[${expectedIndexes[i]}]`, i, expectedIndexes[i]);
                expect(index).toEqual(expectedIndexes[i]);
                i++;
            }
            controller.moveNext();
        }
        expect(i).toEqual(expectedIndexes.length);
        expect(controller.finished).toBe(true);
    };

    it('repeat-close', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('audio/repeat-close.gp5');
        let score: Score = reader.readScore();
        let expectedIndexes = [0, 1, 0, 1, 2];
        testRepeat(score, expectedIndexes);
    });

    it('repeat-close-multi', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('audio/repeat-close-multi.gp5');
        let score: Score = reader.readScore();
        let expectedIndexes = [0, 1, 0, 1, 0, 1, 0, 1, 2];
        testRepeat(score, expectedIndexes);
    });

    it('repeat-close-without-start-at-beginning', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile(
            'audio/repeat-close-without-start-at-beginning.gp5'
        );
        let score: Score = reader.readScore();
        let expectedIndexes = [0, 1, 0, 1];
        testRepeat(score, expectedIndexes);
    });

    it('repeat-close-alternate-endings', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile(
            'audio/repeat-close-alternate-endings.gp5'
        );
        let score: Score = reader.readScore();
        let expectedIndexes = [0, 1, 0, 2, 3, 0, 1, 0, 4];
        testRepeat(score, expectedIndexes);
    });

    const testAlphaTexRepeat: ((tex: string, expectedBars: number[], maxBars: number) => void) = (tex: string, expectedBars: number[], maxBars: number): void => {
        let importer: AlphaTexImporter = new AlphaTexImporter();
        importer.initFromString(tex, new Settings());
        let score: Score = importer.readScore();
        let playedBars: number[] = [];
        let controller: MidiPlaybackController = new MidiPlaybackController(score);
        while (!controller.finished) {
            let index: number = controller.index;
            controller.processCurrent();
            if (controller.shouldPlay) {
                playedBars.push(index);
            }
            controller.moveNext();
            if (playedBars.length > maxBars) {
                fail('Too many bars generated');
            }
        }
        expect(playedBars.join(',')).toEqual(expectedBars.join(','));
    }

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
});
