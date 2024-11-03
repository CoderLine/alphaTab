import { LayoutMode } from '@src/LayoutMode';
import { StaveProfile } from '@src/StaveProfile';
import { Settings } from '@src/Settings';
import { VisualTestHelper } from '@test/visualTests/VisualTestHelper';
import { NotationElement } from '@src/NotationSettings';
import { SystemsLayoutMode } from '@src/DisplaySettings';
import { Score } from '@src/model';
import { TestPlatform } from '@test/TestPlatform';
import { ScoreLoader } from '@src/importer';
import { AlphaTexImporter } from '@src/importer/AlphaTexImporter';

describe('MusicNotationTests', () => {
    it('clefs', async () => {
        let settings: Settings = new Settings();
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
        let settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Score;
        await VisualTestHelper.runVisualTest('music-notation/key-signatures-mixed.gp', settings, [0, 1, 2, 3]);
    });

    it('key-signatures-c3', async () => {
        let settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Score;
        await VisualTestHelper.runVisualTest('music-notation/key-signatures-c3.gp', settings);
    });

    it('key-signatures-c4', async () => {
        let settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Score;
        await VisualTestHelper.runVisualTest('music-notation/key-signatures-c4.gp', settings);
    });

    it('key-signatures-f4', async () => {
        let settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Score;
        await VisualTestHelper.runVisualTest('music-notation/key-signatures-f4.gp', settings);
    });

    it('key-signatures-g2', async () => {
        let settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Score;
        await VisualTestHelper.runVisualTest('music-notation/key-signatures-g2.gp', settings);
    });

    it('key-signatures', async () => {
        let settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Score;
        await VisualTestHelper.runVisualTest('music-notation/key-signatures.gp', settings);
    });

    it('time-signatures', async () => {
        let settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Score;
        await VisualTestHelper.runVisualTest('music-notation/time-signatures.gp', settings);
    });

    it('notes-rests-beams', async () => {
        let settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Score;
        await VisualTestHelper.runVisualTest('music-notation/notes-rests-beams.gp', settings);
    });

    it('accidentals', async () => {
        let settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Score;
        await VisualTestHelper.runVisualTest('music-notation/accidentals.gp', settings, undefined, undefined, 2.5);
    });

    it('forced-accidentals', async () => {
        let settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Score;
        await VisualTestHelper.runVisualTest('music-notation/forced-accidentals.gp', settings, [0, 1]);
    });

    it('beams-advanced', async () => {
        let settings: Settings = new Settings();
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

    function assertAccidentalsAdvanced(score: Score) {
        // TODO: check additional stuff
    }

    it('accidentals-advanced', async () => {
        const settings = new Settings();
        settings.display.systemsLayoutMode = SystemsLayoutMode.UseModelLayout;

        const inputFile = 'music-notation/accidentals-advanced.gp';
        const inputFileData = await TestPlatform.loadFile(`test-data/visual-tests/${inputFile}`);
        const score = ScoreLoader.loadScoreFromBytes(inputFileData, settings);
        const referenceFileName = TestPlatform.changeExtension(inputFile, '.png');

        await VisualTestHelper.runVisualTestScore(score, referenceFileName, settings);
        assertAccidentalsAdvanced(score);
    });

    it('accidentals-advanced-alphatex', async () => {
        // here we generate the same file like music-notation/accidentals-advanced.gp in alphaTex
        // the contents are organzed like this:
        // - we go through every signature
        // - we go through all full notes from C4 to B4 (1 octave)
        // - for every full note, we generate a bar with every accidental applied (none, sharp, doublesharp, flat, double flat)
        // - for every bar we have 2 notes with the accidental and one again without (to have the natural accidental)

        let tex = '\\tempo 240 . \\ts 3 4';

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
        settings.display.systemsLayoutMode = SystemsLayoutMode.UseModelLayout;

        const importer = new AlphaTexImporter();
        importer.initFromString(tex, settings);
        const score = importer.readScore();

        score.defaultSystemsLayout = 5;
        score.tracks[0].defaultSystemsLayout = 5;
        score.tracks[0].shortName = 'pno.';
        score.stylesheet.hideDynamics = true;

        const referenceFileName = 'music-notation/accidentals-advanced.png';

        await VisualTestHelper.runVisualTestScore(score, referenceFileName, settings);
        assertAccidentalsAdvanced(score);
    });
});
