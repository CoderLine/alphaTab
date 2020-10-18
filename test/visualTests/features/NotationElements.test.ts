import { LayoutMode } from '@src/DisplaySettings';
import { Settings } from '@src/Settings';
import { VisualTestHelper } from '@test/visualTests/VisualTestHelper';
import { NotationElement } from '@src/NotationSettings';

describe('NotationElements', () => {
    it('score-info', async () => {
        const tex = `\\album "Album" \\artist "Artist" \\copyright "Copyright" \\music "Music" \\subtitle "Subtitle" \\title "Title" \\words "Words" . 3.3*4`;

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

        let settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;

        for (const k of allKeys) {
            settings.notation.elements.set(k, false);
        }

        const testCases = new Map<NotationElement, string>();
        testCases.set(NotationElement.ScoreAlbum, 'album');
        testCases.set(NotationElement.ScoreArtist, 'artist');
        testCases.set(NotationElement.ScoreCopyright, 'copyright');
        testCases.set(NotationElement.ScoreMusic, 'music');
        testCases.set(NotationElement.ScoreSubTitle, 'subtitle');
        testCases.set(NotationElement.ScoreTitle, 'title');
        testCases.set(NotationElement.ScoreWords, 'words');

        for (const element of allKeys.filter(k => testCases.has(k))) {
            for (const k of allKeys) {
                settings.notation.elements.set(k, false);
            }

            settings.notation.elements.set(element, true);
            const referenceName = testCases.get(element)!;
            await VisualTestHelper.runVisualTestTex(
                tex,
                `notation-elements/score-info-${referenceName}.png`,
                settings,
                undefined,
                referenceName
            );
        }

        for (const k of allKeys) {
            settings.notation.elements.set(k, false);
        }
        settings.notation.elements.set(NotationElement.ScoreWordsAndMusic, true);
        await VisualTestHelper.runVisualTestTex(
            `\\album "Album" \\artist "Artist" \\copyright "Copyright" \\music "WordsAndMusic" \\subtitle "Subtitle" \\title "Title" \\words "WordsAndMusic" . 3.3*4`,
            `notation-elements/score-info-words-and-music.png`,
            settings,
            undefined,
            'words-and-music'
        );

        // default is all true
        settings.notation.elements.clear();
        await VisualTestHelper.runVisualTestTex(
            tex,
            `notation-elements/score-info-all.png`,
            settings,
            undefined,
            'all'
        );
    });

    it('guitar-tuning-on', async () => {
        const tex = `\\tuning e5 b4 g4 d4 a3 d3 . 3.3*4`;

        let settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;

        settings.notation.elements.set(NotationElement.GuitarTuning, true);
        await VisualTestHelper.runVisualTestTex(tex, `notation-elements/guitar-tuning-on.png`, settings);
    });

    it('guitar-tuning-off', async () => {
        const tex = `\\tuning d5 b4 g4 d4 a3 d3 . 3.3*4`;

        let settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;

        settings.notation.elements.set(NotationElement.GuitarTuning, false);
        await VisualTestHelper.runVisualTestTex(tex, `notation-elements/guitar-tuning-off.png`, settings);
    });

    it('track-names-off', async () => {
        const tex = `\\track "Track Name" 3.3*4`;

        let settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;

        settings.notation.elements.set(NotationElement.TrackNames, false);
        await VisualTestHelper.runVisualTestTex(tex, `notation-elements/track-names-off.png`, settings);
    });

    it('track-names-on', async () => {
        const tex = `\\track "Track Name" 3.3*4`;

        let settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;

        settings.notation.elements.set(NotationElement.TrackNames, true);
        await VisualTestHelper.runVisualTestTex(tex, `notation-elements/track-names-on.png`, settings);
    });

    it('chord-diagrams-off', async () => {
        const tex = `\\chord "C" 0 1 0 2 3 x . (0.1 1.2 0.3 2.4 3.5){ch "C"}`;

        let settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;

        settings.notation.elements.set(NotationElement.ChordDiagrams, false);
        await VisualTestHelper.runVisualTestTex(tex, `notation-elements/chord-diagrams-off.png`, settings);
    });

    it('chord-diagrams-on', async () => {
        const tex = `\\chord "C" 0 1 0 2 3 x . (0.1 1.2 0.3 2.4 3.5){ch "C"}`;

        let settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;

        settings.notation.elements.set(NotationElement.ChordDiagrams, true);
        await VisualTestHelper.runVisualTestTex(tex, `notation-elements/chord-diagrams-on.png`, settings);
    });

    it('parenthesis-on-tied-bends-off', async () => {
        const tex = `3.3{b (0 4 )} -.3`;

        let settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;

        settings.notation.elements.set(NotationElement.ParenthesisOnTiedBends, false);
        await VisualTestHelper.runVisualTestTex(
            tex,
            `notation-elements/parenthesis-on-tied-bends-off.png`,
            settings
        );
    });

    it('parenthesis-on-tied-bends-on', async () => {
        const tex = `3.3{b (0 4 )} -.3`;

        let settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;

        settings.notation.elements.set(NotationElement.ParenthesisOnTiedBends, true);
        await VisualTestHelper.runVisualTestTex(
            tex,
            `notation-elements/parenthesis-on-tied-bends-on.png`,
            settings
        );
    });

    it('tab-notes-on-tied-bends-off', async () => {
        const tex = `3.3{b (0 4 )} -.3{b (4 8)}`;

        let settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;

        settings.notation.elements.set(NotationElement.TabNotesOnTiedBends, false);
        await VisualTestHelper.runVisualTestTex(
            tex,
            `notation-elements/tab-notes-on-tied-bends-off.png`,
            settings
        );
    });

    it('tab-notes-on-tied-bends-on', async () => {
        const tex = `3.3{b (0 4 )} -.3{b (4 8)}`;

        let settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;

        settings.notation.elements.set(NotationElement.TabNotesOnTiedBends, true);
        await VisualTestHelper.runVisualTestTex(
            tex,
            `notation-elements/tab-notes-on-tied-bends-on.png`,
            settings
        );
    });

    it('zeros-on-dive-whammys-off', async () => {
        const tex = `3.3.1{tb (0 -4)}`;

        let settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;

        settings.notation.elements.set(NotationElement.ZerosOnDiveWhammys, false);
        await VisualTestHelper.runVisualTestTex(
            tex,
            `notation-elements/zeros-on-dive-whammys-off.png`,
            settings
        );
    });

    it('zeros-on-dive-whammys-on', async () => {
        const tex = `3.3.1{tb (0 -4)}`;

        let settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;

        settings.notation.elements.set(NotationElement.ZerosOnDiveWhammys, true);
        await VisualTestHelper.runVisualTestTex(
            tex,
            `notation-elements/zeros-on-dive-whammys-on.png`,
            settings
        );
    });

    it('effects-off', async () => {
        const tex = `. \\tempo 180 \\tf t16 3.3*4 | \\tempo 60 \\tf d16 3.3*4`;

        let settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;

        settings.notation.elements.set(NotationElement.EffectTempo, false);
        settings.notation.elements.set(NotationElement.EffectTripletFeel, false);
        await VisualTestHelper.runVisualTestTex(tex, `notation-elements/effects-off.png`, settings);
    });

    it('effects-on', async () => {
        const tex = `. \\tempo 180 \\tf t16 3.3*4 | \\tempo 60 \\tf d16 3.3*4`;

        let settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;

        settings.notation.elements.set(NotationElement.EffectTempo, true);
        settings.notation.elements.set(NotationElement.EffectTripletFeel, true);
        await VisualTestHelper.runVisualTestTex(tex, `notation-elements/effects-on.png`, settings);
    });
});
