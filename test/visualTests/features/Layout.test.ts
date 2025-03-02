import { SystemsLayoutMode } from '@src/DisplaySettings';
import { LayoutMode } from '@src/LayoutMode';
import { Settings } from '@src/Settings';
import { VisualTestHelper, VisualTestOptions, VisualTestRun } from '@test/visualTests/VisualTestHelper';

describe('LayoutTests', () => {
    it('page-layout', async () => {
        await VisualTestHelper.runVisualTest('layout/page-layout.gp');
    });

    it('page-layout-justify-last-row', async () => {
        const settings = new Settings();
        settings.display.justifyLastSystem = true;

        await VisualTestHelper.runVisualTestFull(
            await VisualTestOptions.file(
                'layout/page-layout.gp',
                [new VisualTestRun(-1, 'layout/page-layout-justify-last-row.png')],
                settings
            )
        );
    });

    it('multi-track', async () => {
        await VisualTestHelper.runVisualTest('layout/multi-track.gp', undefined, o => {
            o.tracks = [0, 3];
        });
    });

    it('multi-voice', async () => {
        await VisualTestHelper.runVisualTest('layout/multi-voice.gp');
    });

    it('page-layout-5barsperrow', async () => {
        let settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;
        settings.display.barsPerRow = 5;
        await VisualTestHelper.runVisualTest('layout/page-layout-5barsperrow.gp', settings);
    });

    it('page-layout-bar5to8', async () => {
        let settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;
        settings.display.startBar = 5;
        settings.display.barCount = 4;
        await VisualTestHelper.runVisualTest('layout/page-layout-5to8.gp', settings);
    });

    it('horizontal-layout', async () => {
        let settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Horizontal;
        await VisualTestHelper.runVisualTest('layout/horizontal-layout.gp', settings);
    });

    it('horizontal-layout-bar5to8', async () => {
        let settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Horizontal;
        settings.display.startBar = 5;
        settings.display.barCount = 4;
        await VisualTestHelper.runVisualTest('layout/horizontal-layout-5to8.gp', settings);
    });

    it('brackets-braces-none', async () => {
        const settings: Settings = new Settings();
        settings.display.systemsLayoutMode = SystemsLayoutMode.UseModelLayout;
        await VisualTestHelper.runVisualTest('layout/brackets-braces-none.gp', settings, o => {
            o.tracks = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        });
    });

    it('brackets-braces-similar', async () => {
        const settings: Settings = new Settings();
        settings.display.systemsLayoutMode = SystemsLayoutMode.UseModelLayout;
        await VisualTestHelper.runVisualTest('layout/brackets-braces-similar.gp', settings, o => {
            o.tracks = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        });
    });

    it('brackets-braces-staves', async () => {
        const settings: Settings = new Settings();
        settings.display.systemsLayoutMode = SystemsLayoutMode.UseModelLayout;
        await VisualTestHelper.runVisualTest('layout/brackets-braces-staves.gp', settings, o => {
            o.tracks = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        });
    });

    it('brackets-braces-system-divider', async () => {
        const settings: Settings = new Settings();
        settings.display.systemsLayoutMode = SystemsLayoutMode.UseModelLayout;
        await VisualTestHelper.runVisualTest('layout/system-divider.gp', settings, o => {
            o.tracks = [0, 1];
        });
    });

    it('track-names-full-name-all', async () => {
        const settings: Settings = new Settings();
        settings.display.systemsLayoutMode = SystemsLayoutMode.UseModelLayout;
        await VisualTestHelper.runVisualTest('layout/track-names-full-name-all.gp', settings);
    });

    it('track-names-full-name-short-name', async () => {
        const settings: Settings = new Settings();
        settings.display.systemsLayoutMode = SystemsLayoutMode.UseModelLayout;
        await VisualTestHelper.runVisualTest('layout/track-names-full-name-short-name.gp', settings);
    });

    it('track-names-full-name-horizontal', async () => {
        const settings: Settings = new Settings();
        settings.display.systemsLayoutMode = SystemsLayoutMode.UseModelLayout;
        await VisualTestHelper.runVisualTest('layout/track-names-full-name-horizontal.gp', settings);
    });

    it('track-names-first-system', async () => {
        const settings: Settings = new Settings();
        settings.display.systemsLayoutMode = SystemsLayoutMode.UseModelLayout;
        await VisualTestHelper.runVisualTest('layout/track-names-first-system.gp', settings);
    });

    it('track-names-all-systems-multi', async () => {
        const settings: Settings = new Settings();
        settings.display.systemsLayoutMode = SystemsLayoutMode.UseModelLayout;
        await VisualTestHelper.runVisualTest('layout/track-names-all-systems-multi.gp', settings, o => {
            o.tracks = [0, 1];
        });
    });

    it('system-layout-tex', async () => {
        const settings: Settings = new Settings();
        settings.display.systemsLayoutMode = SystemsLayoutMode.UseModelLayout;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track { defaultSystemsLayout 3 }
            \\scale 0.25 :1 c4 | \\scale 0.5 c4 | \\scale 0.25 c4 | 
            \\scale 0.5 c4 | \\scale 2 c4 | \\scale 0.5 c4 |
            c4 | c4  
        `,
            'layout/system-layout-tex.png',
            settings
        );
    });
});
