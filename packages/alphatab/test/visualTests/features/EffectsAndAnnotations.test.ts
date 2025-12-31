import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import { LayoutMode } from '@coderline/alphatab/LayoutMode';
import { BeatBarreEffectInfo } from '@coderline/alphatab/rendering/effects/BeatBarreEffectInfo';
import { Settings } from '@coderline/alphatab/Settings';
import { expect } from 'chai';
import { TestPlatform } from 'test/TestPlatform';
import { VisualTestHelper, VisualTestOptions, VisualTestRun } from 'test/visualTests/VisualTestHelper';

describe('EffectsAndAnnotationsTests', () => {
    it('markers', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/markers.gp');
    });

    it('tempo', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/tempo.gp');
    });

    it('tempo-text', async () => {
        await VisualTestHelper.runVisualTestTex(
            `
            \\tempo 90 "First"
            .
            :4 3.3*4 | 3.3 3.3 {v f tempo 120 "Other" } 3.3 6.3
        `,
            'test-data/visual-tests/effects-and-annotations/tempo-text.png'
        );
    });

    it('beat-tempo-change', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/beat-tempo-change.gp');
    });

    it('text', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/text.gp');
    });

    it('chords', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/chords.gp');
    });

    it('chords-duplicates', async () => {
        // This file was manually modified to contain 2 separate chords with the same details.
        await VisualTestHelper.runVisualTest('effects-and-annotations/chords-duplicates.gp');
    });

    it('vibrato', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/vibrato.gp');
    });

    it('dynamics', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/dynamics.gp');
    });

    it('tap', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/tap.gp');
    });

    it('fade-in', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/fade-in.gp');
    });

    it('fade', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/fade.gp');
    });

    it('let-ring', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/let-ring.gp');
    });

    it('palm-mute', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/palm-mute.gp');
    });

    it('bends', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/bends.gp');
    });

    it('tremolo-bar', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/tremolo-bar.gp');
    });

    it('tremolo-picking', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/tremolo-picking.gp');
    });

    it('brush', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/brush.gp');
    });

    it('slides', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/slides.gp');
    });

    it('slides-line-break', async () => {
        const tex = '14.1.2 :8 17.2 15.1 14.1{h} 17.2{ss} | 18.2';
        const settings = new Settings();
        settings.display.barsPerRow = 1;

        const score = ScoreLoader.loadAlphaTex(tex);

        await VisualTestHelper.runVisualTestFull(
            new VisualTestOptions(
                score,
                [new VisualTestRun(400, 'test-data/visual-tests/effects-and-annotations/slides-line-break.png')],
                settings
            )
        );
    });

    it('trill', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/trill.gp');
    });

    it('pickStroke', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/pick-stroke.gp');
    });

    it('tuplets', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/tuplets.gp');
    });

    it('tuplets-advanced', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/tuplets-advanced.gp', undefined, o => {
            o.tracks = [0, 1, 2];
        });
    });

    it('fingering', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/fingering.gp');
    });

    it('triplet-feel', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/triplet-feel.gp');
    });

    it('free-time', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/free-time.gp');
    });

    it('fingering-new', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/fingering-new.gp');
    });

    it('accentuations', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/accentuations.gp');
    });

    it('string-numbers', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/string-numbers.gp');
    });

    it('beat-slash', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/beat-slash.gp');
    });

    it('sustain-pedal', async () => {
        await VisualTestHelper.runVisualTestFull(
            await VisualTestOptions.file('effects-and-annotations/sustain.gp', [
                new VisualTestRun(1200, 'test-data/visual-tests/effects-and-annotations/sustain-1200.png'),
                new VisualTestRun(850, 'test-data/visual-tests/effects-and-annotations/sustain-850.png'),
                new VisualTestRun(600, 'test-data/visual-tests/effects-and-annotations/sustain-600.png')
            ])
        );
    });

    it('sustain-pedal-alphatex', async () => {
        const settings = new Settings();
        const score = ScoreLoader.loadAlphaTex(
            `
        \\tempo 120
        \\track "pno."
        :8 G4 { spd } G4 G4 { spu } G4 G4 { spd } G4 {spu} G4 G4 {spd} |
        G4 { spu } G4 G4 G4 G4 G4 G4 G4 |
        F5.1 { spd } | F5 | F5 |
        F5.4 F5.4 { spu } F5 F5 |
        G4.8 { spd } G4 G4 { spu } G4 G4 { spd } G4 G4 G4 {spu} |
        G4.4 G4.4 G4.4 {spd} G4.4 {spe}
        `,
            settings
        );
        score.stylesheet.hideDynamics = true;

        expect(score.tracks[0].staves[0].displayTranspositionPitch).to.equal(0);

        await VisualTestHelper.runVisualTestFull(
            new VisualTestOptions(
                score,
                [
                    new VisualTestRun(1200, 'test-data/visual-tests/effects-and-annotations/sustain-1200.png'),
                    new VisualTestRun(850, 'test-data/visual-tests/effects-and-annotations/sustain-850.png'),
                    new VisualTestRun(600, 'test-data/visual-tests/effects-and-annotations/sustain-600.png')
                ],
                settings
            )
        );
    });

    it('dead-slap', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/dead-slap.gp');
    });

    it('golpe', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/golpe.gp');
    });

    it('golpe-tab', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/golpe-tab.gp');
    });

    it('roman-numbers', () => {
        expect(BeatBarreEffectInfo.toRoman(0)).to.equal('');
        expect(BeatBarreEffectInfo.toRoman(1)).to.equal('I');
        expect(BeatBarreEffectInfo.toRoman(2)).to.equal('II');
        expect(BeatBarreEffectInfo.toRoman(3)).to.equal('III');
        expect(BeatBarreEffectInfo.toRoman(4)).to.equal('IV');
        expect(BeatBarreEffectInfo.toRoman(5)).to.equal('V');
        expect(BeatBarreEffectInfo.toRoman(6)).to.equal('VI');
        expect(BeatBarreEffectInfo.toRoman(7)).to.equal('VII');
        expect(BeatBarreEffectInfo.toRoman(8)).to.equal('VIII');
        expect(BeatBarreEffectInfo.toRoman(9)).to.equal('IX');
        expect(BeatBarreEffectInfo.toRoman(10)).to.equal('X');
        expect(BeatBarreEffectInfo.toRoman(11)).to.equal('XI');
        expect(BeatBarreEffectInfo.toRoman(12)).to.equal('XII');
        expect(BeatBarreEffectInfo.toRoman(13)).to.equal('XIII');
        expect(BeatBarreEffectInfo.toRoman(14)).to.equal('XIV');
        expect(BeatBarreEffectInfo.toRoman(15)).to.equal('XV');
        expect(BeatBarreEffectInfo.toRoman(16)).to.equal('XVI');
        expect(BeatBarreEffectInfo.toRoman(17)).to.equal('XVII');
        expect(BeatBarreEffectInfo.toRoman(18)).to.equal('XVIII');
        expect(BeatBarreEffectInfo.toRoman(19)).to.equal('XIX');
        expect(BeatBarreEffectInfo.toRoman(20)).to.equal('XX');
        expect(BeatBarreEffectInfo.toRoman(21)).to.equal('XXI');
        expect(BeatBarreEffectInfo.toRoman(22)).to.equal('XXII');
        expect(BeatBarreEffectInfo.toRoman(23)).to.equal('XXIII');
        expect(BeatBarreEffectInfo.toRoman(24)).to.equal('XXIV');
        expect(BeatBarreEffectInfo.toRoman(25)).to.equal('XXV');
        expect(BeatBarreEffectInfo.toRoman(26)).to.equal('XXVI');
        expect(BeatBarreEffectInfo.toRoman(27)).to.equal('XXVII');
        expect(BeatBarreEffectInfo.toRoman(28)).to.equal('XXVIII');
        expect(BeatBarreEffectInfo.toRoman(29)).to.equal('XXIX');
    });

    it('barre', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/barre.gp');
    });

    it('ornaments', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/ornaments.gp');
    });

    it('rasgueado', async () => {
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTest('effects-and-annotations/rasgueado.gp', settings);
    });

    it('bend-vibrato-default', async () => {
        const inputFileData = await TestPlatform.loadFile(
            'test-data/visual-tests/effects-and-annotations/bend-vibrato.gp'
        );
        const settings = new Settings();
        const score = ScoreLoader.loadScoreFromBytes(inputFileData, settings);

        await VisualTestHelper.runVisualTestFull(
            new VisualTestOptions(
                score,
                [new VisualTestRun(-1, 'test-data/visual-tests/effects-and-annotations/bend-vibrato-default.png')],
                settings
            )
        );
    });

    it('bend-vibrato-songbook', async () => {
        const inputFileData = await TestPlatform.loadFile(
            'test-data/visual-tests/effects-and-annotations/bend-vibrato.gp'
        );
        const settings = new Settings();
        settings.setSongBookModeSettings();
        const score = ScoreLoader.loadScoreFromBytes(inputFileData, settings);

        await VisualTestHelper.runVisualTestFull(
            new VisualTestOptions(
                score,
                [new VisualTestRun(-1, 'test-data/visual-tests/effects-and-annotations/bend-vibrato-songbook.png')],
                settings
            )
        );
    });

    it('directions-simple', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/directions-simple.gp');
    });

    it('directions-symbols', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/directions-symbols.gp');
    });

    it('timer', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/timer.gp');
    });

    it('legato', async () => {
        await VisualTestHelper.runVisualTestTex(
            '3.3.4{ legatoOrigin } 10.3.4',
            'test-data/visual-tests/effects-and-annotations/legato.png'
        );
    });

    it('inscore-chord-diagrams', async () => {
        await VisualTestHelper.runVisualTestTex(
            `
            \\chordDiagramsInScore true
            \\chord ("E" 0 0 1 2 2 0)
            \\chord ("C" 0 1 0 2 3 x)

            (0.1 0.2 1.3 2.4 2.5 0.6){ch "E"} r r r |
            (0.1 1.2 0.3 2.4 3.5){ch "C"} r r r |
            `,
            'test-data/visual-tests/effects-and-annotations/inscore-chord-diagrams.png'
        );
    });

    describe('tremolo-extended', async () => {
        function flagsTex(noteString: number) {
            return ['8', '16', '32']
                .map(
                    tp =>
                        `
                    // 1 bar
                    3.${noteString}.32 {beam split tp ${tp}} 
                    3.${noteString}.16 {beam split  tp ${tp}} 
                    3.${noteString}.8 {beam split  tp ${tp}} |

                    5.${noteString}.32 {beam split tp ${tp}} 
                    5.${noteString}.16 {beam split  tp ${tp}} 
                    5.${noteString}.8 {beam split  tp ${tp}} |

                    -21.${noteString}.32 {beam split tp ${tp}} 
                    -21.${noteString}.16 {beam split  tp ${tp}} 
                    -21.${noteString}.8 {beam split  tp ${tp}} |

                    -19.${noteString}.32 {beam split tp ${tp}} 
                    -19.${noteString}.16 {beam split  tp ${tp}} 
                    -19.${noteString}.8 {beam split  tp ${tp}} |

                    15.${noteString}.32 {beam split tp ${tp}} 
                    15.${noteString}.16 {beam split  tp ${tp}} 
                    15.${noteString}.8 {beam split  tp ${tp}} |

                    17.${noteString}.32 {beam split tp ${tp}} 
                    17.${noteString}.16 {beam split  tp ${tp}} 
                    17.${noteString}.8 {beam split  tp ${tp}} |
                    
                    39.${noteString}.32 {beam split tp ${tp}} 
                    39.${noteString}.16 {beam split  tp ${tp}} 
                    39.${noteString}.8 {beam split  tp ${tp}} |

                    41.${noteString}.32 {beam split tp ${tp}} 
                    41.${noteString}.16 {beam split  tp ${tp}} 
                    41.${noteString}.8 {beam split  tp ${tp}} |
                `
                )
                .join('\n');
        }

        it('flags-mixed', async () => {
            await VisualTestHelper.runVisualTestTex(
                `
                    \\track {defaultsystemslayout 8}
                    \\staff {score tabs numbered slash}
                    ${flagsTex(4)}
                `,
                'test-data/visual-tests/effects-and-annotations/tremolo-flags-mixed.png',
                undefined,
                o => {
                    o.settings.display.layoutMode = LayoutMode.Parchment;
                }
            );
        });

        it('flags-tab', async () => {
            await VisualTestHelper.runVisualTestTex(
                `
                    \\track {defaultsystemslayout 8}
                    \\staff {tabs}
                    ${flagsTex(4)}
                `,
                'test-data/visual-tests/effects-and-annotations/tremolo-flags.png',
                undefined,
                o => {
                    o.settings.display.layoutMode = LayoutMode.Parchment;
                }
            );
        });

        it('flags-tab-bottom', async () => {
            await VisualTestHelper.runVisualTestTex(
                `
                    \\track {defaultsystemslayout 8}
                    \\staff {tabs}
                    ${flagsTex(6)}
                `,
                'test-data/visual-tests/effects-and-annotations/tremolo-flags-bottom.png',
                undefined,
                o => {
                    o.settings.display.layoutMode = LayoutMode.Parchment;
                }
            );
        });
    });

    describe('tremolo-picking-extended', () => {
        async function test(tex: string, referenceFileName: string, configure?: (o: VisualTestOptions) => void) {
            await VisualTestHelper.runVisualTestTex(
                tex,
                `test-data/visual-tests/effects-and-annotations/${referenceFileName}.png`,
                undefined,
                configure
            );
        }

        describe('standard', () => {
            it('default-flags', async () =>
                await test(
                    `
                    \\staff {score slash}
                    C4.8 {tp 1} | C4.32 {tp 1} | 
                    C4.8 {tp 2} | C4.32 {tp 2} | 
                    C4.8 {tp 3} | C4.32 {tp 3} | 
                    C4.8 {tp 4} | C4.32 {tp 4} | 
                    C4.8 {tp 5} | C4.32 {tp 5} 
                `,
                    'standard-default-flags'
                ));

            it('default-beams', async () =>
                await test(
                    `
                    \\staff {score slash}
                    C4.8 {tp 1} C4.8 {tp 1} | C4.32 {tp 1} C4.32 {tp 1} | 
                    C4.8 {tp 2} C4.8 {tp 2} | C4.32 {tp 2} C4.32 {tp 2} | 
                    C4.8 {tp 3} C4.8 {tp 3} | C4.32 {tp 3} C4.32 {tp 3} | 
                    C4.8 {tp 4} C4.8 {tp 4} | C4.32 {tp 4} C4.32 {tp 4} | 
                    C4.8 {tp 5} C4.8 {tp 5} | C4.32 {tp 5} C4.32 {tp 5} 
                `,
                    'standard-default-beams'
                ));

            it('buzzroll-flags', async () =>
                await test(
                    `
                    \\staff {score slash}
                    C4.8 {tp (1 buzzRoll)} | C4.32 {tp (1 buzzRoll)} | 
                    C4.8 {tp (2 buzzRoll)} | C4.32 {tp (2 buzzRoll)} | 
                    C4.8 {tp (3 buzzRoll)} | C4.32 {tp (3 buzzRoll)} | 
                    C4.8 {tp (4 buzzRoll)} | C4.32 {tp (4 buzzRoll)} | 
                    C4.8 {tp (5 buzzRoll)} | C4.32 {tp (5 buzzRoll)} 
                `,
                    'standard-buzzroll-flags'
                ));

            it('buzzroll-beams', async () =>
                await test(
                    `
                    \\staff {score slash}
                    C4.8 {tp (1 buzzRoll)} C4.8 {tp (1 buzzRoll)} | C4.32 {tp (1 buzzRoll)} C4.32 {tp (1 buzzRoll)} | 
                    C4.8 {tp (2 buzzRoll)} C4.8 {tp (2 buzzRoll)} | C4.32 {tp (2 buzzRoll)} C4.32 {tp (2 buzzRoll)} | 
                    C4.8 {tp (3 buzzRoll)} C4.8 {tp (3 buzzRoll)} | C4.32 {tp (3 buzzRoll)} C4.32 {tp (3 buzzRoll)} | 
                    C4.8 {tp (4 buzzRoll)} C4.8 {tp (4 buzzRoll)} | C4.32 {tp (4 buzzRoll)} C4.32 {tp (4 buzzRoll)} | 
                    C4.8 {tp (5 buzzRoll)} C4.8 {tp (5 buzzRoll)} | C4.32 {tp (5 buzzRoll)} C4.32 {tp (5 buzzRoll)} 
                `,
                    'standard-buzzroll-beams'
                ));
        });
        describe('tabs', () => {
            it('default-flags', async () =>
                await test(
                    `
                    \\staff {tabs}
                    3.6.8 {tp 1} | 3.6.32 {tp 1} | 
                    3.6.8 {tp 2} | 3.6.32 {tp 2} | 
                    3.6.8 {tp 3} | 3.6.32 {tp 3} | 
                    3.6.8 {tp 4} | 3.6.32 {tp 4} |
                    3.6.8 {tp 5} | 3.6.32 {tp 5} 
                `,
                    'tabs-default-flags'
                ));

            it('default-beams', async () =>
                await test(
                    `
                    \\staff {tabs}
                    3.6.8 {tp 1} 3.6.8 {tp 1} | 3.6.32 {tp 1} 3.6.32 {tp 1} | 
                    3.6.8 {tp 2} 3.6.8 {tp 2} | 3.6.32 {tp 2} 3.6.32 {tp 2} | 
                    3.6.8 {tp 3} 3.6.8 {tp 3} | 3.6.32 {tp 3} 3.6.32 {tp 3} | 
                    3.6.8 {tp 4} 3.6.8 {tp 4} | 3.6.32 {tp 4} 3.6.32 {tp 4} | 
                    3.6.8 {tp 5} 3.6.8 {tp 5} | 3.6.32 {tp 5} 3.6.32 {tp 5} 
                `,
                    'tabs-default-beams'
                ));

            it('buzzroll-flags', async () =>
                await test(
                    `
                    \\staff {tabs}
                    3.6.8 {tp (1 buzzRoll)} | 3.6.32 {tp (1 buzzRoll)} | 
                    3.6.8 {tp (2 buzzRoll)} | 3.6.32 {tp (2 buzzRoll)} | 
                    3.6.8 {tp (3 buzzRoll)} | 3.6.32 {tp (3 buzzRoll)} | 
                    3.6.8 {tp (4 buzzRoll)} | 3.6.32 {tp (4 buzzRoll)} | 
                    3.6.8 {tp (5 buzzRoll)} | 3.6.32 {tp (5 buzzRoll)} 
                `,
                    'tabs-buzzroll-flags'
                ));

            it('buzzroll-beams', async () =>
                await test(
                    `
                    \\staff {tabs}
                    3.6.8 {tp (1 buzzRoll)} 3.6.8 {tp (1 buzzRoll)} | 3.6.32 {tp (1 buzzRoll)} 3.6.32 {tp (1 buzzRoll)} | 
                    3.6.8 {tp (2 buzzRoll)} 3.6.8 {tp (2 buzzRoll)} | 3.6.32 {tp (2 buzzRoll)} 3.6.32 {tp (2 buzzRoll)} | 
                    3.6.8 {tp (3 buzzRoll)} 3.6.8 {tp (3 buzzRoll)} | 3.6.32 {tp (3 buzzRoll)} 3.6.32 {tp (3 buzzRoll)} | 
                    3.6.8 {tp (4 buzzRoll)} 3.6.8 {tp (4 buzzRoll)} | 3.6.32 {tp (4 buzzRoll)} 3.6.32 {tp (4 buzzRoll)} | 
                    3.6.8 {tp (5 buzzRoll)} 3.6.8 {tp (5 buzzRoll)} | 3.6.32 {tp (5 buzzRoll)} 3.6.32 {tp (5 buzzRoll)} 
                `,
                    'tabs-buzzroll-beams'
                ));
        });
    });
});
