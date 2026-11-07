import { describe, it } from 'vitest';
import { LayoutMode } from '@coderline/alphatab/LayoutMode';
import { VisualTestHelper } from 'test/visualTests/VisualTestHelper';

describe('SpecialTracksTests', () => {
    it('drum-tabs', async () => {
        await VisualTestHelper.runVisualTest('special-tracks/drum-tabs.gp');
    });

    it('percussion', async () => {
        await VisualTestHelper.runVisualTest('special-tracks/percussion.gp', undefined, o => {
            o.tracks = [0, 1, 2];
        });
    });

    it('grand-staff', async () => {
        await VisualTestHelper.runVisualTest('special-tracks/grand-staff.gp');
    });

    it('slash', async () => {
        await VisualTestHelper.runVisualTest('special-tracks/slash.gp');
    });

    it('numbered', async () => {
        await VisualTestHelper.runVisualTest('special-tracks/numbered.gp');
    });

    it('numbered-tuplets', async () => {
        await VisualTestHelper.runVisualTestTex(
            `
            \\track "Num"
            \\staff {numbered}
            
            C2.2 {tu 3}*3  | 
            C7.2 {tu 3}*3  | 

            C2.16 {tu 3}*3  | 
            C7.16 {tu 3}*3  | 

                
            \\track "Std & Num"
            \\staff {score numbered}
            
            C2.2 {tu 3}*3  | 
            C7.2 {tu 3}*3  | 

            C2.16 {tu 3}*3  | 
            C7.16 {tu 3}*3  | 
            `,
            'test-data/visual-tests/special-tracks/numbered-tuplets.png',
            undefined,
            o => {
                o.tracks = o.score.tracks.map(t => t.index);
            }
        );
    });

    it('numbered-durations', async () =>{
        await VisualTestHelper.runVisualTestTex(
            `
            \\bracketExtendMode noBrackets
            \\track {defaultSystemsLayout 1}
            \\staff {numbered}
                \\section ("16th notes")
                C4.16 * 16 |

                \\section ("8th notes")
                C4.8 * 8 |
                \\section ("8th notes dotted")
                C4.8 {d} * 6 r.16 |
                \\section ("8th notes double-dotted")
                C4.8 {dd} * 4 r.8 |

                \\section ("Quarter notes")
                C4.4 * 4 |
                \\section ("Quarter notes dotted")
                C4.4 {d} * 2 r.4 |
                \\section ("Quarter notes double-dotted")
                C4.4 {dd} * 2 r.8 |

                \\section ("Half notes")
                C4.2 * 2 |
                \\section ("Half notes dotted")
                C4.2 {d}  r.4 |
                \\section ("Half notes double dotted")
                C4.2 {dd}  r.8 |

                \\section ("Whole notes")
                \\ts (8 4)
                C4.1 * 2 |
                \\section ("Half notes dotted")
                C4.1 {d}  r.2 |
                \\section ("Half notes double dotted")
                C4.1 {dd}  r.4 |

            \\staff {numbered}
                C4.4 * 4 |
                
                C4.4 * 4 |
                C4.4 * 4 |
                C4.4 * 4 |

                C4.4 * 4 |
                C4.4 * 4 |
                C4.4 * 4 |

                C4.4 * 4 |
                C4.4 * 4 |
                C4.4 * 4 |

                C4.4 * 8 |
                C4.4 * 8 |
                C4.4 * 8 |
                
                r
            `,
            'test-data/visual-tests/special-tracks/numbered-durations.png',
            undefined,
            o => {
                o.settings.display.layoutMode = LayoutMode.Parchment;
                o.tracks = o.score.tracks.map(t => t.index);
            }
        );
    })

    it('numbered-chord-ties', async () => {
        // bar 1: chord tied within the bar, bar 2 -> 3: chord tied across a system break,
        // bar 4: hammer-on chord taking a single slur arc
        await VisualTestHelper.runVisualTestTex(
            `
            \\track "Piano"
            \\staff {score numbered}
                (C4 E4 G4).2 (C4{t} E4{t} G4{t}).2 |
                D4.2 (D4 F4 A4).2 |
                (D4{t} F4{t} A4{t}).2 r.2 |
            \\track "Guitar"
            \\staff {score numbered tabs}
                (5.5{h} 5.4{h} 5.3{h}).4 (7.5 7.4 7.3).4 r.2 |
            `,
            'test-data/visual-tests/special-tracks/numbered-chord-ties.png',
            undefined,
            o => {
                o.settings.display.barsPerRow = 2;
                o.tracks = o.score.tracks.map(t => t.index);
            }
        );
    });

    it('numbered-chords', async () => {
        // bar 1: root position and inversions in the middle octave
        // bar 2: chords spanning octaves (inner notes with high and low octave dots)
        // bar 3: accidentals on individual chord notes
        // bar 4: dotted quarter, eighths and sixteenths (underlines only below the lowest number)
        // bar 5: double-dotted half (dashes and extra number belong to the whole chord)
        await VisualTestHelper.runVisualTestTex(
            `
            \\track "Piano"
            \\staff {score numbered}
                (C4 E4 G4).4 (E4 G4 C5).4 (G4 C5 E5).4 (C3 G3 E4).4 |
                (A3 C4 E4).4 (B4 D5 G5).4 (C4 C5 C6).4 (G2 G3 G4 G5).4 |
                (C4 E4 G#4).4 (Db4 F4 Ab4).4 (D4 F#4 A4).4 (C4 Eb4 G4 Bb4).4 |
                (C4 E4 G4).4{d} (D4 F4).8 (C4 E4).8 (D4 F4).8 (E4 G4).16 (F4 A4).16 (G4 B4).16 (A4 C5).16 |
                (C4 E4 G4).2{dd} (D4 F4).8
            `,
            'test-data/visual-tests/special-tracks/numbered-chords.png',
            undefined,
            o => {
                o.tracks = o.score.tracks.map(t => t.index);
            }
        );
    });

    it('numbered-chords-grace-dead', async () => {
        // bar 1: grace chords before chords and before a single note
        // bar 2: chords with dead notes, a fully dead chord and a dead-slapped beat
        await VisualTestHelper.runVisualTestTex(
            `
            \\track "Guitar"
            \\staff {score numbered tabs}
                (3.5 2.4).16{gr} (3.5 2.4 0.3).4 (5.4 5.3).16{gr} 7.3.4 (0.3 1.2).16{gr} (2.4 2.3 1.2).2 |
                (3.5 2.4{x} 0.3).4 (3.5{x} 2.4{x} 0.3{x}).4 r.4{ds} (3.5 2.4 0.3).4
            `,
            'test-data/visual-tests/special-tracks/numbered-chords-grace-dead.png',
            undefined,
            o => {
                o.tracks = o.score.tracks.map(t => t.index);
            }
        );
    });

    it('numbered-chords-tuplets', async () => {
        // eighth and quarter triplets of chords, the tuplet bracket must clear the highest number
        await VisualTestHelper.runVisualTestTex(
            `
            \\track "Piano"
            \\staff {score numbered}
                (C4 E4 G4).8{tu 3} (D4 F4 A4).8{tu 3} (E4 G4 B4).8{tu 3} (C5 E5 G5).4{tu 3} (D5 F5 A5).4{tu 3} (E5 G5 B5).4{tu 3} (C4 C5).4 |
                (G3 B3 D4 G4).8{tu 3} (A3 C4 E4).8{tu 3} (B3 D4 F4).8{tu 3} (C4 E4 G4 C5).2{d}
            `,
            'test-data/visual-tests/special-tracks/numbered-chords-tuplets.png',
            undefined,
            o => {
                o.tracks = o.score.tracks.map(t => t.index);
            }
        );
    });

    it('numbered-voices', async () => {
        // two voices with different rhythms, each on its own row aligned in time:
        // bar 1: quarters against eighths, bar 2: chords and low octave dots in the upper voice,
        // bar 3: ties and a tuplet in the lower voice, bar 4: rests in both voices
        await VisualTestHelper.runVisualTestTex(
            `
            \\track "Piano"
            \\staff {score numbered}
                \\voice
                    C5.4 D5 E5 F5 | (E5 G5).8 F5 E5.4 D4.16 C4 B3 A3 G3.4 | C5.2 E5.2 | r.2 G5.2
                \\voice
                    C4.8 D4 E4 F4 G4 A4 B4 C5 | C3.2 G3.2 | A3.4 A3{t}.4 B3.8{tu 3} C4.8{tu 3} D4.8{tu 3} E4.4 | C4.2 r.2
            `,
            'test-data/visual-tests/special-tracks/numbered-voices.png',
            undefined,
            o => {
                o.tracks = o.score.tracks.map(t => t.index);
            }
        );
    });

    it('numbered-voices-sparse', async () => {
        // the second voice rests in bar 1, has notes in bar 2 and is empty afterwards:
        // bar 3 keeps its row blank with the bar lines spanning both rows,
        // the second system (bars 4 and 5) has a single voice and collapses to one row
        await VisualTestHelper.runVisualTestTex(
            `
            \\track "Piano"
            \\staff {numbered}
                \\voice
                    C5.4 D5 E5 F5 | G5.2 E5.2 | C5.1 | D5.4 E5 F5 G5 | C5.1
                \\voice
                    r.1 | C4.4 E4 G4 C4
            `,
            'test-data/visual-tests/special-tracks/numbered-voices-sparse.png',
            undefined,
            o => {
                o.settings.display.barsPerRow = 3;
                o.tracks = o.score.tracks.map(t => t.index);
            }
        );
    });

    it('numbered-voices-4', async () => {
        // four voices, one row each from the first voice (top) to the fourth voice (bottom)
        await VisualTestHelper.runVisualTestTex(
            `
            \\track "Choir"
            \\staff {score numbered}
                \\voice
                    E5.4 F5 G5.2 | C6.1
                \\voice
                    C5.2 D5.2 | E5.1
                \\voice
                    G4.4 A4 B4 G4 | G4.1
                \\voice
                    C4.8 D4 E4 F4 G4.2 | C3.1
            `,
            'test-data/visual-tests/special-tracks/numbered-voices-4.png',
            undefined,
            o => {
                o.tracks = o.score.tracks.map(t => t.index);
            }
        );
    });

    it('numbered-single-note', async () => {
        // single note mode: one number per beat showing the highest note of a chord, the second voice
        // is not written; the tie of the chord continues from the highest note only
        await VisualTestHelper.runVisualTestTex(
            `
            \\track "Piano"
            \\staff {score numbered}
            \\staffDisplay numbered { notes singleNote }
                \\voice
                    (C4 E4 G4).4 (E4 C5).4 (C4 E4 G4).2 | (C4{t} E4{t} G4{t}).2 (D4 F4 A4).2
                \\voice
                    C3.2 G3.2 | C3.1
            `,
            'test-data/visual-tests/special-tracks/numbered-single-note.png',
            undefined,
            o => {
                o.tracks = o.score.tracks.map(t => t.index);
            }
        );
    });

    it('numbered-whole-rests', async () => {
        const rests =
            '\\ts (4 4) r.1 | \\ts (8 4) r.1 r.1 | \\ts (6 4) r.1 C4.2 | C4.2 r.1 | \\ts (8 4) r.1 {tu 3} * 3';
        await VisualTestHelper.runVisualTestTex(
            `
            \\track "Num"
            \\staff {numbered}
                ${rests}

            \\track "Std & Num"
            \\staff {score numbered}
                \\voice
                    ${rests}
                \\voice
                    C5.4 D5 E5 F5 | C5.2 D5 E5 F5
            `,
            'test-data/visual-tests/special-tracks/numbered-whole-rests.png',
            undefined,
            o => {
                o.tracks = o.score.tracks.map(t => t.index);
            }
        );
    });
});
