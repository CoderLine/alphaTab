import { StaveProfile } from '@src/DisplaySettings';
import { TabRhythmMode } from '@src/NotationSettings';
import { Settings } from '@src/Settings';
import { VisualTestHelper } from '@test/visualTests/VisualTestHelper';

describe('GuitarTabsTests', () => {
    it('rhythm', async () => {
        let settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Tab;
        settings.notation.rhythmMode = TabRhythmMode.ShowWithBars;
        await VisualTestHelper.runVisualTest('features/guitar-tabs/rhythm.gp5', settings);
    });

    it('rhythm-with-beams', async () => {
        let settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Tab;
        settings.notation.rhythmMode = TabRhythmMode.ShowWithBeams;
        await VisualTestHelper.runVisualTest('features/guitar-tabs/rhythm-with-beams.gp5', settings);
    });

    it('string-variations', async () => {
        let settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Tab;
        await VisualTestHelper.runVisualTest('features/guitar-tabs/string-variations.gp5', settings);
    });

});
