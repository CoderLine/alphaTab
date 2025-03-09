import { StaveProfile } from '@src/StaveProfile';
import { Settings } from '@src/Settings';
import { VisualTestHelper, VisualTestOptions } from '@test/visualTests/VisualTestHelper';
import { TestPlatform } from '@test/TestPlatform';
import { ScoreLoader } from '@src/importer';
import {
    BarStyle,
    BarSubElement,
    BeatStyle,
    BeatSubElement,
    Color,
    NoteStyle,
    NoteSubElement,
    ScoreStyle,
    ScoreSubElement,
    TrackStyle,
    TrackSubElement,
    VoiceStyle,
    VoiceSubElement
} from '@src/model';
import { c } from 'node_modules/vite/dist/node/moduleRunnerTransport.d-CXw_Ws6P';

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

    it('colors', async () => {
        await VisualTestHelper.runVisualTest('general/colors.gp', undefined, o => {
            const shuffledHues = [
                0.38, 0.88, 0.04, 0, 0.08, 0.36, 0.48, 0.94, 0.64, 0.72, 0.76, 0.34, 0.44, 0.02, 0.56, 0.1, 0.7, 0.66,
                0.96, 0.68, 0.16, 0.5, 0.46, 0.3, 0.4, 0.26, 0.92, 0.2, 0.24, 0.42, 0.58, 0.74, 0.8, 0.84, 0.22, 0.32,
                0.28, 0.12, 0.9, 0.18, 0.14, 0.54, 0.6, 0.62, 0.86, 0.52, 0.78, 0.82, 0.06, 0.98
            ];
            let hi = 0;
            let s = 1;
            let l = 0.5;

            const hueToRgb = (p: number, q: number, t: number) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const randomColor = () => {
                hi++;
                if (hi > shuffledHues.length) {
                    hi = 0;
                    s -= 0.05;

                    if (s <= 0) {
                        s = 1;
                        l -= 0.05;

                        if (l < 0) {
                            l = 0.5;
                        }
                    }
                }

                const h = shuffledHues[hi];
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                const r = hueToRgb(p, q, h + 1 / 3);
                const g = hueToRgb(p, q, h);
                const b = hueToRgb(p, q, h - 1 / 3);

                return new Color((r * 255) | 0, (g * 255) | 0, (b * 255) | 0);
            };

            o.score.style = new ScoreStyle();
            for (const k of TestPlatform.enumValues<ScoreSubElement>(ScoreSubElement)) {
                o.score.style.colors.set(k, randomColor());
            }

            for (const t of o.score.tracks) {
                t.style = new TrackStyle();
                for (const k of TestPlatform.enumValues<TrackSubElement>(TrackSubElement)) {
                    t.style.colors.set(k, randomColor());
                }

                for (const s of t.staves) {
                    for (const b of s.bars) {
                        b.style = new BarStyle();
                        for (const k of TestPlatform.enumValues<BarSubElement>(BarSubElement)) {
                            if (typeof k === 'number') {
                                b.style.colors.set(k, randomColor());
                            }
                        }

                        for (const v of b.voices) {
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
        });
    });
});
