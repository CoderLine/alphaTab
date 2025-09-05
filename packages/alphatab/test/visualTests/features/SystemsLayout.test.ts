import { SystemsLayoutMode } from '@src/DisplaySettings';
import { LayoutMode } from '@src/LayoutMode';
import { Settings } from '@src/Settings';
import { ScoreLoader } from '@src/importer/ScoreLoader';
import { TestPlatform } from '@test/TestPlatform';
import { VisualTestHelper, VisualTestOptions, VisualTestRun } from '@test/visualTests/VisualTestHelper';

describe('SystemsLayoutTests', () => {
    it('bars-adjusted-automatic', async () => {
        const settings = new Settings();
        settings.display.systemsLayoutMode = SystemsLayoutMode.Automatic;

        await VisualTestHelper.runVisualTestFull(
            await VisualTestOptions.file(
                'systems-layout/bars-adjusted.gp',
                [new VisualTestRun(-1, 'test-data/visual-tests/systems-layout/bars-adjusted-automatic.png')],
                settings
            )
        );
    });

    it('bars-adjusted-model', async () => {
        const settings = new Settings();
        settings.display.systemsLayoutMode = SystemsLayoutMode.UseModelLayout;

        await VisualTestHelper.runVisualTestFull(
            await VisualTestOptions.file(
                'systems-layout/bars-adjusted.gp',
                [new VisualTestRun(-1, 'test-data/visual-tests/systems-layout/bars-adjusted-model.png')],
                settings
            )
        );
    });

    it('multi-track-single-track', async () => {
        const settings = new Settings();
        settings.display.systemsLayoutMode = SystemsLayoutMode.UseModelLayout;

        await VisualTestHelper.runVisualTestFull(
            await VisualTestOptions.file(
                'systems-layout/multi-track-different.gp',
                [new VisualTestRun(-1, 'test-data/visual-tests/systems-layout/multi-track-single-track.png')],
                settings
            )
        );
    });

    it('multi-track-two-tracks', async () => {
        const settings = new Settings();
        settings.display.systemsLayoutMode = SystemsLayoutMode.UseModelLayout;

        const options = await VisualTestOptions.file(
            'systems-layout/multi-track-different.gp',
            [new VisualTestRun(-1, 'test-data/visual-tests/systems-layout/multi-track-two-tracks.png')],
            settings
        );
        options.tracks = [0, 1];
        await VisualTestHelper.runVisualTestFull(options);
    });

    it('resized', async () => {
        const settings = new Settings();
        settings.display.systemsLayoutMode = SystemsLayoutMode.UseModelLayout;

        await VisualTestHelper.runVisualTestFull(
            await VisualTestOptions.file(
                'systems-layout/resized.gp',
                [new VisualTestRun(-1, 'test-data/visual-tests/systems-layout/resized.png')],
                settings
            )
        );
    });

    it('horizontal-fixed-sizes-single-track', async () => {
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Horizontal;
        settings.display.systemsLayoutMode = SystemsLayoutMode.UseModelLayout;

        const score = ScoreLoader.loadScoreFromBytes(
            await TestPlatform.loadFile('test-data/visual-tests/systems-layout/multi-track-different.gp')
        );

        for (const bars of score.tracks[0].staves[0].bars) {
            bars.displayWidth = 400;
        }

        await VisualTestHelper.runVisualTestFull(
            new VisualTestOptions(
                score,
                [
                    new VisualTestRun(
                        -1,
                        'test-data/visual-tests/systems-layout/horizontal-fixed-sizes-single-track.png'
                    )
                ],
                settings
            )
        );
    });

    it('horizontal-fixed-sizes-two-tracks', async () => {
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Horizontal;
        settings.display.systemsLayoutMode = SystemsLayoutMode.UseModelLayout;
        const score = ScoreLoader.loadScoreFromBytes(
            await TestPlatform.loadFile('test-data/visual-tests/systems-layout/multi-track-different.gp')
        );

        for (const masterBar of score.masterBars) {
            masterBar.displayWidth = 400;
        }

        const o = new VisualTestOptions(
            score,
            [new VisualTestRun(-1, 'test-data/visual-tests/systems-layout/horizontal-fixed-sizes-two-tracks.png')],
            settings
        );
        o.tracks = [0, 1];
        await VisualTestHelper.runVisualTestFull(o);
    });
});
