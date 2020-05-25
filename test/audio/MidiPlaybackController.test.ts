import { MidiPlaybackController } from '@src/midi/MidiPlaybackController';
import { AlphaTexImporter } from '@src/importer/AlphaTexImporter';
import { Score } from '@src/model/Score';
import { Settings } from '@src/Settings';
import { Logger } from '@src/Logger';
import { GpImporterTestHelper } from '@test/importer/GpImporterTestHelper';
import { TestPlatform } from '@test/TestPlatform';

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

    it('repeat-with-alphaTex', () => {
        let tex: string =
            '\\ro 1.3 2.3 3.3 4.3 | 5.3 6.3 7.3 8.3 | \\rc 2 1.3 2.3 3.3 4.3 | \\ro \\rc 3 1.3 2.3 3.3 4.3';
        let importer: AlphaTexImporter = new AlphaTexImporter();
        importer.init(TestPlatform.createStringReader(tex), new Settings());
        let score: Score = importer.readScore();
        let playedBars: number[] = [];
        let controller: MidiPlaybackController = new MidiPlaybackController(score);
        while (!controller.finished) {
            let index: number = controller.index;
            playedBars.push(index);
            controller.processCurrent();
            controller.moveNext();
            if (playedBars.length > 50) {
                fail('Too many bars generated');
            }
        }
        let expectedBars: number[] = [0, 1, 2, 0, 1, 2, 3, 3, 3];

        expect(playedBars.join(',')).toEqual(expectedBars.join(','));
    });
});
