import { ScoreLoader } from '@src/importer/ScoreLoader';
import { LayoutMode } from '@src/LayoutMode';
import { Settings } from '@src/Settings';
import { TestPlatform } from '@test/TestPlatform';
import { VisualTestHelper, VisualTestOptions, VisualTestRun } from '@test/visualTests/VisualTestHelper';

describe('TranspositionTonality', () => {
    it('renders-correctly', async () => {
        const files = [
            'transposition-tonality-a.gp',
            'transposition-tonality-ab.gp',
            'transposition-tonality-b.gp',
            'transposition-tonality-bb.gp',
            'transposition-tonality-c.gp',
            'transposition-tonality-cb.gp',
            'transposition-tonality-csharp.gp',
            'transposition-tonality-d.gp',
            'transposition-tonality-db.gp',
            'transposition-tonality-e.gp',
            'transposition-tonality-eb.gp',
            'transposition-tonality-f.gp',
            'transposition-tonality-fsharp.gp',
            'transposition-tonality-g.gp',
            'transposition-tonality-gb.gp'
        ];

        const errors: Error[] = [];
        for (const file of files) {
            try {
                const settings = new Settings();
                settings.display.layoutMode = LayoutMode.Horizontal;

                const inputFile = `test-data/guitarpro8/${file}`;
                const inputFileData = await TestPlatform.loadFile(inputFile);
                const referenceFileName = TestPlatform.changeExtension(inputFile, '.png');
                const score = ScoreLoader.loadScoreFromBytes(inputFileData, settings);

                const o = new VisualTestOptions(score, [new VisualTestRun(-1, referenceFileName)], settings);
                o.tracks = score.tracks.map(t => t.index);
                await VisualTestHelper.runVisualTestFull(o);
            } catch (e) {
                if (e instanceof Error) {
                    errors.push(e);
                } else {
                    throw e;
                }
            }
        }

        if (errors.length === 1) {
            throw errors[0];
        }
        if (errors.length > 0) {
            const errorMessages = errors.map(e => e.message ?? 'Unknown error').join('\n');
            throw new Error(errorMessages);
        }
    });
});
