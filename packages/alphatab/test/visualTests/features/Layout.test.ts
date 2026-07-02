import { describe, it } from 'vitest';
import { LayoutMode } from '@coderline/alphatab/LayoutMode';
import { Settings } from '@coderline/alphatab/Settings';
import { VisualTestHelper, VisualTestOptions, VisualTestRun } from 'test/visualTests/VisualTestHelper';

describe('LayoutTests', () => {
    it('page-layout', async () => {
        await VisualTestHelper.runVisualTest('layout/page-layout.gp');
    });

    it('page-layout-justify-last-row', async () => {
        const settings = new Settings();
        settings.display.justifyLastSystem = true;

        await VisualTestHelper.runVisualTestFull(
            await VisualTestOptions.file(
                'layout/page-layout.gp',
                [new VisualTestRun(-1, 'test-data/visual-tests/layout/page-layout-justify-last-row.png')],
                settings
            )
        );
    });

    it('multi-track', async () => {
        await VisualTestHelper.runVisualTest('layout/multi-track.gp', undefined, o => {
            o.tracks = [0, 3];
        });
    });

    it('multi-voice', async () => {
        await VisualTestHelper.runVisualTest('layout/multi-voice.gp');
    });

    it('page-layout-5barsperrow', async () => {
        const settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;
        settings.display.barsPerRow = 5;
        await VisualTestHelper.runVisualTest('layout/page-layout-5barsperrow.gp', settings);
    });

    it('page-layout-bar5to8', async () => {
        const settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;
        settings.display.startBar = 5;
        settings.display.barCount = 4;
        await VisualTestHelper.runVisualTest('layout/page-layout-5to8.gp', settings);
    });

    it('horizontal-layout', async () => {
        const settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Horizontal;
        await VisualTestHelper.runVisualTest('layout/horizontal-layout.gp', settings);
    });

    it('horizontal-layout-bar5to8', async () => {
        const settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Horizontal;
        settings.display.startBar = 5;
        settings.display.barCount = 4;
        await VisualTestHelper.runVisualTest('layout/horizontal-layout-5to8.gp', settings);
    });

    it('brackets-braces-none', async () => {
        const settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTest('layout/brackets-braces-none.gp', settings, o => {
            o.tracks = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        });
    });

    it('brackets-braces-similar', async () => {
        const settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTest('layout/brackets-braces-similar.gp', settings, o => {
            o.tracks = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        });
    });

    it('brackets-braces-staves', async () => {
        const settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTest('layout/brackets-braces-staves.gp', settings, o => {
            o.tracks = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        });
    });

    it('brackets-braces-system-divider', async () => {
        const settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTest('layout/system-divider.gp', settings, o => {
            o.tracks = [0, 1];
        });
    });

    it('track-names-full-name-all', async () => {
        const settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTest('layout/track-names-full-name-all.gp', settings);
    });

    it('track-names-full-name-short-name', async () => {
        const settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTest('layout/track-names-full-name-short-name.gp', settings);
    });

    it('track-names-full-name-horizontal', async () => {
        const settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTest('layout/track-names-full-name-horizontal.gp', settings);
    });

    it('track-names-first-system', async () => {
        const settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTest('layout/track-names-first-system.gp', settings);
    });

    it('track-names-all-systems-multi', async () => {
        const settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTest('layout/track-names-all-systems-multi.gp', settings, o => {
            o.tracks = [0, 1];
        });
    });

    it('inline-tuning-first-system', async () => {
        const settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTestTex(
            `
            \\tuningDisplayMode staff
            \\track { defaultSystemsLayout 2 }
            \\staff { tabs }
            0.6.4 2.6.4 3.6.4 0.5.4 |
            2.5.4 3.5.4 0.4.4 2.4.4 |
            3.4.4 0.3.4 2.3.4 3.3.4 |
            0.2.4 1.2.4 3.2.4 0.1.4 |
        `,
            'test-data/visual-tests/layout/inline-tuning-first-system.png',
            settings
        );
    });

    it('inline-tuning-with-bracket', async () => {
        const settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTestTex(
            `
            \\tuningDisplayMode staff
            \\bracketExtendMode groupsimilarinstruments
            \\track "Guitar 1"
            \\staff { tabs }
            0.6.4 2.6.4 3.6.4 0.5.4 |
            \\track "Guitar 2"
            \\staff { tabs }
            0.6.4 2.6.4 3.6.4 0.5.4 |
        `,
            'test-data/visual-tests/layout/inline-tuning-with-bracket.png',
            settings,
            o => {
                o.tracks = [0, 1];
            }
        );
    });

    it('inline-tuning-seven-string', async () => {
        const settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTestTex(
            `
            \\tuningDisplayMode staff
            \\tuning E4 B3 G3 D3 A2 E2 B1
            \\staff { tabs }
            0.7.4 2.7.4 3.7.4 0.6.4 |
        `,
            'test-data/visual-tests/layout/inline-tuning-seven-string.png',
            settings
        );
    });

    it('inline-tuning-per-track-hidden', async () => {
        const settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTestTex(
            `
            \\tuningDisplayMode staff
            \\track "Guitar"
            \\staff { tabs }
            0.6.4 2.6.4 3.6.4 0.5.4 |
            \\track "Bass"
            \\staff { tabs }
            \\tuning E2 A1 D2 G2 hide
            0.4.4 2.4.4 3.4.4 0.3.4 |
        `,
            'test-data/visual-tests/layout/inline-tuning-per-track-hidden.png',
            settings,
            o => {
                o.tracks = [0, 1];
            }
        );
    });

    it('system-layout-tex', async () => {
        const settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track { defaultSystemsLayout 3 }
            \\scale 0.25 :1 c4 | \\scale 0.5 c4 | \\scale 0.25 c4 | 
            \\scale 0.5 c4 | \\scale 2 c4 | \\scale 0.5 c4 |
            c4 | c4  
        `,
            'test-data/visual-tests/layout/system-layout-tex.png',
            settings
        );
    });

    it('multibar-rests-single-track', async () => {
        await VisualTestHelper.runVisualTest('layout/multibar-rest.gp', undefined, o => {
            o.tracks = [0];
            o.runs[0].referenceFileName = 'test-data/visual-tests/layout/multibar-rest-single-track.png';
        });
    });

    it('multibar-rests-multi-track', async () => {
        await VisualTestHelper.runVisualTest('layout/multibar-rest.gp', undefined, o => {
            o.tracks = [0, 1];
            o.runs[0].referenceFileName = 'test-data/visual-tests/layout/multibar-rest-multi-track.png';
        });
    });

    it('multibar-rests-all-tracks', async () => {
        await VisualTestHelper.runVisualTest('layout/multibar-rest.gp', undefined, o => {
            o.tracks = [0, 1, 2];
            o.runs[0].referenceFileName = 'test-data/visual-tests/layout/multibar-rest-all-tracks.png';
        });
    });

    it('extended-barlines', async () => {
        await VisualTestHelper.runVisualTest('layout/extended-barlines.xml', undefined, o => {
            o.score.stylesheet.extendBarLines = true;
            o.tracks = [0, 1];
        });
    });

    it('multi-system-slur-scale-down', async () => {
        await VisualTestHelper.runVisualTestTex(
            `
            C4 {slur S1} 
            | r| r| r| r| r| r| r| r| r| r| r| r| r| r| r| r| r| r| r| r| r| r
            A4 {slur S1} 
            `,
            '',
            undefined,
            o => {
                o.score.stylesheet.extendBarLines = true;
                o.runs = [
                    new VisualTestRun(1300, 'test-data/visual-tests/layout/multi-system-slur-scale-down-0-1300.png'),
                    new VisualTestRun(600, 'test-data/visual-tests/layout/multi-system-slur-scale-down-1-600.png'),
                    new VisualTestRun(300, 'test-data/visual-tests/layout/multi-system-slur-scale-down-2-300.png'),
                    new VisualTestRun(300, 'test-data/visual-tests/layout/multi-system-slur-scale-down-3-700.png')
                ];
            }
        );
    });

    it('multi-system-slur-scale-up', async () => {
        await VisualTestHelper.runVisualTestTex(
            `
            C4 {slur S1} 
            | r| r| r| r| r| r| r| r| r| r| r| r| r| r| r| r| r| r| r| r| r| r
            A4 {slur S1} 
            `,
            '',
            undefined,
            o => {
                o.score.stylesheet.extendBarLines = true;
                o.runs = [
                    new VisualTestRun(600, 'test-data/visual-tests/layout/multi-system-slur-scale-up-0-600.png'),
                    new VisualTestRun(1300, 'test-data/visual-tests/layout/multi-system-slur-scale-up-1-1300.png'),
                    new VisualTestRun(700, 'test-data/visual-tests/layout/multi-system-slur-scale-up-2-700.png'),
                    new VisualTestRun(300, 'test-data/visual-tests/layout/multi-system-slur-scale-up-3-300.png')
                ];
            }
        );
    });

    it('hide-empty-staves', async () => {
        await VisualTestHelper.runVisualTestTex(
            `
            \\hideEmptyStaves
            \\defaultSystemsLayout 3
            \\multiTrackTrackNamePolicy allSystems
            \\track "T1"
            C4.4 *4 | r.1 | r.1 |
                r.1 | r.1 | r.1 |
                r.1 | r.1 | r.1 | 
                r.1 | r.1 | r.1 |  
                r.1 | C4 |
            
            \\track "T2"
            \\clef C3
                r.1 | r.1 | r.1 | 
                r.1 | r.1 | r.1 | 
                r.1 | c4 | r.1 | 
                r.1 | r.1 | r.1 | 
                r.1 | C4 |
            `,
            'test-data/visual-tests/layout/hide-empty-staves.png',
            undefined,
            o => {
                o.tracks = o.score.tracks.map(t => t.index);
                o.settings.display.layoutMode = LayoutMode.Parchment;
            }
        );
    });

    it('hide-empty-staves-in-first', async () => {
        await VisualTestHelper.runVisualTestTex(
            `
            \\hideEmptyStaves
            \\hideEmptyStavesInFirstSystem

            \\defaultSystemsLayout 3
            \\multiTrackTrackNamePolicy allSystems
            \\track "T1"
            C4.4 *4 | r.1 | r.1 |
                r.1 | r.1 | r.1 |
                r.1 | r.1 | r.1 | 
                r.1 | r.1 | r.1 |  
                r.1 | C4 |
            
            \\track "T2"
            \\clef C3
                r.1 | r.1 | r.1 | 
                r.1 | r.1 | r.1 | 
                r.1 | c4 | r.1 | 
                r.1 | r.1 | r.1 | 
                r.1 | C4 |
            `,
            'test-data/visual-tests/layout/hide-empty-staves-in-first.png',
            undefined,
            o => {
                o.tracks = o.score.tracks.map(t => t.index);
                o.settings.display.layoutMode = LayoutMode.Parchment;
            }
        );
    });

    it('single-staff-brackets', async () => {
        await VisualTestHelper.runVisualTestTex(
            `
            \\hideEmptyStaves
            \\showSingleStaffBrackets
            \\defaultSystemsLayout 3
            \\multiTrackTrackNamePolicy allSystems
            \\track "T1"
            \\staff {score}
            C4.4 *4 | r.1 | r.1 |
                r.1 | r.1 | r.1 |
                r.1 | r.1 | r.1 | 
                r.1 | r.1 | r.1 |  
                r.1 | C4 |
            \\staff {score}
                \\clef C3
                r.1 | r.1 | r.1 | 
                r.1 | r.1 | r.1 | 
                r.1 | c4 | r.1 | 
                r.1 | r.1 | r.1 | 
                r.1 | C4 |
            `,
            'test-data/visual-tests/layout/single-staff-brackets-show.png',
            undefined,
            o => {
                o.tracks = o.score.tracks.map(t => t.index);
                o.settings.display.layoutMode = LayoutMode.Parchment;
            }
        );

        await VisualTestHelper.runVisualTestTex(
            `
            \\hideEmptyStaves
            \\defaultSystemsLayout 3
            \\multiTrackTrackNamePolicy allSystems
            \\track "T1"
            \\staff {score}
            C4.4 *4 | r.1 | r.1 |
                r.1 | r.1 | r.1 |
                r.1 | r.1 | r.1 | 
                r.1 | r.1 | r.1 |  
                r.1 | C4 |
            \\staff {score}
                \\clef C3
                r.1 | r.1 | r.1 | 
                r.1 | r.1 | r.1 | 
                r.1 | c4 | r.1 | 
                r.1 | r.1 | r.1 | 
                r.1 | C4 |
            `,
            'test-data/visual-tests/layout/single-staff-brackets-hide.png',
            undefined,
            o => {
                o.tracks = o.score.tracks.map(t => t.index);
                o.settings.display.layoutMode = LayoutMode.Parchment;
            }
        );
    });

    // §G.5 — Mid-system visibility flip: hideEmptyStaves + multi-staff where a
    // staff is invisible at the start of a system but a later bar in the same
    // system has content and flips it visible. The v5 §G.5 invariant requires
    // `_calculateAccoladeSpacing` to recompute when this flip happens so the
    // brace and per-staff Y positions reflect the post-flip visibility. Closes
    // B.5 (firstVisibleStaff first-call-only) and B.23 (staff.height locked too
    // early). System 2 (bars 5-8) flips staff 2 visible at bar 8.
    it('ghost-staff-visibility', async () => {
        await VisualTestHelper.runVisualTestTex(
            `
            \\hideEmptyStaves
            \\defaultSystemsLayout 4
            \\track "T1"
            \\staff {score}
            C4.4 *4 | r.1 | r.1 | r.1 |
                r.1 | r.1 | r.1 | r.1 |
                C4.1 |
            \\staff {score}
                \\clef C3
                r.1 | r.1 | r.1 | r.1 |
                r.1 | r.1 | r.1 | c4.1 |
                r.1 |
            `,
            'test-data/visual-tests/layout/ghost-staff-visibility.png',
            undefined,
            o => {
                o.tracks = o.score.tracks.map(t => t.index);
                o.settings.display.layoutMode = LayoutMode.Parchment;
            }
        );
    });

    // §G.7 — Accolade reflects post-add visibility: multi-track score where one
    // track has content only on specific bars. The brace must scale to cover
    // visible staves on each system; on systems where a track's bars are all
    // rests, `hideEmptyStaves` makes its staff invisible and the brace shrinks.
    // The visibility-fingerprint gate triggers the recompute that produces the
    // correct accolade width per system.
    it('accolade-on-revert', async () => {
        await VisualTestHelper.runVisualTestTex(
            `
            \\hideEmptyStaves
            \\showSingleStaffBrackets
            \\defaultSystemsLayout 3
            \\track "T1"
                C4.4 *4 | C4.4 *4 | C4.4 *4 |
                C4.4 *4 | C4.4 *4 | C4.4 *4
            \\track "T2"
                C4.4 *4 | C4.4 *4 | C4.4 *4 |
                r.1 | r.1 | r.1
            `,
            'test-data/visual-tests/layout/accolade-on-revert.png',
            undefined,
            o => {
                o.tracks = o.score.tracks.map(t => t.index);
                o.settings.display.layoutMode = LayoutMode.Parchment;
            }
        );
    });

    describe('barnumberdisplay', () => {
        describe('stylesheet', () => {
            it('all', async () =>
                await VisualTestHelper.runVisualTestTex(
                    `
                    \\defaultBarNumberDisplay allBars
                    C4.1 | C4.1 | C4.1 |
                    C4.1 | C4.1 | C4.1 
                    `,
                    'test-data/visual-tests/layout/barnumberdisplay-stylesheet-all.png',
                    undefined,
                    o => {
                        o.settings.display.layoutMode = LayoutMode.Parchment;
                    }
                ));
            it('first', async () =>
                await VisualTestHelper.runVisualTestTex(
                    `
                    \\defaultBarNumberDisplay firstOfSystem
                    C4.1 | C4.1 | C4.1 |
                    C4.1 | C4.1 | C4.1 
                    `,
                    'test-data/visual-tests/layout/barnumberdisplay-stylesheet-first.png',
                    undefined,
                    o => {
                        o.settings.display.layoutMode = LayoutMode.Parchment;
                    }
                ));
            it('hide', async () =>
                await VisualTestHelper.runVisualTestTex(
                    `
                    \\defaultBarNumberDisplay hide
                    C4.1 | C4.1 | C4.1 |
                    C4.1 | C4.1 | C4.1 
                    `,
                    'test-data/visual-tests/layout/barnumberdisplay-stylesheet-hide.png',
                    undefined,
                    o => {
                        o.settings.display.layoutMode = LayoutMode.Parchment;
                    }
                ));
        });

        describe('bar-override', () => {
            it('all', async () =>
                await VisualTestHelper.runVisualTestTex(
                    `
                    \\defaultBarNumberDisplay allBars
                    C4.1 | \\barNumberDisplay hide C4.1 | C4.1 |
                    C4.1 | C4.1 | C4.1 
                    `,
                    'test-data/visual-tests/layout/barnumberdisplay-bar-override-all.png',
                    undefined,
                    o => {
                        o.settings.display.layoutMode = LayoutMode.Parchment;
                    }
                ));
            it('first', async () =>
                await VisualTestHelper.runVisualTestTex(
                    `
                    \\defaultBarNumberDisplay firstOfSystem
                    C4.1 | \\barNumberDisplay allBars C4.1 | C4.1 |
                    \\barNumberDisplay hide C4.1 | C4.1 | C4.1 
                    `,
                    'test-data/visual-tests/layout/barnumberdisplay-bar-override-first.png',
                    undefined,
                    o => {
                        o.settings.display.layoutMode = LayoutMode.Parchment;
                    }
                ));
            it('hide', async () =>
                await VisualTestHelper.runVisualTestTex(
                    `
                    \\defaultBarNumberDisplay hide
                    C4.1 | \\barNumberDisplay allBars C4.1 | C4.1 |
                    \\barNumberDisplay firstOfSystem C4.1 | \\barNumberDisplay firstOfSystem C4.1 | C4.1 
                    `,
                    'test-data/visual-tests/layout/barnumberdisplay-bar-override-hide.png',
                    undefined,
                    o => {
                        o.settings.display.layoutMode = LayoutMode.Parchment;
                    }
                ));
        });
    });
});
