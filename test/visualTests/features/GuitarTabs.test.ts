import { StaveProfile } from '@src/DisplaySettings';
import { TabRhythmMode } from '@src/NotationSettings';
import { Settings } from '@src/Settings';
import { VisualTestHelper } from '@test/visualTests/VisualTestHelper';

describe('GuitarTabsTests', () => {
    it('rhythm', async () => {
        let settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Tab;
        settings.notation.rhythmMode = TabRhythmMode.ShowWithBars;
        await VisualTestHelper.runVisualTest('guitar-tabs/rhythm.gp', settings);
    });

    it('rhythm-with-beams', async () => {
        let settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Tab;
        settings.notation.rhythmMode = TabRhythmMode.ShowWithBeams;
        await VisualTestHelper.runVisualTest('guitar-tabs/rhythm-with-beams.gp', settings);
    });

    it('string-variations', async () => {
        let settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Tab;
        await VisualTestHelper.runVisualTest('guitar-tabs/string-variations.gp', settings);
    });

});
