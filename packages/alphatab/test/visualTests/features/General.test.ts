import { describe, expect, it } from 'vitest';
import { StaveProfile } from '@coderline/alphatab/StaveProfile';
import { TabRhythmMode } from '@coderline/alphatab/NotationSettings';
import { Settings } from '@coderline/alphatab/Settings';
import { VisualTestHelper } from 'test/visualTests/VisualTestHelper';
import { TestPlatform } from 'test/TestPlatform';
import { Logger } from '@coderline/alphatab/Logger';
import { BarStyle, BarSubElement } from '@coderline/alphatab/model/Bar';
import { BeatStyle, BeatSubElement } from '@coderline/alphatab/model/Beat';
import { Color } from '@coderline/alphatab/model/Color';
import { NoteStyle, NoteSubElement } from '@coderline/alphatab/model/Note';
import { type Score, ScoreStyle, ScoreSubElement } from '@coderline/alphatab/model/Score';
import { TrackStyle, TrackSubElement } from '@coderline/alphatab/model/Track';
import { VoiceStyle, VoiceSubElement } from '@coderline/alphatab/model/Voice';

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

    it('colors-partial-staff-lines', async () => {
        const bar = ':4 3.3 5.3 7.3 8.3';
        await VisualTestHelper.runVisualTestTex(
            `\\track \\staff {score tabs} ${[bar, bar, bar, bar, bar, bar].join(' | ')}`,
            'test-data/visual-tests/general/colors-partial-staff-lines.png',
            undefined,
            o => {
                const bars = o.score.tracks[0].staves[0].bars;

                // a style without staff-line entries keeps the default staff-line colour
                bars[1].style = new BarStyle();
                bars[1].style.colors.set(BarSubElement.StandardNotationBarNumber, Color.fromJson('#00AA00')!);

                // adjacent bars with the same colour
                for (const b of [bars[2], bars[3]]) {
                    b.style = new BarStyle();
                    b.style.colors.set(BarSubElement.StandardNotationStaffLine, Color.fromJson('#DD0000')!);
                    b.style.colors.set(BarSubElement.GuitarTabsStaffLine, Color.fromJson('#DD0000')!);
                }

                // standard notation coloured with equal colours of separate styles, tab lines default
                for (const b of [bars[4], bars[5]]) {
                    b.style = new BarStyle();
                    b.style.colors.set(BarSubElement.StandardNotationStaffLine, Color.fromJson('#0000DD')!);
                }
            }
        );
    });

    it('colors-partial-bar-style', async () => {
        const voice1 = ':4 0.6 3.6 0.5 2.5';
        const voice2 = ':2 0.1 3.1';
        const settings = new Settings();
        // a barline colour distinct from the glyph colour keeps the default barline colour recognisable
        settings.display.resources.barSeparatorColor = Color.fromJson('#0080C0')!;
        await VisualTestHelper.runVisualTestTex(
            `\\defaultBarNumberDisplay allBars \\track \\staff {score tabs} \\voice ${[voice1, voice1, voice1, voice1].join(' | ')} \\voice ${[voice2, voice2, voice2, voice2].join(' | ')}`,
            'test-data/visual-tests/general/colors-partial-bar-style.png',
            settings,
            o => {
                const bars = o.score.tracks[0].staves[0].bars;

                // only staff lines coloured: barlines and bar number keep their default colours
                bars[1].style = new BarStyle();
                bars[1].style.colors.set(BarSubElement.StandardNotationStaffLine, Color.fromJson('#DD0000')!);
                bars[1].style.colors.set(BarSubElement.GuitarTabsStaffLine, Color.fromJson('#DD0000')!);

                // only the bar number coloured: staff lines, ledger lines and barlines keep their default colours
                bars[2].style = new BarStyle();
                bars[2].style.colors.set(BarSubElement.StandardNotationBarNumber, Color.fromJson('#00AA00')!);

                // only the tab barline coloured, and a voice style without entries: the standard notation
                // barline and the second voice keep their default colours
                bars[3].style = new BarStyle();
                bars[3].style.colors.set(BarSubElement.GuitarTabsBarLines, Color.fromJson('#00AA00')!);
                bars[3].voices[1].style = new VoiceStyle();
            }
        );
    });

    it('colors-voice-cascade', async () => {
        const flagsAndBeams = ':8 0.6{dy f} 3.6 0.5 2.5 :16 0.6 3.6 0.5 2.5 :8 0.6 r';
        const tuplet = ':8 0.6{tu 3 dy mf} 3.6{tu 3} 0.5{tu 3} :8 2.5 2.5 :4 0.6 3.6';
        const overriddenTuplet = ':8 0.6{tu 3 dy ff} 3.6{tu 3} 0.5{tu 3} :8 2.5 2.5 :4 0.6 3.6';
        const voice2 = ':2 0.1 3.1{dy p}';
        const settings = new Settings();
        settings.notation.rhythmMode = TabRhythmMode.ShowWithBars;
        await VisualTestHelper.runVisualTestTex(
            `\\track \\staff {score tabs slash numbered} \\voice ${flagsAndBeams} | ${tuplet} | ${overriddenTuplet} \\voice ${voice2} | ${voice2} | ${voice2}`,
            'test-data/visual-tests/general/colors-voice-cascade.png',
            settings,
            o => {
                const bars = o.score.tracks[0].staves[0].bars;

                // stems, beams, flags, tuplets and effects follow the voice colour; bar elements such as the
                // numbered key signature and the bar number keep their default colours
                for (const b of bars) {
                    b.voices[0].style = new VoiceStyle();
                    b.voices[0].style.colors.set(VoiceSubElement.Glyphs, Color.fromJson('#0000DD')!);
                    b.voices[1].style = new VoiceStyle();
                    b.voices[1].style.colors.set(VoiceSubElement.Glyphs, Color.fromJson('#00AA00')!);
                }

                // the entries of a beat win over the voice colour
                const overridden: BeatSubElement[] = [
                    BeatSubElement.StandardNotationStem,
                    BeatSubElement.StandardNotationBeams,
                    BeatSubElement.StandardNotationTuplet,
                    BeatSubElement.GuitarTabStem,
                    BeatSubElement.GuitarTabBeams,
                    BeatSubElement.GuitarTabTuplet,
                    BeatSubElement.SlashStem,
                    BeatSubElement.SlashBeams,
                    BeatSubElement.SlashTuplet,
                    BeatSubElement.NumberedDuration,
                    BeatSubElement.NumberedTuplet,
                    BeatSubElement.Effects
                ];
                const beat = bars[2].voices[0].beats[0];
                beat.style = new BeatStyle();
                for (const element of overridden) {
                    beat.style.colors.set(element, Color.fromJson('#DD0000')!);
                }
            }
        );
    });

    it('colors-multi-system-slur', async () => {
        // every piece of a slur over several systems takes the colour of its voice: the first voice is
        // styled blue, the second voice keeps its default colour
        const settings = new Settings();
        settings.display.barsPerRow = 1;
        await VisualTestHelper.runVisualTestTex(
            '\\track \\staff {score} \\voice :1 3.3{slur s1} | 3.3 | 3.3 | 3.3{slur s1} \\voice :1 5.1{slur s2} | 5.1 | 5.1 | 5.1{slur s2}',
            'test-data/visual-tests/general/colors-multi-system-slur.png',
            settings,
            o => {
                for (const b of o.score.tracks[0].staves[0].bars) {
                    b.voices[0].style = new VoiceStyle();
                    b.voices[0].style.colors.set(VoiceSubElement.Glyphs, Color.fromJson('#0000DD')!);
                }
            }
        );
    });

    it('colors-tab-bend', async () => {
        // the bends of several notes on one beat take the voice colour like single bends: bar 1 shows the
        // default colours of both voices, bar 2 a blue first voice and a green second voice
        const voice1 = ':4 3.3{b (0 4)} (3.3{b (0 4)} 5.2{b (0 4)}) (3.3{b (0 4)} 5.2{b (0 4)} 5.1{b (0 4)}) r';
        const voice2 = ':4 r r r (7.5{b (0 4)} 7.4{b (0 4)})';
        await VisualTestHelper.runVisualTestTex(
            `\\track \\staff {tabs} \\voice ${voice1} | ${voice1} \\voice ${voice2} | ${voice2}`,
            'test-data/visual-tests/general/colors-tab-bend.png',
            undefined,
            o => {
                const bar = o.score.tracks[0].staves[0].bars[1];
                bar.voices[0].style = new VoiceStyle();
                bar.voices[0].style.colors.set(VoiceSubElement.Glyphs, Color.fromJson('#0000DD')!);
                bar.voices[1].style = new VoiceStyle();
                bar.voices[1].style.colors.set(VoiceSubElement.Glyphs, Color.fromJson('#00AA00')!);
            }
        );
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

            expect(coloredDuration - defaultDuration).toBeLessThan(120);

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
