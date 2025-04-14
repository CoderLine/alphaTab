import { LayoutMode } from '@src/LayoutMode';
import { Settings } from '@src/Settings';
import { VisualTestHelper, VisualTestOptions } from '@test/visualTests/VisualTestHelper';
import { NotationElement } from '@src/NotationSettings';

describe('NotationElements', () => {
    async function testScoreInfo(element: NotationElement | null, referenceName: string, tex?: string) {
        tex =
            tex ??
            `\\album "Album" \\artist "Artist" \\copyright "Copyright" \\music "Music" \\subtitle "Subtitle" \\title "Title" \\words "Words" . 3.3*4`;

        const allKeys = [
            NotationElement.ScoreAlbum,
            NotationElement.ScoreArtist,
            NotationElement.ScoreCopyright,
            NotationElement.ScoreMusic,
            NotationElement.ScoreSubTitle,
            NotationElement.ScoreTitle,
            NotationElement.ScoreWords,
            NotationElement.ScoreWordsAndMusic
        ];

        const settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;

        if (element !== null) {
            for (const k of allKeys) {
                settings.notation.elements.set(k, false);
            }

            settings.notation.elements.set(element, true);
        } else {
            settings.notation.elements.clear();
        }

        await VisualTestHelper.runVisualTestFull(
            VisualTestOptions.tex(
                tex,
                `test-data/visual-tests/notation-elements/score-info-${referenceName}.png`,
                settings
            )
        );
    }

    it('score-info-album', async () => {
        await testScoreInfo(NotationElement.ScoreAlbum, 'album');
    });

    it('score-info-artist', async () => {
        await testScoreInfo(NotationElement.ScoreArtist, 'artist');
    });

    it('score-info-copyright', async () => {
        await testScoreInfo(NotationElement.ScoreCopyright, 'copyright');
    });

    it('score-info-music', async () => {
        await testScoreInfo(NotationElement.ScoreMusic, 'music');
    });

    it('score-info-subtitle', async () => {
        await testScoreInfo(NotationElement.ScoreSubTitle, 'subtitle');
    });

    it('score-info-title', async () => {
        await testScoreInfo(NotationElement.ScoreTitle, 'title');
    });

    it('score-info-words', async () => {
        await testScoreInfo(NotationElement.ScoreWords, 'words');
    });

    it('score-info-words-and-music', async () => {
        await testScoreInfo(
            NotationElement.ScoreWordsAndMusic,
            'words-and-music',
            `
            \\album "Album" \\artist "Artist" \\copyright "Copyright" \\music "WordsAndMusic" \\subtitle "Subtitle" \\title "Title" \\words "WordsAndMusic" . 3.3*4
        `
        );
    });

    it('score-info-all', async () => {
        await testScoreInfo(null, 'all');
    });

    it('guitar-tuning-on', async () => {
        const tex = '\\tuning e5 b4 g4 d4 a3 d3 . 3.3*4';

        const settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;

        settings.notation.elements.set(NotationElement.GuitarTuning, true);
        await VisualTestHelper.runVisualTestTex(
            tex,
            'test-data/visual-tests/notation-elements/guitar-tuning-on.png',
            settings
        );
    });

    it('guitar-tuning-off', async () => {
        const tex = '\\tuning d5 b4 g4 d4 a3 d3 . 3.3*4';

        const settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;

        settings.notation.elements.set(NotationElement.GuitarTuning, false);
        await VisualTestHelper.runVisualTestTex(
            tex,
            'test-data/visual-tests/notation-elements/guitar-tuning-off.png',
            settings
        );
    });

    it('track-names-off', async () => {
        const tex = `\\track "Track Name" 3.3*4`;

        const settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;

        settings.notation.elements.set(NotationElement.TrackNames, false);
        await VisualTestHelper.runVisualTestTex(
            tex,
            'test-data/visual-tests/notation-elements/track-names-off.png',
            settings
        );
    });

    it('track-names-on', async () => {
        const tex = `\\track "Track Name" 3.3*4`;

        const settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;

        settings.notation.elements.set(NotationElement.TrackNames, true);
        await VisualTestHelper.runVisualTestTex(
            tex,
            'test-data/visual-tests/notation-elements/track-names-on.png',
            settings
        );
    });

    it('chord-diagrams-off', async () => {
        const tex = `\\chord "C" 0 1 0 2 3 x . (0.1 1.2 0.3 2.4 3.5){ch "C"}`;

        const settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;

        settings.notation.elements.set(NotationElement.ChordDiagrams, false);
        await VisualTestHelper.runVisualTestTex(
            tex,
            'test-data/visual-tests/notation-elements/chord-diagrams-off.png',
            settings
        );
    });

    it('chord-diagrams-on', async () => {
        const tex = `\\chord "C" 0 1 0 2 3 x . (0.1 1.2 0.3 2.4 3.5){ch "C"}`;

        const settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;

        settings.notation.elements.set(NotationElement.ChordDiagrams, true);
        await VisualTestHelper.runVisualTestTex(
            tex,
            'test-data/visual-tests/notation-elements/chord-diagrams-on.png',
            settings
        );
    });

    it('parenthesis-on-tied-bends-off', async () => {
        const tex = '3.3{b (0 4 )} -.3';

        const settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;

        settings.notation.elements.set(NotationElement.ParenthesisOnTiedBends, false);
        await VisualTestHelper.runVisualTestTex(
            tex,
            'test-data/visual-tests/notation-elements/parenthesis-on-tied-bends-off.png',
            settings
        );
    });

    it('parenthesis-on-tied-bends-on', async () => {
        const tex = '3.3{b (0 4 )} -.3';

        const settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;

        settings.notation.elements.set(NotationElement.ParenthesisOnTiedBends, true);
        await VisualTestHelper.runVisualTestTex(
            tex,
            'test-data/visual-tests/notation-elements/parenthesis-on-tied-bends-on.png',
            settings
        );
    });

    it('tab-notes-on-tied-bends-off', async () => {
        const tex = '3.3{b (0 4 )} -.3{b (4 8)}';

        const settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;

        settings.notation.elements.set(NotationElement.TabNotesOnTiedBends, false);
        await VisualTestHelper.runVisualTestTex(
            tex,
            'test-data/visual-tests/notation-elements/tab-notes-on-tied-bends-off.png',
            settings
        );
    });

    it('tab-notes-on-tied-bends-on', async () => {
        const tex = '3.3{b (0 4 )} -.3{b (4 8)}';

        const settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;

        settings.notation.elements.set(NotationElement.TabNotesOnTiedBends, true);
        await VisualTestHelper.runVisualTestTex(
            tex,
            'test-data/visual-tests/notation-elements/tab-notes-on-tied-bends-on.png',
            settings
        );
    });

    it('zeros-on-dive-whammys-off', async () => {
        const tex = '3.3.1{tb (0 -4)}';

        const settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;

        settings.notation.elements.set(NotationElement.ZerosOnDiveWhammys, false);
        await VisualTestHelper.runVisualTestTex(
            tex,
            'test-data/visual-tests/notation-elements/zeros-on-dive-whammys-off.png',
            settings
        );
    });

    it('zeros-on-dive-whammys-on', async () => {
        const tex = '3.3.1{tb (0 -4)}';

        const settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;

        settings.notation.elements.set(NotationElement.ZerosOnDiveWhammys, true);
        await VisualTestHelper.runVisualTestTex(
            tex,
            'test-data/visual-tests/notation-elements/zeros-on-dive-whammys-on.png',
            settings
        );
    });

    it('effects-off', async () => {
        const tex = '. \\tempo 180 \\tf t16 3.3*4 | \\tempo 60 \\tf d16 3.3*4';

        const settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;

        settings.notation.elements.set(NotationElement.EffectTempo, false);
        settings.notation.elements.set(NotationElement.EffectTripletFeel, false);
        await VisualTestHelper.runVisualTestTex(
            tex,
            'test-data/visual-tests/notation-elements/effects-off.png',
            settings
        );
    });

    it('effects-on', async () => {
        const tex = '. \\tempo 180 \\tf t16 3.3*4 | \\tempo 60 \\tf d16 3.3*4';

        const settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;

        settings.notation.elements.set(NotationElement.EffectTempo, true);
        settings.notation.elements.set(NotationElement.EffectTripletFeel, true);
        await VisualTestHelper.runVisualTestTex(
            tex,
            'test-data/visual-tests/notation-elements/effects-on.png',
            settings
        );
    });
});
