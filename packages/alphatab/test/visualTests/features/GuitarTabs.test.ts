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

    describe('transpose', () => {
        // the original and the transposed track, to compare note and tab placement
        async function transposeTest(name: string, semitones: number, music: string, staffMetadata?: string) {
            const settings = new Settings();
            settings.notation.transpositionPitches = [0, semitones];
            const staff = `\\staff { score tabs } ${staffMetadata ?? ''}`;
            const transposed = `Transposed ${semitones > 0 ? '+' : ''}${semitones}`;
            await VisualTestHelper.runVisualTestTex(
                `\\track "Original" "Original" ${staff} ${music} \\track "${transposed}" "${transposed}" ${staff} ${music}`,
                `test-data/visual-tests/guitar-tabs/transpose-${name}.png`,
                settings,
                o => {
                    o.tracks = [0, 1];
                }
            );
        }

        it('down', async () =>
            await transposeTest(
                'down',
                -4,
                `:4 0.6 3.5{string} 2.4 0.3 | (0.1 0.2 0.3) 3.5 3.5 3.5 | 3.5{t} 2.3{h} 4.3 4.3{b (0 4)} |
                12.6{nh} 12.5{nh} 5.3{tr 7 16} 0.6{x}`
            ));
        it('up', async () => await transposeTest('up', 7, ':4 17.1 20.1 (19.2 20.1) 22.2 | 5.6 7.5 0.1 3.3'));
        it('keep-strings', async () => await transposeTest('keep-strings', 2, ':4 3.3 5.2 0.1 12.6'));
        it('open-strings', async () => await transposeTest('open-strings', -4, ':4 3.5 2.4 5.3 0.6'));
        it('chords', async () =>
            await transposeTest('chords', -4, ':4 (0.1 0.2) (0.1 0.2 0.3) (3.5 2.4) (0.6 2.5 2.4)'));
        it('ties', async () => await transposeTest('ties', -4, ':4 3.5 3.5 3.5 3.5 | -.5 2.4 2.4 -.4'));
        it('legato', async () => await transposeTest('legato', -4, ':4 2.3{h} 4.3 2.3{ss} 4.3'));
        it('pull-off-to-open', async () => await transposeTest('pull-off-to-open', -2, ':4 6.3{h} 2.3 5.2{h} 2.2'));
        it('bends', async () => await transposeTest('bends', -4, ':4 4.3{b (0 4)} 0.1{b (0 4)} 2.2{b (0 4)} 5.3'));
        it('natural-harmonics-up', async () =>
            await transposeTest('natural-harmonics-up', 7, ':4 12.6{nh} 7.5{nh} 5.4{nh} 12.1{nh}'));
        it('natural-harmonics-down', async () =>
            await transposeTest('natural-harmonics-down', -4, ':4 12.6{nh} 7.5{nh} 5.4{nh} 12.1{nh}'));
        it('dead-notes', async () =>
            await transposeTest('dead-notes', -4, ':4 0.6{x} 0.5{x} (0.6{x} 0.5{x} 0.4{x}) 3.5'));
        it('trills', async () => await transposeTest('trills', -6, ':2 5.3{tr 7 16} 7.2{tr 8 16}'));
        it('ukulele', async () => await transposeTest('ukulele', -6, ':4 2.1 0.2 0.3 0.4', '\\tuning A4 E4 C4 G4'));
        it('bass', async () => await transposeTest('bass', -1, ':4 0.3 0.4 3.4 5.4', '\\tuning G2 D2 A1 E1'));
        it('capo', async () => await transposeTest('capo', 3, ':4 20.1 15.2 3.3 0.6', '\\capo 2'));
        it('grace-notes', async () => await transposeTest('grace-notes', -4, ':4 2.3{ss} {gr ob} 4.3 3.3 3.3'));
        it('repeated-bars', async () =>
            await transposeTest('repeated-bars', -4, ':4 3.5 2.4 0.3 2.4 | 3.5 2.4 0.3 2.4'));
        it('multi-voice', async () =>
            await transposeTest('multi-voice', -4, '\\voice :4 0.1 0.1 0.2 0.2 \\voice :4 1.2 1.2 0.3 0.3'));
    });
});
