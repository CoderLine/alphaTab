import { StaveProfile } from '@src/DisplaySettings';
import { Settings } from '@src/Settings';
import { VisualTestHelper } from '@test/visualTests/VisualTestHelper';

describe('GeneralTests', () => {
    it('song-details', async () => {
        await VisualTestHelper.runVisualTest('general/song-details.gp');
    });

    it('repeats', async () => {
        let settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Score;
        await VisualTestHelper.runVisualTest('general/repeats.gp', settings);
    });

    it('alternate-endings', async () => {
        let settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Score;
        await VisualTestHelper.runVisualTest('general/alternate-endings.gp', settings);
    });

    it('tuning', async () => {
        await VisualTestHelper.runVisualTest('general/tuning.gp');
    });
});
