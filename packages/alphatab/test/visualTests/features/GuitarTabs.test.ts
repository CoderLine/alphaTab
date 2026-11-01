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

    it('multi-voice-same-string', async () => {
        // notes of both voices on the same string at the same time, with fret numbers of different widths
        await VisualTestHelper.runVisualTestTex(
            `
            \\track \\staff { tabs }
            \\voice :4 12.3 10.3 5.3 12.3 | 5.3 12.3 10.3 7.3
            \\voice :4 5.3 12.3 5.3 7.3 | 12.3 5.3 10.3 12.3
            `,
            'test-data/visual-tests/guitar-tabs/multi-voice-same-string.png'
        );
    });

    it('transpose-down', async () => {
        // open strings, chords, ties across bars, legato, bends, harmonics, trills and dead notes
        // which do not fit on their string after transposing down
        const settings = new Settings();
        settings.notation.transpositionPitches = [-4];
        await VisualTestHelper.runVisualTestTex(
            `
            \\track \\staff { score tabs }
            :4 0.6 3.5{string} 2.4 0.3 | (0.1 0.2 0.3) 3.5 3.5 3.5 | 3.5{t} 2.3{h} 4.3 4.3{b (0 4)} |
            12.6{nh} 12.5{nh} 5.3{tr 7 16} 0.6{x}
            `,
            'test-data/visual-tests/guitar-tabs/transpose-down.png',
            settings
        );
    });

    it('transpose-up', async () => {
        // frets beyond the neck after transposing up
        const settings = new Settings();
        settings.display.staveProfile = StaveProfile.Tab;
        settings.notation.transpositionPitches = [7];
        await VisualTestHelper.runVisualTestTex(
            `
            :4 17.1 20.1 (19.2 20.1) 22.2 | 5.6 7.5 0.1 3.3
            `,
            'test-data/visual-tests/guitar-tabs/transpose-up.png',
            settings
        );
    });
});
