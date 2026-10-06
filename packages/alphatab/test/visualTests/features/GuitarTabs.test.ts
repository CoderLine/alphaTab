import { TabRhythmMode } from '@coderline/alphatab/NotationSettings';
import { Settings } from '@coderline/alphatab/Settings';
import { StaveProfile } from '@coderline/alphatab/StaveProfile';
import { VisualTestHelper, VisualTestOptions, VisualTestRun } from 'test/visualTests/VisualTestHelper';
import { describe, it } from 'vitest';

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

    it('rhythm-slashed', async () => {
        const settings: Settings = new Settings();
        settings.notation.rhythmMode = TabRhythmMode.ShowWithBars;
        await VisualTestHelper.runVisualTestFull(
            await VisualTestOptions.file(
                'effects-and-annotations/beat-slash.gp',
                [new VisualTestRun(-1, 'test-data/visual-tests/guitar-tabs/rhythm-slashed.png')],
                settings
            )
        );
    });

    it('rhythm-with-beams-slashed', async () => {
        const settings: Settings = new Settings();
        settings.notation.rhythmMode = TabRhythmMode.ShowWithBeams;
        await VisualTestHelper.runVisualTestFull(
            await VisualTestOptions.file(
                'effects-and-annotations/beat-slash.gp',
                [new VisualTestRun(-1, 'test-data/visual-tests/guitar-tabs/rhythm-with-beams-slashed.png')],
                settings
            )
        );
    });

    it('string-variations', async () => {
        const settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Tab;
        await VisualTestHelper.runVisualTest('guitar-tabs/string-variations.gp', settings);
    });
});
