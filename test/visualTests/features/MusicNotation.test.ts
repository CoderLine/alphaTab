import { LayoutMode, StaveProfile } from '@src/DisplaySettings';
import { Settings } from '@src/Settings';
import { VisualTestHelper } from '@test/visualTests/VisualTestHelper';
import { NotationElement } from '@src/NotationSettings';

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
        await VisualTestHelper.runVisualTest('music-notation/accidentals.gp', settings);
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
});
