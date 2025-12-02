import { StaveProfile } from '@coderline/alphatab/StaveProfile';
import { TabRhythmMode } from '@coderline/alphatab/NotationSettings';
import { Settings } from '@coderline/alphatab/Settings';
import { VisualTestHelper } from 'test/visualTests/VisualTestHelper';

describe('GuitarTabsTests', () => {
    it('rhythm', async () => {
        const settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Tab;
        settings.notation.rhythmMode = TabRhythmMode.ShowWithBars;
        await VisualTestHelper.runVisualTest('guitar-tabs/rhythm.gp', settings);
    });

    it('rhythm-with-beams', async () => {
        const settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Tab;
        settings.notation.rhythmMode = TabRhythmMode.ShowWithBeams;
        await VisualTestHelper.runVisualTest('guitar-tabs/rhythm-with-beams.gp', settings);
    });

    it('string-variations', async () => {
        const settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Tab;
        await VisualTestHelper.runVisualTest('guitar-tabs/string-variations.gp', settings);
    });
});
