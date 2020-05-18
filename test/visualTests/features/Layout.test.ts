import { LayoutMode } from '@src/DisplaySettings';
import { Settings } from '@src/Settings';
import { VisualTestHelper } from '@test/visualTests/VisualTestHelper';

describe('LayoutTests', () => {
    it('pageLayout', async () => {
        await VisualTestHelper.runVisualTest('features/layout/page-layout.gp5');
    });

    it('multi-track', async () => {
        await VisualTestHelper.runVisualTest('features/layout/multi-track.gp5', undefined, [0, 3]);
    });

    it('multi-voice', async () => {
        await VisualTestHelper.runVisualTest('features/layout/multi-voice.gp5');
    });

    it('page-layout-5barsperrow', async () => {
        let settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;
        settings.display.barsPerRow = 5;
        await VisualTestHelper.runVisualTest('features/layout/page-layout-5barsperrow.gp5', settings);
    });

    it('page-layout-bar5to8', async () => {
        let settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;
        settings.display.startBar = 5;
        settings.display.barCount = 4;
        await VisualTestHelper.runVisualTest('features/layout/page-layout-5to8.gp5', settings);
    });

    it('horizontal-layout', async () => {
        let settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Horizontal;
        await VisualTestHelper.runVisualTest('features/layout/horizontal-layout.gp5', settings);
    });

    it('horizontal-layout-bar5to8', async () => {
        let settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Horizontal;
        settings.display.startBar = 5;
        settings.display.barCount = 4;
        await VisualTestHelper.runVisualTest('features/layout/horizontal-layout-5to8.gp5', settings);
    });
});
