import { LayoutMode } from '@src/LayoutMode';
import { StaveProfile } from '@src/StaveProfile';
import { Settings } from '@src/Settings';
import { VisualTestHelper, VisualTestOptions, VisualTestRun } from '@test/visualTests/VisualTestHelper';
import { NotationElement } from '@src/NotationSettings';
import { AlphaTexImporter } from '@src/importer/AlphaTexImporter';

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

        const importer = new AlphaTexImporter();
        importer.initFromString(tex, settings);
        const score = importer.readScore();

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
});
