import { MidiPlaybackController } from '@src/midi/MidiPlaybackController';
import { AlphaTexImporter } from '@src/importer/AlphaTexImporter';
import type { Score } from '@src/model/Score';
import { Settings } from '@src/Settings';
import { Logger } from '@src/Logger';
import { GpImporterTestHelper } from '@test/importer/GpImporterTestHelper';
import { assert, expect } from 'chai';

describe('MidiPlaybackControllerTest', () => {
    function testRepeat(score: Score, expectedIndexes: number[], maxBars: number): void {
        const controller: MidiPlaybackController = new MidiPlaybackController(score);
        let i: number = 0;
        const errors: number[] = [];
        const actual: number[] = [];
        while (!controller.finished) {
            const index: number = controller.index;
            controller.processCurrent();
            if (controller.shouldPlay) {
                if (i > maxBars) {
                    assert.fail('Too many bars generated');
                }
                Logger.debug('Test', `Checking index ${i}, expected[${expectedIndexes[i]}]`, i, expectedIndexes[i]);
                if (index !== expectedIndexes[i]) {
                    errors.push(i);
                }
                actual.push(index);
                i++;
            }
            controller.moveNext();
        }
        if (errors.length > 0) {
            assert.fail(
                `Sequence errors: ${errors.join(', ')}, Expected: [${expectedIndexes.join(
                    ', '
                )}], Actual: [${actual.join(', ')}]`
            );
        }
        expect(i).to.equal(expectedIndexes.length);
        expect(controller.finished).to.be.equal(true);
    }

    async function testGuitarProRepeat(file: string, expectedBars: number[], maxBars: number): Promise<void> {
        const reader = await GpImporterTestHelper.prepareImporterWithFile(file);
        const score: Score = reader.readScore();
        testRepeat(score, expectedBars, maxBars);
    }

    function testAlphaTexRepeat(tex: string, expectedBars: number[], maxBars: number): void {
        const importer: AlphaTexImporter = new AlphaTexImporter();
        importer.initFromString(tex, new Settings());
        const score: Score = importer.readScore();
        testRepeat(score, expectedBars, maxBars);
    }

    it('repeat-close', async () => {
        const file = 'audio/repeat-close.gp5';
        const expectedIndexes = [0, 1, 0, 1, 2];
        await testGuitarProRepeat(file, expectedIndexes, 20);
    });

    it('repeat-close-multi', async () => {
        const file = 'audio/repeat-close-multi.gp5';
        const expectedIndexes = [0, 1, 0, 1, 0, 1, 0, 1, 2];
        await testGuitarProRepeat(file, expectedIndexes, 20);
    });

    it('repeat-close-without-start-at-beginning', async () => {
        const file = 'audio/repeat-close-without-start-at-beginning.gp5';
        const expectedIndexes = [0, 1, 0, 1];
        await testGuitarProRepeat(file, expectedIndexes, 20);
    });

    it('repeat-close-alternate-endings', async () => {
        const file = 'audio/repeat-close-alternate-endings.gp5';
        const expectedIndexes = [0, 1, 0, 2, 3, 0, 1, 0, 4];
        await testGuitarProRepeat(file, expectedIndexes, 20);
    });

    it('repeat-with-alphaTex', () => {
        const tex: string =
            '\\ro 1.3 2.3 3.3 4.3 | 5.3 6.3 7.3 8.3 | \\rc 2 1.3 2.3 3.3 4.3 | \\ro \\rc 3 1.3 2.3 3.3 4.3';
        const expectedBars: number[] = [0, 1, 2, 0, 1, 2, 3, 3, 3];
        testAlphaTexRepeat(tex, expectedBars, 50);
    });

    it('alternate-endings-with-alphaTex', () => {
        const tex: string = `
            \\ro \\ae 1 1.1.1 | \\ae 2 2.1 | \\ae 3 3.1 |
            4.3.4*4 |
            \\ae 1 1.1.1 | \\ae 2 2.1 | \\ae 3 3.1 |
            4.3.4*4 |
            \\ae (1 3) 1.1.1 | \\ae 2 \\rc 3 2.1
        `;
        const expectedBars: number[] = [
            0,
            4,
            8, // First round: 1st, 5th and 9th bar which have the ending for 1.
            1,
            5,
            9, // Second round: 2nd, 6th and 10th bar which have the ending for 2.
            2,
            3,
            6,
            7,
            8 // Third round: 3rd, 4th, 7th, 8th and 9th which have the ending for 3.
            // 4th and 8th bar don't have the ending explicitly
            // but extended from the previous bar.
        ];
        testAlphaTexRepeat(tex, expectedBars, 50);
    });

    it('multiple-closes', () => {
        const tex: string = `
            .
            4.3.4*4 | \\ro 4.3.4*4 | \\rc 2 4.3.4*4 | 4.3.4*4 | 4.3.4*4 | \\rc 2 4.3.4*4 | 4.3.4*4 | 
            \\ro 4.3.4*4 | \\rc 2 4.3.4*4 | 4.3.4*4 | 4.3.4*4 
        `;
        const expectedBars: number[] = [
            0, // no repeat
            // First round of outer repeat
            1,
            2, // First round of inner repeat
            1,
            2, // Second round of inner repeat
            3,
            4,
            5,
            // Second round of outer repeat
            1,
            2, // First round of inner repeat
            1,
            2, // Second round of inner repeat
            3,
            4,
            5,
            6,
            // next repeat
            7,
            8,
            7,
            8,
            // Second repeat done
            9,
            10 // last two bars
        ];
        testAlphaTexRepeat(tex, expectedBars, 50);
    });

    it('nested-repeats', () => {
        const tex: string = `
            .
            \\ro 4.3.4*4 | \\ro 4.3.4*4 | \\rc 2 4.3.4*4  | 4.3.4*4 | \\rc 2 4.3.4*4 |
            3.3.4*4 |
            \\ro 4.3.4*4 | \\ro 4.3.4*4 | \\rc 2 4.3.4*4  | 4.3.4*4 | \\rc 2 4.3.4*4 
        `;
        const expectedBars: number[] = [
            0, 1, 2, 1, 2, 3, 4, 0, 1, 2, 1, 2, 3, 4, 5, 6, 7, 8, 7, 8, 9, 10, 6, 7, 8, 7, 8, 9, 10
        ];
        testAlphaTexRepeat(tex, expectedBars, 50);
    });

    it('alternate-endings-1046', () => {
        const tex: string = `
        \\tempo 175
        .
        \\ro :1 r | \\ae 1 r | \\ae 2 \\rc 2 r | \\ro r | \\ae 1 r | \\ae (2 3 4) \\rc 4 r | r
        `;
        const expectedBars: number[] = [0, 1, 0, 2, 3, 4, 3, 5, 3, 5, 3, 5, 6];
        testAlphaTexRepeat(tex, expectedBars, 50);
    });

    // Da Capo

    it('da-capo', () => {
        const tex: string = `
        .
        \\ro :1 r | \\rc 2 r | \\jump DaCapo r | r       
        `;
        const expectedBars: number[] = [0, 1, 0, 1, 2, 0, 1, 2, 3];
        testAlphaTexRepeat(tex, expectedBars, 50);
    });

    it('da-capo-al-fine', () => {
        const tex: string = `
        .
        \\ro :1 r | \\rc 2 r | \\jump fine r | \\jump DaCapoAlFine r | r
        `;
        const expectedBars: number[] = [0, 1, 0, 1, 2, 3, 0, 1, 2];
        testAlphaTexRepeat(tex, expectedBars, 50);
    });

    it('da-capo-al-coda', () => {
        const tex: string = `
        .
        \\ro :1 r | \\rc 2 r | \\jump DaCoda r | \\jump DaCapoAlCoda r | \\jump Coda r
        `;
        const expectedBars: number[] = [0, 1, 0, 1, 2, 3, 0, 1, 2, 4];
        testAlphaTexRepeat(tex, expectedBars, 50);
    });

    it('da-capo-al-double-coda', () => {
        const tex: string = `
        .
        \\ro :1 r | \\rc 2 r | \\jump DaDoubleCoda r | \\jump DaCapoAlDoubleCoda r | \\jump DoubleCoda r
        `;
        const expectedBars: number[] = [0, 1, 0, 1, 2, 3, 0, 1, 2, 4];
        testAlphaTexRepeat(tex, expectedBars, 50);
    });

    // Dal Segno

    it('dal-segno', () => {
        const tex: string = `
        .
        \\ro :1 r | \\rc 2 r | \\jump Segno r | \\ro \\rc 2 r | \\jump DalSegno r | r
        `;
        const expectedBars: number[] = [0, 1, 0, 1, 2, 3, 3, 4, 2, 3, 4, 5];
        testAlphaTexRepeat(tex, expectedBars, 50);
    });

    it('dal-segno-al-coda', () => {
        const tex: string = `
        .
        \\ro :1 r | \\rc 2 r | r |
        \\jump Segno r | \\ro \\rc 2 r | \\jump DaCoda r | 
        r | r | \\jump DalSegnoAlCoda r | r | \\jump Coda r | r | \\ro \\rc 2 r
        `;
        const expectedBars: number[] = [0, 1, 0, 1, 2, 3, 4, 4, 5, 6, 7, 8, 3, 4, 5, 10, 11, 12, 12];
        testAlphaTexRepeat(tex, expectedBars, 50);
    });

    it('dal-segno-al-coda-missing-target', () => {
        const tex: string = `
        .
        \\ro :1 r | \\rc 2 r | r |
        \\jump Segno r | \\ro \\rc 2 r | \\jump DaCoda r | 
        r | r | \\jump DalSegnoAlCoda r | r | r | r | \\ro \\rc 2 r
        `;
        const expectedBars: number[] = [0, 1, 0, 1, 2, 3, 4, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        testAlphaTexRepeat(tex, expectedBars, 50);
    });

    it('dal-segno-al-double-coda', () => {
        const tex: string = `
        .
        \\ro :1 r | \\rc 2 r | r |
        \\jump Segno r | \\ro \\rc 2 r | \\jump DaDoubleCoda r | 
        r | r | \\jump DalSegnoAlDoubleCoda r | r | \\jump DoubleCoda r | r | \\ro \\rc 2 r
        `;
        const expectedBars: number[] = [0, 1, 0, 1, 2, 3, 4, 4, 5, 6, 7, 8, 3, 4, 5, 10, 11, 12, 12];
        testAlphaTexRepeat(tex, expectedBars, 50);
    });

    it('dal-segno-al-fine', () => {
        const tex: string = `
        .
        \\ro :1 r | \\rc 2 r | r |
        \\jump Segno r | \\ro \\rc 2 r | \\jump Fine | 
        r | r | \\jump DalSegnoAlFine r | r | 
        `;
        const expectedBars: number[] = [0, 1, 0, 1, 2, 3, 4, 4, 5, 6, 7, 8, 3, 4, 5];
        testAlphaTexRepeat(tex, expectedBars, 50);
    });

    // Dal Segno Segno

    it('dal-segno-segno', () => {
        const tex: string = `
        .
        \\ro :1 r | \\rc 2 r | \\jump SegnoSegno r | \\ro \\rc 2 r | \\jump DalSegnoSegno r | r
        `;
        const expectedBars: number[] = [0, 1, 0, 1, 2, 3, 3, 4, 2, 3, 4, 5];
        testAlphaTexRepeat(tex, expectedBars, 50);
    });

    it('dal-segno-segno-missing-target', () => {
        const tex: string = `
        .
        \\ro :1 r | \\rc 2 r | r | \\ro \\rc 2 r | \\jump DalSegnoSegno r | r  | \\ro \\rc 2 r
        `;
        const expectedBars: number[] = [0, 1, 0, 1, 2, 3, 3, 4, 5, 6, 6];
        testAlphaTexRepeat(tex, expectedBars, 50);
    });

    it('dal-segno-segno-al-coda', () => {
        const tex: string = `
        .
        \\ro :1 r | \\rc 2 r | r |
        \\jump SegnoSegno r | \\ro \\rc 2 r | \\jump DaCoda r | 
        r | r | \\jump DalSegnoSegnoAlCoda r | r | \\jump Coda r | r | \\ro \\rc 2 r
        `;
        const expectedBars: number[] = [0, 1, 0, 1, 2, 3, 4, 4, 5, 6, 7, 8, 3, 4, 5, 10, 11, 12, 12];
        testAlphaTexRepeat(tex, expectedBars, 50);
    });

    it('dal-segno-segno-al-double-coda', () => {
        const tex: string = `
        .
        \\ro :1 r | \\rc 2 r | r |
        \\jump SegnoSegno r | \\ro \\rc 2 r | \\jump DaDoubleCoda r | 
        r | r | \\jump DalSegnoSegnoAlDoubleCoda r | r | \\jump DoubleCoda r | r | \\ro \\rc 2 r
        `;
        const expectedBars: number[] = [0, 1, 0, 1, 2, 3, 4, 4, 5, 6, 7, 8, 3, 4, 5, 10, 11, 12, 12];
        testAlphaTexRepeat(tex, expectedBars, 50);
    });

    it('dal-segno-segno-al-fine', () => {
        const tex: string = `
        .
        \\ro :1 r | \\rc 2 r | r |
        \\jump SegnoSegno r | \\ro \\rc 2 r | \\jump Fine | 
        r | r | \\jump DalSegnoSegnoAlFine r | r | 
        `;
        const expectedBars: number[] = [0, 1, 0, 1, 2, 3, 4, 4, 5, 6, 7, 8, 3, 4, 5];
        testAlphaTexRepeat(tex, expectedBars, 50);
    });

    it('multiple-jumps-same-target', () => {
        const tex: string = `
        .
        
        \\ro :1 r | \\rc 2 r | r |
        \\jump Segno r | \\ro \\rc 2 r | \\jump DaCoda r | 
        r | r | \\jump DalSegnoAlCoda r | r | \\jump Coda r | r | \\ro \\rc 2 r |


        \\ro :1 r | \\rc 2 r | r |
        \\jump Segno r | \\ro \\rc 2 r | \\jump DaCoda r | 
        r | r | \\jump DalSegnoAlCoda r | r | \\jump Coda r | r | \\ro \\rc 2 r

        `;
        const expectedBars: number[] = [
            // first section
            0, 1, 0, 1, 2, 3, 4, 4, 5, 6, 7, 8, 3, 4, 5, 10, 11, 12, 12,

            // second section repeat
            13, 14, 13, 14, 15, 16, 17, 17, 18, 19, 20, 21, 16, 17, 18, 23, 24, 25, 25
        ];
        testAlphaTexRepeat(tex, expectedBars, 50);
    });

    it('multiple-jumps-different-target', () => {
        const tex: string = `
        .
        
        \\ro :1 r | \\rc 2 r | r |
        \\jump Segno r | \\ro \\rc 2 r | \\jump DaCoda r | 
        r | r | \\jump DalSegnoAlCoda r | r | \\jump Coda r | r | \\ro \\rc 2 r |


        \\ro :1 r | \\rc 2 r | r |
        \\jump SegnoSegno r | \\ro \\rc 2 r | \\jump DaDoubleCoda r | 
        r | r | \\jump DalSegnoSegnoAlDoubleCoda r | r | \\jump DoubleCoda r | r | \\ro \\rc 2 r

        `;
        const expectedBars: number[] = [
            // first section
            0, 1, 0, 1, 2, 3, 4, 4, 5, 6, 7, 8, 3, 4, 5, 10, 11, 12, 12,

            // second section repeat
            13, 14, 13, 14, 15, 16, 17, 17, 18, 19, 20, 21, 16, 17, 18, 23, 24, 25, 25
        ];
        testAlphaTexRepeat(tex, expectedBars, 50);
    });

    it('interleaved-repeat-and-jump', () => {
        const tex: string = `
        .
        \\ro :1 r | \\jump Segno r | \\ro \\rc 2 r | \\jump DaCoda r | r | \\jump DalSegnoAlCoda r | r | \\jump Coda r | \\rc 2 r | r | \\ro \\rc 2 r
        `;
        const expectedBars: number[] = [
            0, 1, 2, 2, 3, 4, 5,

            1, 2, 3, 7, 8, 9, 10, 10
        ];
        testAlphaTexRepeat(tex, expectedBars, 50);
    });
});
