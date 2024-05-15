import { SystemsLayoutMode } from '@src/DisplaySettings';
import { LayoutMode } from '@src/LayoutMode';
import { Settings } from '@src/Settings';
import { ScoreLoader } from '@src/importer';
import { TestPlatform } from '@test/TestPlatform';
import { VisualTestHelper } from '@test/visualTests/VisualTestHelper';

describe('SystemsLayoutTests', () => {
    it('bars-adjusted-automatic', async () => {
        const settings = new Settings();
        settings.display.systemsLayoutMode = SystemsLayoutMode.Automatic;
        const score = ScoreLoader.loadScoreFromBytes(await TestPlatform.loadFile(`test-data/visual-tests/systems-layout/bars-adjusted.gp`));

        await VisualTestHelper.runVisualTestScoreWithResize(
            score,
            [1300],
            ['systems-layout/bars-adjusted-automatic.png'],
            settings,
            [0]);
    });

    it('bars-adjusted-model', async () => {
        const settings = new Settings();
        settings.display.systemsLayoutMode = SystemsLayoutMode.UseModelLayout;
        const score = ScoreLoader.loadScoreFromBytes(await TestPlatform.loadFile(`test-data/visual-tests/systems-layout/bars-adjusted.gp`));

        await VisualTestHelper.runVisualTestScoreWithResize(
            score,
            [1300],
            ['systems-layout/bars-adjusted-model.png'],
            settings,
            [0]);
    });

    it('multi-track-single-track', async () => {
        const settings = new Settings();
        settings.display.systemsLayoutMode = SystemsLayoutMode.UseModelLayout;
        const score = ScoreLoader.loadScoreFromBytes(await TestPlatform.loadFile(`test-data/visual-tests/systems-layout/multi-track-different.gp`));

        await VisualTestHelper.runVisualTestScoreWithResize(
            score,
            [1300],
            ['systems-layout/multi-track-single-track.png'],
            settings,
            [0]);
    });

    it('multi-track-two-tracks', async () => {
        const settings = new Settings();
        settings.display.systemsLayoutMode = SystemsLayoutMode.UseModelLayout;
        const score = ScoreLoader.loadScoreFromBytes(await TestPlatform.loadFile(`test-data/visual-tests/systems-layout/multi-track-different.gp`));

        await VisualTestHelper.runVisualTestScoreWithResize(
            score,
            [1300],
            ['systems-layout/multi-track-two-tracks.png'],
            settings,
            [0, 1]);
    });

    it('resized', async () => {
        const settings = new Settings();
        settings.display.systemsLayoutMode = SystemsLayoutMode.UseModelLayout;
        const score = ScoreLoader.loadScoreFromBytes(await TestPlatform.loadFile(`test-data/visual-tests/systems-layout/resized.gp`));

        await VisualTestHelper.runVisualTestScoreWithResize(
            score,
            [1300],
            ['systems-layout/resized.png'],
            settings,
            [0]);
    });

    it('horizontal-fixed-sizes-single-track', async () => {
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Horizontal;
        settings.display.systemsLayoutMode = SystemsLayoutMode.UseModelLayout;
        const score = ScoreLoader.loadScoreFromBytes(await TestPlatform.loadFile(`test-data/visual-tests/systems-layout/multi-track-different.gp`));

        for (const bars of score.tracks[0].staves[0].bars) {
            bars.displayWidth = 400;
        }

        await VisualTestHelper.runVisualTestScoreWithResize(
            score,
            [1300],
            ['systems-layout/horizontal-fixed-sizes-single-track.png'],
            settings,
            [0]);
    });

    it('horizontal-fixed-sizes-two-tracks', async () => {
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Horizontal;
        settings.display.systemsLayoutMode = SystemsLayoutMode.UseModelLayout;
        const score = ScoreLoader.loadScoreFromBytes(await TestPlatform.loadFile(`test-data/visual-tests/systems-layout/multi-track-different.gp`));

        for (const masterBar of score.masterBars) {
            masterBar.displayWidth = 400;
        }

        await VisualTestHelper.runVisualTestScoreWithResize(
            score,
            [1300],
            ['systems-layout/horizontal-fixed-sizes-two-tracks.png'],
            settings,
            [0, 1]);
    });
});
