import { StaveProfile, LayoutMode } from '@src/DisplaySettings';
import { Settings } from '@src/Settings';
import { VisualTestHelper } from '@test/visualTests/VisualTestHelper';
import { TestPlatform } from '@test/TestPlatform';
import { ScoreLoader } from '@src/importer/ScoreLoader';
import { Score } from '@src/model/Score';

describe('GeneralTests', () => {
    it('song-details', async () => {
        await VisualTestHelper.runVisualTest('features/general/song-details.gp5');
    });

    it('repeats', async () => {
        let settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Score;
        await VisualTestHelper.runVisualTest('features/general/repeats.gp5', settings);
    });

    it('alternate-endings', async () => {
        let settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Score;
        await VisualTestHelper.runVisualTest('features/general/alternate-endings.gp5', settings);
    });

    it('tuning', async () => {
        await VisualTestHelper.runVisualTest('features/general/tuning.gp5');
    });

    it('notation-legend-default', async () => {
        let settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Horizontal;
        const inputFileData = await TestPlatform.loadFile(`test-data/visual-tests/features/general/notation-legend.gp`);
        const referenceFileName = `features/general/notation-legend-default.png`;
        let score: Score = ScoreLoader.loadScoreFromBytes(inputFileData, settings);

        await VisualTestHelper.runVisualTestScore(score, referenceFileName, settings, [0]);
    });

    it('notation-legend-songbook', async () => {
        let settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Horizontal;
        settings.setSongBookModeSettings();
        const inputFileData = await TestPlatform.loadFile(`test-data/visual-tests/features/general/notation-legend.gp`);
        const referenceFileName = `features/general/notation-legend-songbook.png`;
        let score: Score = ScoreLoader.loadScoreFromBytes(inputFileData, settings);
        await VisualTestHelper.runVisualTestScore(score, referenceFileName, settings, [0]);
    });
});
