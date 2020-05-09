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
        await VisualTestHelper.runVisualTest('features/music-notation/clefs.gpx', settings);
    });

    it('key-signatures', async () => {
        let settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Score;
        await VisualTestHelper.runVisualTest('features/music-notation/key-signatures.gp5', settings);
    });

    it('time-signatures', async () => {
        let settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Score;
        await VisualTestHelper.runVisualTest('features/music-notation/time-signatures.gp5', settings);
    });

    it('notes-rests-beams', async () => {
        let settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Score;
        await VisualTestHelper.runVisualTest('features/music-notation/notes-rests-beams.gp5', settings);
    });

    it('accidentals', async () => {
        let settings: Settings = new Settings();
        settings.display.staveProfile = StaveProfile.Score;
        await VisualTestHelper.runVisualTest('features/music-notation/accidentals.gp5', settings);
    });
});
