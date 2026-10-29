import { describe, expect, it } from 'vitest';
import { SettingsSerializer } from '@coderline/alphatab/generated/SettingsSerializer';
import { AlphaTexImporter } from '@coderline/alphatab/importer/AlphaTexImporter';
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import { ByteBuffer } from '@coderline/alphatab/io/ByteBuffer';
import { LayoutMode } from '@coderline/alphatab/LayoutMode';
import { LogLevel } from '@coderline/alphatab/LogLevel';
import { BarStyle, BarSubElement } from '@coderline/alphatab/model/Bar';
import { BeatStyle, BeatSubElement } from '@coderline/alphatab/model/Beat';
import { Color } from '@coderline/alphatab/model/Color';
import { Font, FontStyle } from '@coderline/alphatab/model/Font';
import { JsonConverter } from '@coderline/alphatab/model/JsonConverter';
import { NoteStyle, NoteSubElement } from '@coderline/alphatab/model/Note';
import { type Score, ScoreStyle, ScoreSubElement } from '@coderline/alphatab/model/Score';
import { TrackStyle, TrackSubElement } from '@coderline/alphatab/model/Track';
import { VoiceStyle, VoiceSubElement } from '@coderline/alphatab/model/Voice';
import { FingeringMode, NotationElement, NotationMode, TabRhythmMode } from '@coderline/alphatab/NotationSettings';
import { Settings } from '@coderline/alphatab/Settings';
import { TestPlatform } from 'test/TestPlatform';
import { ComparisonHelpers } from './ComparisonHelpers';

describe('JsonConverterTest', () => {
    async function loadScore(name: string): Promise<Score | null> {
        try {
            const data = await TestPlatform.loadFile(`test-data/${name}`);
            return ScoreLoader.loadScoreFromBytes(data);
        } catch {
            return null;
        }
    }

    async function testRoundTripEqual(name: string): Promise<void> {
        try {
            const expected = await loadScore(name);
            if (!expected) {
                return;
            }

            const expectedJson = JsonConverter.scoreToJsObject(expected);
            const actual = JsonConverter.jsObjectToScore(expectedJson);
            const actualJson = JsonConverter.scoreToJsObject(actual);

            ComparisonHelpers.expectJsonEqual(
                expectedJson,
                actualJson,
                `<${name.substr(name.lastIndexOf('/') + 1)}>`,
                null
            );
        } catch (e) {
            throw new Error(String(e));
        }
    }

    async function testRoundTripFolderEqual(name: string): Promise<void> {
        const files: string[] = await TestPlatform.listDirectory(`test-data/${name}`);
        for (const file of files) {
            await testRoundTripEqual(`${name}/${file}`);
        }
    }

    it('importer', async () => {
        await testRoundTripFolderEqual('guitarpro7');
    });

    it('visual-effects-and-annotations', async () => {
        await testRoundTripFolderEqual('visual-tests/effects-and-annotations');
    });

    it('visual-general', async () => {
        await testRoundTripFolderEqual('visual-tests/general');
    });

    it('visual-guitar-tabs', async () => {
        await testRoundTripFolderEqual('visual-tests/guitar-tabs');
    });

    it('visual-layout', async () => {
        await testRoundTripFolderEqual('visual-tests/layout');
    });

    it('visual-music-notation', async () => {
        await testRoundTripFolderEqual('visual-tests/music-notation');
    });

    it('visual-notation-legend', async () => {
        await testRoundTripFolderEqual('visual-tests/notation-legend');
    });

    it('visual-special-notes', async () => {
        await testRoundTripFolderEqual('visual-tests/special-notes');
    });

    it('visual-special-tracks', async () => {
        await testRoundTripFolderEqual('visual-tests/special-tracks');
    });

    it('settings', () => {
        const expected = new Settings();
        // here we modifiy some properties of each level and some special ones additionally
        // to ensure all properties are considered properly

        /**@target web*/
        expected.core.scriptFile = 'script';
        /**@target web*/
        expected.core.fontDirectory = 'font';
        /**@target web*/
        expected.core.tex = true;
        /**@target web*/
        expected.core.tracks = [1, 2, 3];

        expected.core.enableLazyLoading = false;
        expected.core.engine = 'engine';
        expected.core.logLevel = LogLevel.Error;
        expected.core.useWorkers = false;
        expected.core.includeNoteBounds = true;

        expected.display.scale = 10;
        expected.display.stretchForce = 2;
        expected.display.barCountPerPartial = 14;
        expected.display.resources.elementFonts.set(
            NotationElement.ScoreCopyright,
            new Font('copy', 15, FontStyle.Plain)
        );
        expected.display.resources.staffLineColor = new Color(255, 0, 0, 100);
        expected.display.padding = [1, 2, 3, 4];

        expected.notation.notationMode = NotationMode.SongBook;
        expected.notation.fingeringMode = FingeringMode.ScoreForcePiano;
        expected.notation.elements.set(NotationElement.EffectCapo, false);
        expected.notation.elements.set(NotationElement.ZerosOnDiveWhammys, true);
        expected.notation.rhythmMode = TabRhythmMode.ShowWithBars;
        expected.notation.rhythmHeight = 100;
        expected.notation.transpositionPitches = [1, 2, 3, 4];
        expected.notation.displayTranspositionPitches = [5, 6, 7, 8];
        expected.notation.extendBendArrowsOnTiedNotes = false;
        expected.notation.extendLineEffectsToBeatEnd = true;
        expected.notation.slurHeight = 50;

        expected.importer.encoding = 'enc';
        expected.importer.mergePartGroupsInMusicXml = false;

        /**@target web*/
        expected.player.soundFont = 'soundfont';
        /**@target web*/
        expected.player.scrollElement = 'scroll';
        expected.player.vibrato.noteSlightAmplitude = 10;
        expected.player.slide.simpleSlideDurationRatio = 8;

        const expectedJson = JsonConverter.settingsToJsObject(expected);
        const actual = JsonConverter.jsObjectToSettings(expectedJson);
        const actualJson = JsonConverter.settingsToJsObject(actual);

        ComparisonHelpers.expectJsonEqual(expectedJson, actualJson, '', null);
    });

    it('settings-from-map', () => {
        const settings = new Settings();

        const raw = new Map<string, unknown>();

        // json_on_parent
        raw.set('enableLazyLoading', false);
        // string enum
        raw.set('logLevel', 'error');
        raw.set('displayLayoutMode', 1.0 as number);

        // nested
        const display = new Map<string, unknown>();
        display.set('scale', 5.0 as number);
        raw.set('display', display);

        // json_partial_names
        raw.set('notationRhythmMode', 'sHoWWITHbArs');

        // immutable
        raw.set('displayResourcesMainGlyphColor', '#FF0000');

        SettingsSerializer.fromJson(settings, raw);

        expect(settings.core.enableLazyLoading).toBe(false);
        expect(settings.core.logLevel).toBe(LogLevel.Error);
        expect(settings.display.layoutMode).toBe(LayoutMode.Horizontal);
        expect(settings.display.scale).toBe(5);
        expect(settings.notation.rhythmMode).toBe(TabRhythmMode.ShowWithBars);
        expect(settings.display.resources.mainGlyphColor.r).toBe(255);
        expect(settings.display.resources.mainGlyphColor.g).toBe(0);
        expect(settings.display.resources.mainGlyphColor.b).toBe(0);
    });

    /*@target web*/
    it('settings-from-object', () => {
        const settings = new Settings();

        const raw = {
            // json_on_parent
            enableLazyLoading: false,
            // string enum
            logLevel: 'error',
            displayLayoutMode: 1.0,
            // nested
            display: {
                scale: 5.0
            },
            // json_partial_names
            notationRhythmMode: 'sHoWWITHbArs',
            // immutable
            displayResourcesMainGlyphColor: '#FF0000'
        };

        SettingsSerializer.fromJson(settings, raw);

        expect(settings.core.enableLazyLoading).toBe(false);
        expect(settings.core.logLevel).toBe(LogLevel.Error);
        expect(settings.display.layoutMode).toBe(LayoutMode.Horizontal);
        expect(settings.display.scale).toBe(5);
        expect(settings.notation.rhythmMode).toBe(TabRhythmMode.ShowWithBars);
        expect(settings.display.resources.mainGlyphColor.r).toBe(255);
        expect(settings.display.resources.mainGlyphColor.g).toBe(0);
        expect(settings.display.resources.mainGlyphColor.b).toBe(0);
    });

    function createScoreWithNullStyleColors(): Score {
        const importer = new AlphaTexImporter();
        importer.init(ByteBuffer.fromString('3.3 3.3 | 3.3'), new Settings());
        const score = importer.readScore();
        const red = new Color(255, 0, 0, 255);

        score.style = new ScoreStyle();
        score.style.colors.set(ScoreSubElement.Title, null);
        score.style.colors.set(ScoreSubElement.SubTitle, red);

        const track = score.tracks[0];
        track.style = new TrackStyle();
        track.style.colors.set(TrackSubElement.TrackName, null);
        track.style.colors.set(TrackSubElement.StringTuning, red);

        const bar = track.staves[0].bars[0];
        bar.style = new BarStyle();
        bar.style.colors.set(BarSubElement.StandardNotationStaffLine, null);
        bar.style.colors.set(BarSubElement.GuitarTabsStaffLine, red);

        const voice = bar.voices[0];
        voice.style = new VoiceStyle();
        voice.style.colors.set(VoiceSubElement.Glyphs, null);

        const beat = voice.beats[0];
        beat.style = new BeatStyle();
        beat.style.colors.set(BeatSubElement.Effects, null);
        beat.style.colors.set(BeatSubElement.StandardNotationStem, red);

        const note = beat.notes[0];
        note.style = new NoteStyle();
        note.style.colors.set(NoteSubElement.Effects, null);
        note.style.colors.set(NoteSubElement.GuitarTabFretNumber, red);

        return score;
    }

    function expectNullStyleColors(score: Score): void {
        const scoreColors = score.style!.colors;
        expect(scoreColors.has(ScoreSubElement.Title)).toBe(true);
        expect(scoreColors.get(ScoreSubElement.Title)).toBe(null);
        expect(scoreColors.get(ScoreSubElement.SubTitle)!.rgba).toBe('#FF0000');
        expect(scoreColors.has(ScoreSubElement.Artist)).toBe(false);

        const track = score.tracks[0];
        const trackColors = track.style!.colors;
        expect(trackColors.has(TrackSubElement.TrackName)).toBe(true);
        expect(trackColors.get(TrackSubElement.TrackName)).toBe(null);
        expect(trackColors.get(TrackSubElement.StringTuning)!.rgba).toBe('#FF0000');
        expect(trackColors.has(TrackSubElement.BracesAndBrackets)).toBe(false);

        const bar = track.staves[0].bars[0];
        const barColors = bar.style!.colors;
        expect(barColors.has(BarSubElement.StandardNotationStaffLine)).toBe(true);
        expect(barColors.get(BarSubElement.StandardNotationStaffLine)).toBe(null);
        expect(barColors.get(BarSubElement.GuitarTabsStaffLine)!.rgba).toBe('#FF0000');
        expect(barColors.has(BarSubElement.SlashStaffLine)).toBe(false);

        const voice = bar.voices[0];
        const voiceColors = voice.style!.colors;
        expect(voiceColors.has(VoiceSubElement.Glyphs)).toBe(true);
        expect(voiceColors.get(VoiceSubElement.Glyphs)).toBe(null);

        const beat = voice.beats[0];
        const beatColors = beat.style!.colors;
        expect(beatColors.has(BeatSubElement.Effects)).toBe(true);
        expect(beatColors.get(BeatSubElement.Effects)).toBe(null);
        expect(beatColors.get(BeatSubElement.StandardNotationStem)!.rgba).toBe('#FF0000');
        expect(beatColors.has(BeatSubElement.StandardNotationFlags)).toBe(false);

        const note = beat.notes[0];
        const noteColors = note.style!.colors;
        expect(noteColors.has(NoteSubElement.Effects)).toBe(true);
        expect(noteColors.get(NoteSubElement.Effects)).toBe(null);
        expect(noteColors.get(NoteSubElement.GuitarTabFretNumber)!.rgba).toBe('#FF0000');
        expect(noteColors.has(NoteSubElement.StandardNotationNoteHead)).toBe(false);
    }

    it('style-null-colors-js-object', () => {
        const expected = createScoreWithNullStyleColors();
        expectNullStyleColors(expected);

        const actual = JsonConverter.jsObjectToScore(JsonConverter.scoreToJsObject(expected));
        expectNullStyleColors(actual);
    });

    /*@target web*/
    it('style-null-colors-json', () => {
        const json = JsonConverter.scoreToJson(createScoreWithNullStyleColors());
        expectNullStyleColors(JsonConverter.jsonToScore(json));
    });

    /*@target web*/
    it('style-null-colors-structured-clone', () => {
        const jsObject = JsonConverter.scoreToJsObject(createScoreWithNullStyleColors());
        expectNullStyleColors(JsonConverter.jsObjectToScore(structuredClone(jsObject)));
    });
});
