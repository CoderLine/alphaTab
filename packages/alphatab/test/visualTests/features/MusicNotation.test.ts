import { SystemsLayoutMode } from '@coderline/alphatab/DisplaySettings';
import { LayoutMode } from '@coderline/alphatab/LayoutMode';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import { Settings } from '@coderline/alphatab/Settings';
import { StaveProfile } from '@coderline/alphatab/StaveProfile';
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import { VisualTestHelper, VisualTestOptions, VisualTestRun } from 'test/visualTests/VisualTestHelper';

describe('MusicNotationTests', () => {
    it('clefs', async () => {
        const settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Score;
        settings.display.layoutMode = LayoutMode.Page;
        settings.notation.elements.set(NotationElement.ScoreAlbum, false);
        settings.notation.elements.set(NotationElement.ScoreArtist, false);
        settings.notation.elements.set(NotationElement.ScoreCopyright, false);
        settings.notation.elements.set(NotationElement.ScoreMusic, false);
        settings.notation.elements.set(NotationElement.ScoreSubTitle, false);
        settings.notation.elements.set(NotationElement.ScoreTitle, false);
        settings.notation.elements.set(NotationElement.ScoreWords, false);
        settings.notation.elements.set(NotationElement.ScoreWordsAndMusic, false);
        await VisualTestHelper.runVisualTest('music-notation/clefs.gp', settings);
    });

    it('key-signatures-mixed', async () => {
        const settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Score;
        await VisualTestHelper.runVisualTest('music-notation/key-signatures-mixed.gp', settings, o => {
            o.tracks = [0, 1, 2, 3];
        });
    });

    it('key-signatures-c3', async () => {
        const settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Score;
        await VisualTestHelper.runVisualTest('music-notation/key-signatures-c3.gp', settings);
    });

    it('key-signatures-c4', async () => {
        const settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Score;
        await VisualTestHelper.runVisualTest('music-notation/key-signatures-c4.gp', settings);
    });

    it('key-signatures-f4', async () => {
        const settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Score;
        await VisualTestHelper.runVisualTest('music-notation/key-signatures-f4.gp', settings);
    });

    it('key-signatures-g2', async () => {
        const settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Score;
        await VisualTestHelper.runVisualTest('music-notation/key-signatures-g2.gp', settings);
    });

    it('key-signatures', async () => {
        const settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Score;
        await VisualTestHelper.runVisualTest('music-notation/key-signatures.gp', settings);
    });

    it('time-signatures', async () => {
        const settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Score;
        await VisualTestHelper.runVisualTest('music-notation/time-signatures.gp', settings);
    });

    it('notes-rests-beams', async () => {
        const settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Score;
        await VisualTestHelper.runVisualTest('music-notation/notes-rests-beams.gp', settings);
    });

    it('accidentals', async () => {
        const settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Score;
        await VisualTestHelper.runVisualTest('music-notation/accidentals.gp', settings);
    });

    it('forced-accidentals', async () => {
        const settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Score;
        await VisualTestHelper.runVisualTest('music-notation/forced-accidentals.gp', settings, o => {
            o.tracks = [0, 1];
        });
    });

    it('beams-advanced', async () => {
        const settings: Settings = new Settings();
        settings.display.barsPerRow = 4;
        await VisualTestHelper.runVisualTest('music-notation/beams-advanced.gp', settings);
    });

    it('rest-collisions', async () => {
        await VisualTestHelper.runVisualTest('music-notation/rest-collisions.gp');
    });

    it('brushes', async () => {
        await VisualTestHelper.runVisualTest('music-notation/brushes.gp');
    });

    it('brushes-ukulele', async () => {
        await VisualTestHelper.runVisualTest('music-notation/brushes-ukulele.gp');
    });

    it('accidentals-advanced', async () => {
        const settings = new Settings();
        settings.display.barsPerRow = 5;

        await VisualTestHelper.runVisualTest('music-notation/accidentals-advanced.gp', settings);
    });

    it('accidentals-advanced-alphatex', async () => {
        // here we generate the same file like music-notation/accidentals-advanced.gp in alphaTex
        // the contents are organzed like this:
        // - we go through every signature
        // - we go through all full notes from C4 to B4 (1 octave)
        // - for every full note, we generate a bar with every accidental applied (none, sharp, doublesharp, flat, double flat)
        // - for every bar we have 2 notes with the accidental and one again without (to have the natural accidental)

        let tex = '\\tempo 240 \\instrument piano . \\ts 3 4';

        const keySignatures = [
            'C',
            // sharps
            'G',
            'D',
            'A',
            'E',
            'B',
            'F#',
            'C#',
            // flats
            'F',
            'Bb',
            'Eb',
            'Ab',
            'Db',
            'Gb',
            'Cb'
        ];

        const ocatve = 4;
        const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const accidentalModes = ['', '#', '##', 'b', 'bb'];

        for (const keySignature of keySignatures) {
            tex += `\\ks ${keySignature} `;
            let keySignatureText = `KS=${keySignature}, `;
            for (const note of notes) {
                let beatEffects = `{ txt '${keySignatureText}${note}${ocatve}' } `;
                for (const accidental of accidentalModes) {
                    tex += `${note}${accidental}${ocatve} ${beatEffects}`;
                    beatEffects = '';
                    tex += `${note}${accidental}${ocatve} `;
                    tex += `${note}${ocatve} `;
                    tex += ' |\n';
                }
                keySignatureText = '';
            }
        }

        tex = tex.substring(0, tex.length - 2) /* last |\n */;

        const settings = new Settings();
        settings.display.barsPerRow = 5;

        const score = ScoreLoader.loadAlphaTex(tex, settings);

        score.tracks[0].shortName = 'pno.';
        score.stylesheet.hideDynamics = true;
        // score.stylesheet.bracketExtendMode = BracketExtendMode.NoBrackets;

        await VisualTestHelper.runVisualTestFull(
            new VisualTestOptions(
                score,
                [new VisualTestRun(-1, 'test-data/visual-tests/music-notation/accidentals-advanced.png')],
                settings
            )
        );
    });

    it('bar-lines', async () => {
        await VisualTestHelper.runVisualTest('music-notation/barlines.xml');
    });

    describe('multi-voice-displace', async () => {
        // TODO: splitup test cases once implemented, for now its nicer to have one big file to implement and test things. 

        // currently working as desired:
        // [ ] 1
        // [ ] 2
        // [ ] 3
        // [ ] 4
        // [ ] 5
        // [ ] 6
        // [ ] 7
        // [ ] 8
        // [ ] 9

        // [ ] 10        
        // [ ] 11
        // [ ] 12
        // [ ] 13
        // [ ] 14
        // [ ] 15
        // [ ] 16
        // [ ] 17
        // [ ] 18
        // [ ] 19

        // [ ] 20
        // [ ] 21
        // [ ] 22
        // [ ] 23
        // [ ] 24
        // [ ] 25
        // [ ] 26
        // [ ] 27
        // [ ] 28
        // [ ] 29

        // [ ] 30
        // [ ] 31
        // [ ] 32
        // [ ] 33
        // [ ] 34
        // [ ] 35
        // [ ] 36
        // [ ] 37
        // [ ] 38
        // [ ] 39

        // [ ] 40
        // [ ] 41
        // [ ] 42
        // [ ] 43
        // [ ] 44
        // [ ] 45
        // [ ] 46
        // [ ] 47
        // [ ] 48
        // [ ] 49

        // [ ] 50
        // [ ] 51
        // [ ] 52
        // [ ] 53
        // [ ] 54
        // [ ] 55
        // [ ] 56
        // [ ] 57
        // [ ] 58
        // [ ] 59

        // [ ] 60
        // [ ] 61
        // [ ] 62
        // [ ] 63

        const settings = new Settings();
        settings.display.systemsLayoutMode = SystemsLayoutMode.UseModelLayout;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track {defaultSystemsLayout 1}
            \\staff
            \\voiceMode barWise
            \\ts (5 4)

            // V1: Quarter Single V2: Quarter Single
            \\section ("1" "V1: Quarter Single V2: Quarter Single, Automatic Stem")
                \\voice 
                E5*5
                \\voice 
                C5 D5 E5 F5 G5
            |
            \\section ("2" "V1: Quarter Single V2: Quarter Single, Reversed Stem")
                \\voice 
                E5{beam down}*5 
                \\voice    
                C5{beam up} D5{beam up} E5{beam up} F5{beam up} G5 {beam up}
            |
            \\section ("3" "V1: Quarter Single V2: Quarter Single, Same Stem")  
                \\voice 
                E5{beam up}*5 
                \\voice   
                C5{beam up} D5{beam up} E5{beam up} F5{beam up} G5 {beam up}
            |

            // V1: Quarter Chord V2: Quarter Single
            \\section ("4" "V1: Quarter Chord V2: Quarter Single, Automatic Stem")  
                \\voice 
                (E5 F5)*5  
                \\voice 
                C5 D5 E5 F5 G5
            |
            \\section ("5" "V1: Quarter Chord V2: Quarter Single, Reversed Stem")
                \\voice 
                (E5 F5){beam down}*5  
                \\voice 
                C5{beam up} D5{beam up} E5{beam up} F5{beam up} G5{beam up}
            |
            \\section ("6" "V1: Quarter Chord V2: Quarter Single, Same Stem")
                \\voice 
                (E5 F5){beam up}*5  
                \\voice 
                C5{beam up} D5{beam up} E5{beam up} F5{beam up} G5{beam up}
            |

            // V1: Quarter Chord V2: Quarter Single
            \\section ("7" "V1: Quarter Chord V2: Quarter Chord, Automatic Stem")
            \\voice 
            (E5 F5)*5  
            \\voice 
            (C5 B4) (D5 C5) (E5 D5) (F5 E5) (G5 F5)
            |
            \\section ("8" "V1: Quarter Chord V2: Quarter Chord, Reversed Stem")
            \\voice 
            (E5 F5){beam down}*5  
            \\voice 
            (C5 B4){beam up} (D5 C5){beam up} (E5 D5){beam up} (F5 E5){beam up} (G5 F5){beam up}
            |
            \\section ("9" "V1: Quarter Chord V2: Quarter Chord, Same Stem")
            \\voice 
            (E5 F5){beam up}*5  
            \\voice 
            (C5 B4){beam up} (D5 C5){beam up} (E5 D5){beam up} (F5 E5){beam up} (G5 F5){beam up}
            |

            // V1: Quarter Single V2: Half Single
            \\section ("10" "V1: Quarter Single V2: Half Single, Automatic Stem")
            \\ts (10 4)
            \\voice 
            E5.4*10
            \\voice 
            C5.2 D5 E5 F5 G5
            |
            \\section ("11" "V1: Quarter Single V2: Half Single, Reversed Stem")
            \\voice 
            E5.4{beam down}*10
            \\voice   
            C5.2{beam up} D5{beam up} E5{beam up} F5{beam up} G5 {beam up}
            |
            \\section ("12" "V1: Quarter Single V2: Half Single, Same Stem")
            \\voice 
            E5.4{beam up}*10
            \\voice   
            C5.2{beam up} D5{beam up} E5{beam up} F5{beam up} G5 {beam up}
            |

            // V1: Quarter Chord, Half Single
            \\section ("13" "V1: Quarter Chord, Half Chord, Automatic Stem")
            \\voice 
            (E5 F5).4*10
            \\voice 
            C5.2 D5 E5 F5 G5
            |
            \\section ("14" "V1: Quarter Chord, Half Chord, Reversed Stem")
            \\voice 
            (E5 F5).4{beam down}*10  
            \\voice 
            C5.2{beam up} D5{beam up} E5{beam up} F5{beam up} G5{beam up}
            |
            \\section ("15" "V1: Quarter Chord, Half Chord, Same Stem")
            \\voice 
            (E5 F5).4{beam up}*10  
            \\voice 
            C5.2{beam up} D5{beam up} E5{beam up} F5{beam up} G5{beam up}
            |

            // V1: Quarter Chord, V2: Half Chord
            \\section ("16" "V1: Quarter Chord, V2: Half Chord, Automatic Stem")
            \\voice 
            (E5 F5).4*10  
            \\voice 
            (C5 B4).2 (D5 C5) (E5 D5) (F5 E5) (G5 F5)
            |
            \\section ("17" "V1: Quarter Chord, V2: Half Chord, Reversed Stem")
            \\voice 
            (E5 F5).4{beam down}*10
            \\voice 
            (C5 B4).2{beam up} (D5 C5){beam up} (E5 D5){beam up} (F5 E5){beam up} (G5 F5){beam up}
            |
            \\section ("18" "V1: Quarter Chord, V2: Half Chord, Same Stem")
            \\voice 
            (E5 F5).4{beam up}*10  
            \\voice 
            (C5 B4).2{beam up} (D5 C5){beam up} (E5 D5){beam up} (F5 E5){beam up} (G5 F5){beam up}
            |

            // V1: 8th Flag Single, V2: 8th Flag Single
            \\section ("19" "V1: 8th Flag Single, V2: 8th Flag Single, Automatic Stem")
            \\ts (5 4)
            \\voice 
            E5.8 r E5 r E5 r E5 r E5 r
            \\voice 
            C5 r D5 r E5 r F5 r G5 r
            | 
            \\section ("20" "V1: 8th Flag Single, V2: 8th Flag Single, Reversed Stem")
            \\voice 
            E5.8{beam down} r E5{beam down} r E5{beam down} r E5{beam down} r E5{beam down} r
            \\voice   
            C5{beam up} r D5{beam up} r E5{beam up} r F5{beam up} r G5 {beam up} r
            |
            \\section ("21" "V1: 8th Flag Single, V2: 8th Flag Single, Same Stem")
            \\voice 
            E5.8{beam down} r E5{beam down} r E5{beam down} r E5{beam down} r E5{beam down} r
            \\voice   
            C5{beam up} r D5{beam up} r E5{beam up} r F5{beam up} r G5 {beam up} r
            |

            // V1: 8th Flag Chord, V2 8th Flag Single
            \\section ("22" "V1: 8th Flag Chord, V2 8th Flag Single, Automatic Stem")
            \\voice 
            (E5 F5).8 r (E5 F5) r (E5 F5) r (E5 F5) r (E5 F5) r   
            \\voice 
            C5 r D5 r E5 r F5 r G5 r
            |
            \\section ("23" "V1: 8th Flag Chord, V2 8th Flag Single, Reversed Stem")
            \\voice 
            (E5 F5).8{beam down} r (E5 F5){beam down} r (E5 F5){beam down} r (E5 F5){beam down} r (E5 F5){beam down} r   
            \\voice 
            C5{beam up} r D5{beam up} r E5{beam up} r F5{beam up} r G5{beam up} r
            |
            \\section ("24" "V1: 8th Flag Chord, V2 8th Flag Single, Same Stem")
            \\voice 
            (E5 F5).8{beam up} r (E5 F5){beam up} r (E5 F5){beam up} r (E5 F5){beam up} r (E5 F5){beam up} r   
            \\voice 
            C5{beam up} r D5{beam up} r E5{beam up} r F5{beam up} r G5{beam up} r
            |

            // V1: 8th Flag Chord, V2 8th Flag Chord
            \\section ("25" "V1: 8th Flag Chord, V2 8th Flag Chord, Automatic Stem")
            \\voice 
            (E5 F5).8 r (E5 F5) r (E5 F5) r (E5 F5) r (E5 F5) r   
            \\voice 
            (C5 B4) r (D5 C5) r (E5 D5) r (F5 E5) r (G5 F5) r 
            |
            \\section ("26" "V1: 8th Flag Chord, V2 8th Flag Chord, Reversed Stem")
            \\voice 
            (E5 F5).8{beam down} r (E5 F5){beam down} r (E5 F5){beam down} r (E5 F5){beam down} r (E5 F5){beam down} r   
            \\voice 
            (C5 B4){beam up} r (D5 C5){beam up} r (E5 D5){beam up} r (F5 E5){beam up} r (G5 F5){beam up} r
            |
            \\section ("27" "V1: 8th Flag Chord, V2 8th Flag Chord, Same Stem")
            \\voice 
            (E5 F5).8{beam up} r (E5 F5){beam up} r (E5 F5){beam up} r (E5 F5){beam up} r (E5 F5){beam up} r   
            \\voice 
            (C5 B4){beam up} r (D5 C5){beam up} r (E5 D5){beam up} r (F5 E5){beam up} r (G5 F5){beam up} r
            |

            // V1: 8th Flag Single, V2: Quarter Single
            \\section ("28" "V1: 8th Flag Single, V2: Quarter Single, Automatic Stem")
            \\voice 
            E5.8 r E5 r E5 r E5 r E5 r
            \\voice 
            C5.4 D5 E5 F5 G5
            | 
            \\section ("29" "V1: 8th Flag Single, V2: Quarter Single, Reversed Stem")
            \\voice 
            E5.8{beam down} r E5{beam down} r E5{beam down} r E5{beam down} r E5{beam down} r
            \\voice   
            C5.4{beam up} D5{beam up} E5{beam up} F5{beam up} G5 {beam up}
            |
            \\section ("30" "V1: 8th Flag Single, V2: Quarter Single, Same Stem")
            \\voice 
            E5.8{beam up} r E5{beam up} r E5{beam up} r E5{beam up} r E5{beam up} r
            \\voice   
            C5.4{beam up} D5{beam up} E5{beam up} F5{beam up} G5 {beam up}
            |

            // V1: 8th Flag Chord, V2: Quarter Single
            \\section ("31" "V1: 8th Flag Chord, V2: Quarter Single, Automatic Stem")
            \\voice 
            (E5 F5).8 r (E5 F5) r (E5 F5) r (E5 F5) r (E5 F5) r   
            \\voice 
            C5.4 D5 E5 F5 G5
            |
            \\section ("32" "V1: 8th Flag Chord, V2: Quarter Single, Reversed Stem")
            \\voice 
            (E5 F5).8{beam down} r (E5 F5){beam down} r (E5 F5){beam down} r (E5 F5){beam down} r (E5 F5){beam down} r   
            \\voice 
            C5.4{beam up} D5{beam up} E5{beam up} F5{beam up} G5{beam up}
            |
            \\section ("33" "V1: 8th Flag Chord, V2: Quarter Single, Same Stem")
            \\voice 
            (E5 F5).8{beam up} r (E5 F5){beam up} r (E5 F5){beam up} r (E5 F5){beam up} r (E5 F5){beam up} r   
            \\voice 
            C5.4{beam up} D5{beam up} E5{beam up} F5{beam up} G5{beam up}
            |

            // V1: 8th Flag Chord, V2: Quarter Chord
            \\section ("34" "V1: 8th Flag Chord, V2: Quarter Chord, Automatic Stem")
            \\voice 
            (E5 F5).8 r (E5 F5) r (E5 F5) r (E5 F5) r (E5 F5) r   
            \\voice 
            (C5 B4).4 (D5 C5) (E5 D5) (F5 E5) (G5 F5)
            |
            \\section ("35" "V1: 8th Flag Chord, V2: Quarter Chord, Reversed Stem")
            \\voice 
            (E5 F5).8{beam down}  r (E5 F5){beam down}  r (E5 F5){beam down}  r (E5 F5){beam down}  r (E5 F5){beam down}  r   
            \\voice 
            (C5 B4).4{beam up} (D5 C5){beam up} (E5 D5){beam up} (F5 E5){beam up} (G5 F5){beam up}
            |
            \\section ("36" "V1: 8th Flag Chord, V2: Quarter Chord, Same Stem")
            \\voice 
            (E5 F5).8 {beam up} r (E5 F5) {beam up} r (E5 F5) {beam up} r (E5 F5) {beam up} r (E5 F5) {beam up} r   
            \\voice 
            (C5 B4).4 {beam up} (D5 C5){beam up} (E5 D5){beam up} (F5 E5){beam up} (G5 F5){beam up}
            |

            // V1: 8th Flag Single, V2: Half Single
            \\section ("37" "V1: 8th Flag Single, V2: Half Single, Automatic Stem")
            \\ts (5 2)
            \\voice 
            E5.8 r r r E5 r r r E5 r r r E5 r r r E5 r r r
            \\voice 
            C5.2 D5 E5 F5 G5
            | 
            \\section ("38" "V1: 8th Flag Single, V2: Half Single, Reversed Stem")
            \\voice 
            E5.8{beam down} r r r E5{beam down} r r r E5{beam down} r r r E5{beam down} r r r E5{beam down} r r r
            \\voice   
            C5.2{beam up} D5{beam up} E5{beam up} F5{beam up} G5 {beam up}
            |
            \\section ("39" "V1: 8th Flag Single, V2: Half Single, Same Stem")
            \\voice 
            E5.8{beam down} r r r E5{beam down} r r r E5{beam down} r r r E5{beam down} r r r E5{beam down} r r r
            \\voice   
            C5.2{beam up} D5{beam up} E5{beam up} F5{beam up} G5 {beam up}
            |

            // V1: 8th Flag Chord, V2: Half Single
            \\section ("40" "V1: 8th Flag Chord, V2: Half Single, Automatic Stem")
            \\voice 
            (E5 F5).8 r r r (E5 F5) r r r (E5 F5) r r r (E5 F5) r r r (E5 F5) r r r
            \\voice 
            C5.2 D5 E5 F5 G5
            |
            \\section ("41" "V1: 8th Flag Chord, V2: Half Single, Reversed Stem")
            \\voice 
            (E5 F5).8{beam down} r r r (E5 F5){beam down} r r r (E5 F5){beam down} r r r (E5 F5){beam down} r r r (E5 F5){beam down} r r r  
            \\voice 
            C5.2{beam up} D5{beam up} E5{beam up} F5{beam up} G5{beam up}
            |
            \\section ("42" "V1: 8th Flag Chord, V2: Half Single, Same Stem")
            \\voice 
            (E5 F5).8{beam up} r r r (E5 F5){beam up} r r r (E5 F5){beam up} r r r (E5 F5){beam up} r r r (E5 F5){beam up} r r r
            \\voice 
            C5.2{beam up} D5{beam up} E5{beam up} F5{beam up} G5{beam up}
            |

            // V1: 8th Flag Chord, V2: Half Chord
            \\section ("43" "V1: 8th Flag Chord, V2: Half Chord, Automatic Stem")
            \\voice 
            (E5 F5).8 r r r (E5 F5) r r r (E5 F5) r r r (E5 F5) r r r (E5 F5) r r r   
            \\voice 
            (C5 B4).2 (D5 C5) (E5 D5) (F5 E5) (G5 F5)
            |
            \\section ("44" "V1: 8th Flag Chord, V2: Half Chord, Reversed Stem")
            \\voice 
            (E5 F5).8{beam down}  r r r (E5 F5){beam down}  r r r (E5 F5){beam down}  r r r (E5 F5){beam down}  r r r (E5 F5){beam down}  r r r
            \\voice 
            (C5 B4).2{beam up} (D5 C5){beam up} (E5 D5){beam up} (F5 E5){beam up} (G5 F5){beam up}
            |
            \\section ("45" "V1: 8th Flag Chord, V2: Half Chord, Same Stem")
            \\voice 
            (E5 F5).8{beam up} r r r (E5 F5){beam up} r r r (E5 F5){beam up} r r r (E5 F5){beam up} r r r (E5 F5){beam up} r r r  
            \\voice 
            (C5 B4).2 {beam up} (D5 C5){beam up} (E5 D5){beam up} (F5 E5){beam up} (G5 F5){beam up}
            |

            // V1: Full Single, V2: Full Single
            \\section ("46" "V1: Full Single, V2: Full Single, Automatic Stem")
            \\ts (5 1)
            \\voice 
            E5.1 E5 E5 E5 E5
            \\voice 
            C5.1 D5 E5 F5 G5
            | 
            \\section ("47" "V1: Full Single, V2: Full Single, Reversed Stem")
            \\voice 
            E5.1{beam down} E5{beam down} E5{beam down} E5{beam down} E5{beam down}
            \\voice 
            C5.1{beam up} D5{beam up} E5{beam up} F5{beam up} G5{beam up}
            |
            \\section ("48" "V1: Full Single, V2: Full Single, Same Stem")
            \\voice 
            E5.1{beam up} E5{beam up} E5{beam up} E5{beam up} E5{beam up}
            \\voice 
            C5.1{beam up} D5{beam up} E5{beam up} F5{beam up} G5{beam up}
            |

            // V1: Full Chord, V2: Full Single
            \\section ("49" "V1: Full Chord, V2: Full Single, Automatic Stem")
            \\voice 
            (E5 F5).1 (E5 F5) (E5 F5) (E5 F5) (E5 F5)
            \\voice 
            C5.1 D5 E5 F5 G5
            |
            \\section ("50" "V1: Full Chord, V2: Full Single, Reversed Stem")
            \\voice 
            (E5 F5).1{beam down} (E5 F5){beam down} (E5 F5){beam down} (E5 F5){beam down} (E5 F5){beam down}
            \\voice 
            C5.1{beam up} D5{beam up} E5{beam up} F5{beam up} G5{beam up}
            |
            \\section ("51" "V1: Full Chord, V2: Full Single, Same Stem")
            \\voice 
            (E5 F5).1{beam up} (E5 F5){beam up} (E5 F5){beam up} (E5 F5){beam up} (E5 F5){beam up}
            \\voice 
            C5.1{beam up} D5{beam up} E5{beam up} F5{beam up} G5{beam up}
            |

            // V1: Full Chord, V2: Full Chord
            \\section ("52" "V1: Full Chord, V2: Full Chord, Automatic Stem")
            \\voice 
            (E5 F5).1 (E5 F5) (E5 F5) (E5 F5) (E5 F5)
            \\voice 
            (C5 B4).1 (D5 C5) (E5 D5) (F5 E5) (G5 F5)
            |
            \\section ("53" "V1: Full Chord, V2: Full Chord, Reversed Stem")
            \\voice 
            (E5 F5).1{beam down} (E5 F5){beam down} (E5 F5){beam down} (E5 F5){beam down} (E5 F5){beam down}
            \\voice 
            (C5 B4).1 {beam up} (D5 C5){beam up} (E5 D5){beam up} (F5 E5){beam up} (G5 F5){beam up}
            |
            \\section ("54" "V1: Full Chord, V2: Full Chord, Same Stem")
            \\voice 
            (E5 F5).1{beam up} (E5 F5){beam up} (E5 F5){beam up} (E5 F5){beam up} (E5 F5){beam up}
            \\voice 
            (C5 B4).1 {beam up} (D5 C5){beam up} (E5 D5){beam up} (F5 E5){beam up} (G5 F5){beam up}
            |

            ////

            // V1: Half Single, V2: Full Single
            \\section ("55" "V1: Half Single, V2: Full Single, Automatic Stem")
            \\ts (5 1)
            \\voice 
            E5.2 r E5 r E5 r E5 r E5 r
            \\voice 
            C5.1 D5 E5 F5 G5
            | 
            \\section ("56" "V1: Half Single, V2: Full Single, Reversed Stem")
            \\voice 
            E5.2{beam down} r E5{beam down} r E5{beam down} r E5{beam down} r E5{beam down} r
            \\voice 
            C5.1{beam up} D5{beam up} E5{beam up} F5{beam up} G5{beam up}
            |
            \\section ("57" "V1: Half Single, V2: Full Single, Same Stem")
            \\voice 
            E5.1{beam up} E5{beam up} E5{beam up} E5{beam up} E5{beam up}
            \\voice 
            C5.1{beam up} D5{beam up} E5{beam up} F5{beam up} G5{beam up}
            |

            // V1: Half Chord, V2: Full Single
            \\section ("58" "V1: Half Chord, V2: Full Single, Automatic Stem")
            \\voice 
            (E5 F5).2 r (E5 F5) r (E5 F5) r (E5 F5) r (E5 F5) r
            \\voice 
            C5.1 D5 E5 F5 G5
            |
            \\section ("59" "V1: Half Chord, V2: Full Single, Reversed Stem")
            \\voice 
            (E5 F5).2{beam down} r (E5 F5){beam down} r (E5 F5){beam down} r (E5 F5){beam down} r (E5 F5){beam down} r
            \\voice 
            C5.1{beam up} D5{beam up} E5{beam up} F5{beam up} G5{beam up}
            |
            \\section ("60" "V1: Half Chord, V2: Full Single, Same Stem")
            \\voice 
            (E5 F5).2{beam up} r (E5 F5){beam up} r (E5 F5){beam up} r (E5 F5){beam up} r (E5 F5){beam up} r
            \\voice 
            C5.1{beam up} D5{beam up} E5{beam up} F5{beam up} G5{beam up}
            |

            // V1: Half Chord, V2: Full Chord
            \\section ("61" "V1: Half Chord, V2: Full Chord, Automatic Stem")
            \\voice 
            (E5 F5).2 r (E5 F5) r (E5 F5) r (E5 F5) r (E5 F5) r
            \\voice 
            (C5 B4).1 (D5 C5) (E5 D5) (F5 E5) (G5 F5)
            |
            \\section ("62" "V1: Half Chord, V2: Full Chord, Reversed Stem")
            \\voice 
            (E5 F5).2{beam down} r (E5 F5){beam down} r (E5 F5){beam down} r (E5 F5){beam down} r (E5 F5){beam down} r
            \\voice 
            (C5 B4).1 {beam up} (D5 C5){beam up} (E5 D5){beam up} (F5 E5){beam up} (G5 F5){beam up}
            |
            \\section ("63" "V1: Half Chord, V2: Full Chord, Same Stem")
            \\voice 
            (E5 F5).2{beam up} r (E5 F5){beam up} r (E5 F5){beam up} r (E5 F5){beam up} r (E5 F5){beam up} r
            \\voice 
            (C5 B4).1 {beam up} (D5 C5){beam up} (E5 D5){beam up} (F5 E5){beam up} (G5 F5){beam up}
            |

            // for justification
            r
        `,
            'test-data/visual-tests/music-notation/multi-voice-displace.png',
            settings
        );
    });
});
