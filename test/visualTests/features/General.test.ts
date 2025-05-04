import { StaveProfile } from '@src/StaveProfile';
import { Settings } from '@src/Settings';
import { VisualTestHelper } from '@test/visualTests/VisualTestHelper';
import { TestPlatform } from '@test/TestPlatform';
import { expect } from 'chai';
import { Logger } from '@src/Logger';
import { BarStyle, BarSubElement } from '@src/model/Bar';
import { BeatStyle, BeatSubElement } from '@src/model/Beat';
import { Color } from '@src/model/Color';
import { NoteStyle, NoteSubElement } from '@src/model/Note';
import { type Score, ScoreStyle, ScoreSubElement } from '@src/model/Score';
import { TrackStyle, TrackSubElement } from '@src/model/Track';
import { VoiceStyle, VoiceSubElement } from '@src/model/Voice';

describe('GeneralTests', () => {
    it('song-details', async () => {
        await VisualTestHelper.runVisualTest('general/song-details.gp');
    });

    it('repeats', async () => {
        const settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Score;
        await VisualTestHelper.runVisualTest('general/repeats.gp', settings);
    });

    it('alternate-endings', async () => {
        const settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Score;
        await VisualTestHelper.runVisualTest('general/alternate-endings.gp', settings);
    });

    it('tuning', async () => {
        await VisualTestHelper.runVisualTest('general/tuning.gp');
    });

    function enableColoring(score: Score) {
        const shuffledHues = [
            0.38, 0.88, 0.04, 0, 0.08, 0.36, 0.48, 0.94, 0.64, 0.72, 0.76, 0.34, 0.44, 0.02, 0.56, 0.1, 0.7, 0.66, 0.96,
            0.68, 0.16, 0.5, 0.46, 0.3, 0.4, 0.26, 0.92, 0.2, 0.24, 0.42, 0.58, 0.74, 0.8, 0.84, 0.22, 0.32, 0.28, 0.12,
            0.9, 0.18, 0.14, 0.54, 0.6, 0.62, 0.86, 0.52, 0.78, 0.82, 0.06, 0.98
        ];
        let hueIndex = 0;
        let saturation = 1;
        let lightness = 0.5;

        function hueToRgb(p: number, q: number, t: number) {
            if (t < 0) {
                t += 1;
            }
            if (t > 1) {
                t -= 1;
            }
            if (t < 1 / 6) {
                return p + (q - p) * 6 * t;
            }
            if (t < 1 / 2) {
                return q;
            }
            if (t < 2 / 3) {
                return p + (q - p) * (2 / 3 - t) * 6;
            }
            return p;
        }

        function randomColor() {
            hueIndex++;
            if (hueIndex >= shuffledHues.length) {
                hueIndex = 0;
                saturation -= 0.05;

                if (saturation <= 0) {
                    saturation = 1;
                    lightness -= 0.05;

                    if (lightness < 0) {
                        lightness = 0.5;
                    }
                }
            }

            const h = shuffledHues[hueIndex];
            const q = lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation;
            const p = 2 * lightness - q;
            const r = hueToRgb(p, q, h + 1 / 3);
            const g = hueToRgb(p, q, h);
            const b = hueToRgb(p, q, h - 1 / 3);

            return new Color((r * 255) | 0, (g * 255) | 0, (b * 255) | 0);
        }

        score.style = new ScoreStyle();
        for (const k of TestPlatform.enumValues<ScoreSubElement>(ScoreSubElement)) {
            score.style.colors.set(k, randomColor());
        }

        for (const t of score.tracks) {
            t.style = new TrackStyle();
            for (const k of TestPlatform.enumValues<TrackSubElement>(TrackSubElement)) {
                t.style.colors.set(k, randomColor());
            }

            for (const s of t.staves) {
                for (const bar of s.bars) {
                    bar.style = new BarStyle();
                    for (const k of TestPlatform.enumValues<BarSubElement>(BarSubElement)) {
                        if (typeof k === 'number') {
                            bar.style.colors.set(k, randomColor());
                        }
                    }

                    for (const v of bar.voices) {
                        v.style = new VoiceStyle();
                        for (const k of TestPlatform.enumValues<VoiceSubElement>(VoiceSubElement)) {
                            if (typeof k === 'number') {
                                v.style.colors.set(k, randomColor());
                            }
                        }

                        for (const b of v.beats) {
                            b.style = new BeatStyle();
                            for (const k of TestPlatform.enumValues<BeatSubElement>(BeatSubElement)) {
                                if (typeof k === 'number') {
                                    b.style.colors.set(k, randomColor());
                                }
                            }

                            for (const n of b.notes) {
                                n.style = new NoteStyle();
                                for (const k of TestPlatform.enumValues<NoteSubElement>(NoteSubElement)) {
                                    if (typeof k === 'number') {
                                        n.style.colors.set(k, randomColor());
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    it('colors', async () => {
        await VisualTestHelper.runVisualTest('general/colors.gp', undefined, o => {
            enableColoring(o.score);
        });
    });

    it('color-performance', async () => {
        // warm-up
        for (let i = 0; i < 5; i++) {
            await VisualTestHelper.runVisualTest('general/colors.gp', undefined, o => {
                enableColoring(o.score);
            });
        }

        for (let i = 0; i < 10; i++) {
            let coloredStart: number = 0;
            await VisualTestHelper.runVisualTest('general/colors.gp', undefined, o => {
                enableColoring(o.score);
                coloredStart = performance.now();
            });
            const coloredEnd = performance.now();

            let defaultStart: number = 0;

            await VisualTestHelper.runVisualTest('general/colors.gp', undefined, o => {
                o.runs[0].referenceFileName = 'test-data/visual-tests/general/colors-disabled.png';
                defaultStart = performance.now();
            });
            const defaultEnd = performance.now();

            const coloredDuration = coloredEnd - coloredStart;
            const defaultDuration = defaultEnd - defaultStart;

            expect(coloredDuration - defaultDuration).to.be.lessThan(120);

            Logger.info('Test-color-performance', 'Colored', i, coloredDuration);
            Logger.info('Test-color-performance', 'Default', i, defaultDuration);
        }
    });

    it('font-fallback', async () => {
        await VisualTestHelper.runVisualTestTex(
            `\\title "Normal ♮♯ 🎸"
            .
            \\track "Track 🎸"
            \\lyrics "Test Lyrics 🤘"
            (1.2 1.1).4 x.2.8 0.1 1.1 | 1.2 3.2 0.1 1.1`,
            'test-data/visual-tests/general/font-fallback.png'
        );
    });
});
