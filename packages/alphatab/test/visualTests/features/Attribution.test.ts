import { describe, it } from 'vitest';
import { SystemsLayoutMode } from '@coderline/alphatab/DisplaySettings';
import { LayoutMode } from '@coderline/alphatab/LayoutMode';
import { BarStyle, BarSubElement } from '@coderline/alphatab/model/Bar';
import { Color } from '@coderline/alphatab/model/Color';
import { Settings } from '@coderline/alphatab/Settings';
import { StaveProfile } from '@coderline/alphatab/StaveProfile';
import { VisualTestHelper, type VisualTestOptions, VisualTestRun } from 'test/visualTests/VisualTestHelper';

describe('AttributionTests', () => {
    // songs up to 10 bars are rendered without attribution
    const filler = ' | :4 r r r r'.repeat(10);

    const music = `
        \\tempo 120
        .
        :8 C4 D4 E4 F4 G4 A4 B4 C5 | C5 B4 A4 G4 F4 E4 D4 C4 |
        :4 E4 G4 C5 E5 | :2 (C4 E4 G4) (C5 E5 G5) |
        :8 G5 F5 E5 D5 C5 B4 A4 G4 | :1 C4 ${filler}
    `;

    function settings(): Settings {
        const s = new Settings();
        s.display.systemsLayoutMode = SystemsLayoutMode.UseModelLayout;
        return s;
    }

    /**
     * Puts `firstSystemBars` bars into the first system and the filler into the following ones.
     */
    function firstSystem(firstSystemBars: number[]): (o: VisualTestOptions) => void {
        return o => {
            o.score.systemsLayout = firstSystemBars;
            o.score.defaultSystemsLayout = 10;
            for (const t of o.score.tracks) {
                t.systemsLayout = firstSystemBars;
                t.defaultSystemsLayout = 10;
            }
        };
    }

    it('default', async () => {
        await VisualTestHelper.runVisualTestTex(
            music,
            'test-data/visual-tests/attribution/default.png',
            settings(),
            firstSystem([3, 3])
        );
    });

    it('rerender-identical-pixels', async () => {
        await VisualTestHelper.runVisualTestTex(
            music,
            'test-data/visual-tests/attribution/default.png',
            settings(),
            o => {
                firstSystem([3, 3])(o);
                o.runs = [
                    new VisualTestRun(1300, 'test-data/visual-tests/attribution/default.png'),
                    new VisualTestRun(1300, 'test-data/visual-tests/attribution/default.png')
                ];
            }
        );
    });

    it('short-song-without-attribution', async () => {
        await VisualTestHelper.runVisualTestTex(
            ':4 C4 D4 E4 F4 | G4 A4 B4 C5',
            'test-data/visual-tests/attribution/short-song-without-attribution.png'
        );
    });

    it('short-song-three-tracks', async () => {
        await VisualTestHelper.runVisualTestTex(
            `
            \\track "Flute"
            :4 C5 D5 E5 F5 | G5 A5 B5 C6
            \\track "Piano"
            :4 C4 E4 G4 C5 | :1 (C4 E4 G4)
            \\track "Bass"
            :4 C3 D3 E3 F3 | G3 A3 B3 C3
        `,
            'test-data/visual-tests/attribution/short-song-three-tracks.png',
            undefined,
            o => {
                o.tracks = [0, 1, 2];
            }
        );
    });

    it('high-ink-last-bar', async () => {
        await VisualTestHelper.runVisualTestTex(
            `:4 C4 D4 E4 F4 | :16 C6 D6 E6 F6 G6 A6 B6 C7 C7 B6 A6 G6 F6 E6 D6 C6 ${filler}`,
            'test-data/visual-tests/attribution/high-ink-last-bar.png',
            settings(),
            firstSystem([2])
        );
    });

    it('repeat-count', async () => {
        await VisualTestHelper.runVisualTestTex(
            `:4 C4 D4 E4 F4 | \\ro \\rc 3 G4 A4 B4 C5 ${filler}`,
            'test-data/visual-tests/attribution/repeat-count.png',
            settings(),
            firstSystem([2])
        );
    });

    it('directions-and-tempo', async () => {
        await VisualTestHelper.runVisualTestTex(
            `:4 C4 D4 E4 F4 | \\jump DaCapoAlFine \\tempo 90 G4 A4 B4 C5 ${filler}`,
            'test-data/visual-tests/attribution/directions-and-tempo.png',
            settings(),
            firstSystem([2])
        );
    });

    it('narrow-last-bar', async () => {
        const s = new Settings();
        s.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTestTex(
            `:4 C4 D4 E4 F4 | :4 r r r r ${filler}`,
            'test-data/visual-tests/attribution/narrow-last-bar.png',
            s,
            o => {
                firstSystem([2])(o);
                o.score.masterBars[0].displayScale = 25;
                o.score.tracks[0].staves[0].bars[0].displayScale = 25;
            }
        );
    });

    it('tab-only', async () => {
        const s = settings();
        s.display.staveProfile = StaveProfile.Tab;
        await VisualTestHelper.runVisualTestTex(
            `:8 0.6 2.5 2.4 1.3 0.2 0.1 3.1 0.1 | :4 (0.1 1.2 0.3 2.4 3.5 0.6) ${filler}`,
            'test-data/visual-tests/attribution/tab-only.png',
            s,
            firstSystem([2])
        );
    });

    it('numbered', async () => {
        await VisualTestHelper.runVisualTestTex(
            `\\staff {numbered} :4 C4 D4 E4 F4 | G4 A4 B4 C5 ${filler}`,
            'test-data/visual-tests/attribution/numbered.png',
            settings(),
            firstSystem([2])
        );
    });

    it('multi-track', async () => {
        await VisualTestHelper.runVisualTestTex(
            `
            \\track "Piano"
            :4 C5 D5 E5 F5 | G5 A5 B5 C6 ${filler}
            \\track "Bass"
            :4 C3 D3 E3 F3 | G3 A3 B3 C3 ${filler}
        `,
            'test-data/visual-tests/attribution/multi-track.png',
            settings(),
            o => {
                firstSystem([2])(o);
                o.tracks = [0, 1];
            }
        );
    });

    it('horizontal', async () => {
        const s = new Settings();
        s.display.layoutMode = LayoutMode.Horizontal;
        s.display.barCountPerPartial = 3;
        await VisualTestHelper.runVisualTestTex(music, 'test-data/visual-tests/attribution/horizontal.png', s);
    });

    it('scale', async () => {
        const s = settings();
        s.display.scale = 1.5;
        await VisualTestHelper.runVisualTestTex(
            music,
            'test-data/visual-tests/attribution/scale.png',
            s,
            firstSystem([3, 3])
        );
    });

    it('theme-colors', async () => {
        const s = settings();
        s.display.resources.staffLineColor = Color.fromJson('#4A7FBF')!;
        await VisualTestHelper.runVisualTestTex(
            music,
            'test-data/visual-tests/attribution/theme-colors.png',
            s,
            firstSystem([3, 3])
        );
    });

    it('bar-style-staff-line-color', async () => {
        await VisualTestHelper.runVisualTestTex(
            `:4 C4 D4 E4 F4 | G4 A4 B4 C5 ${filler}`,
            'test-data/visual-tests/attribution/bar-style-staff-line-color.png',
            settings(),
            o => {
                firstSystem([2])(o);
                const bar = o.score.tracks[0].staves[0].bars[1];
                bar.style = new BarStyle();
                bar.style.colors.set(BarSubElement.StandardNotationStaffLine, Color.fromJson('#C04040')!);
            }
        );
    });
});
