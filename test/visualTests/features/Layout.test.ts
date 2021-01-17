import { LayoutMode } from '@src/DisplaySettings';
import { Settings } from '@src/Settings';
import { VisualTestHelper } from '@test/visualTests/VisualTestHelper';

describe('LayoutTests', () => {
    it('pageLayout', async () => {
        await VisualTestHelper.runVisualTest('layout/page-layout.gp');
    });

    it('multi-track', async () => {
        await VisualTestHelper.runVisualTest('layout/multi-track.gp', undefined, [0, 3]);
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
});
