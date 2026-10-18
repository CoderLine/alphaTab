import { describe, expect, it } from 'vitest';
import { NoteSerializer } from '@coderline/alphatab/generated/model/NoteSerializer';
import { SettingsSerializer } from '@coderline/alphatab/generated/SettingsSerializer';
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import { LayoutMode } from '@coderline/alphatab/LayoutMode';
import { LogLevel } from '@coderline/alphatab/LogLevel';
import { Color } from '@coderline/alphatab/model/Color';
import { Font, FontStyle } from '@coderline/alphatab/model/Font';
import { JsonConverter } from '@coderline/alphatab/model/JsonConverter';
import { Note } from '@coderline/alphatab/model/Note';
import type { Score } from '@coderline/alphatab/model/Score';
import { FingeringMode, NotationElement, NotationMode, TabRhythmMode } from '@coderline/alphatab/NotationSettings';
import { Settings } from '@coderline/alphatab/Settings';
import type { SettingsJson } from '@coderline/alphatab/generated/SettingsJson';
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

            /*@target web*/
            ComparisonHelpers.expectJsonEqual(
                expectedJson,
                JsonConverter.scoreToJsObject(JsonConverter.jsonToScore(JsonConverter.scoreToJson(expected))),
                `<${name.substr(name.lastIndexOf('/') + 1)} via JSON>`,
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

    it('settings-deprecated-font-keys-are-read-only', () => {
        const raw = new Map<string, unknown>();
        raw.set('displayResourcesEffectFont', 'italic 13px Arial');
        raw.set('displayResourcesFingeringFont', 'italic 13px Arial');
        raw.set('displayResourcesInlineFingeringFont', 'italic 13px Arial');

        const settings = new Settings();
        SettingsSerializer.fromJson(settings, raw);
        expect(settings.display.resources.effectFont.size).toBe(13);
        expect(settings.display.resources.fingeringFont.size).toBe(13);
        expect(settings.display.resources.inlineFingeringFont.size).toBe(13);

        const display = JsonConverter.settingsToJsObject(settings)!.get('display') as Map<string, unknown>;
        const resources = display.get('resources') as Map<string, unknown>;
        expect(resources.has('effectfont')).toBe(false);
        expect(resources.has('fingeringfont')).toBe(false);
        expect(resources.has('inlinefingeringfont')).toBe(false);
    });

    /*@target web*/
    it('settings-json-type-keeps-deprecated-font-keys', () => {
        // type-checked: settings written for 1.8 must still compile against SettingsJson
        const json: SettingsJson = {
            display: {
                resources: {
                    effectFont: 'italic 13px Arial',
                    fingeringFont: 'italic 13px Arial',
                    inlineFingeringFont: 'italic 13px Arial'
                }
            }
        };
        const settings = new Settings();
        settings.fillFromJson(json);
        expect(settings.display.resources.effectFont.size).toBe(13);
    });

    const unsetNoteTex = '\\track "P" \\staff {score} C4.4 D4 r r | \\track "G" 3.3.4 5.2 r r';

    function expectUnsetNoteValuesKept(score: Score) {
        const pianoBeats = score.tracks[0].staves[0].bars[0].voices[0].beats;
        const piano = pianoBeats[0].notes[0];
        expect(piano.isPiano).toBe(true);
        expect(piano.isStringed).toBe(false);
        expect(piano.isPercussion).toBe(false);
        expect(piano.realValue).toBe(60);
        expect(Number.isNaN(pianoBeats[2].restDisplayTone)).toBe(true);
        expect(Number.isNaN(pianoBeats[2].restDisplayOctave)).toBe(true);

        const guitar = score.tracks[1].staves[0].bars[0].voices[0].beats[0].notes[0];
        expect(guitar.isStringed).toBe(true);
        expect(guitar.isPiano).toBe(false);
        expect(guitar.isPercussion).toBe(false);
        expect(guitar.realValue).toBe(58);
    }

    it('unset-note-values-are-not-written', () => {
        const json = NoteSerializer.toJson(new Note())!;
        expect(json.has('fret')).toBe(false);
        expect(json.has('string')).toBe(false);
        expect(json.has('octave')).toBe(false);
        expect(json.has('tone')).toBe(false);
        expect(json.has('percussionarticulation')).toBe(false);
    });

    it('null-note-values-load-as-unset', () => {
        const raw = new Map<string, unknown>();
        raw.set('fret', null);
        raw.set('string', null);
        raw.set('octave', null);
        raw.set('tone', null);
        raw.set('percussionarticulation', null);

        const note = new Note();
        NoteSerializer.fromJson(note, raw);
        expect(Number.isNaN(note.fret)).toBe(true);
        expect(Number.isNaN(note.string)).toBe(true);
        expect(Number.isNaN(note.octave)).toBe(true);
        expect(Number.isNaN(note.tone)).toBe(true);
        expect(Number.isNaN(note.percussionArticulation)).toBe(true);
    });

    it('legacy-unset-note-values-load-as-unset', () => {
        const raw = new Map<string, unknown>();
        raw.set('fret', -1 as number);
        raw.set('string', -1 as number);
        raw.set('octave', -1 as number);
        raw.set('tone', -1 as number);
        raw.set('percussionarticulation', -1 as number);

        const note = new Note();
        NoteSerializer.fromJson(note, raw);
        expect(Number.isNaN(note.fret)).toBe(true);
        expect(Number.isNaN(note.string)).toBe(true);
        expect(Number.isNaN(note.octave)).toBe(true);
        expect(Number.isNaN(note.tone)).toBe(true);
        expect(Number.isNaN(note.percussionArticulation)).toBe(true);
    });

    it('stringed-note-keeps-fret-minus-one', () => {
        const raw = new Map<string, unknown>();
        raw.set('fret', -1 as number);
        raw.set('string', 6 as number);

        const note = new Note();
        NoteSerializer.fromJson(note, raw);
        expect(note.fret).toBe(-1);
        expect(note.string).toBe(6);
        expect(note.isStringed).toBe(true);
    });

    it('legacy-stringed-note-keeps-fret-minus-one', () => {
        const raw = new Map<string, unknown>();
        raw.set('fret', -1 as number);
        raw.set('string', 5 as number);
        raw.set('octave', -1 as number);
        raw.set('tone', -1 as number);
        raw.set('percussionarticulation', -1 as number);

        const note = new Note();
        NoteSerializer.fromJson(note, raw);
        expect(note.fret).toBe(-1);
        expect(note.string).toBe(5);
        expect(Number.isNaN(note.octave)).toBe(true);
        expect(Number.isNaN(note.tone)).toBe(true);
        expect(Number.isNaN(note.percussionArticulation)).toBe(true);
    });

    it('minus-one-is-kept-without-legacy-keys', () => {
        const raw = new Map<string, unknown>();
        raw.set('string', -1 as number);
        raw.set('percussionarticulation', 0 as number);

        const note = new Note();
        NoteSerializer.fromJson(note, raw);
        expect(note.string).toBe(-1);
        expect(note.percussionArticulation).toBe(0);
    });

    it('unset-values-round-trip-through-js-object', () => {
        const score = ScoreLoader.loadAlphaTex(unsetNoteTex);
        expectUnsetNoteValuesKept(JsonConverter.jsObjectToScore(JsonConverter.scoreToJsObject(score)));
    });

    /*@target web*/
    it('unset-values-round-trip-through-json', () => {
        const score = ScoreLoader.loadAlphaTex(unsetNoteTex);
        const json = JsonConverter.scoreToJson(score);
        expect(json).not.toMatch(
            /"(fret|string|octave|tone|percussionarticulation|restdisplaytone|restdisplayoctave)":null/
        );
        expectUnsetNoteValuesKept(JsonConverter.jsonToScore(json));
    });

    /*@target web*/
    it('loads-1.8-json', async () => {
        // written by alphaTab 1.8.4 from: unsetNoteTex | \track "D" \instrument percussion \articulation defaults \staff {score} "hihatclosed".4 "snarehit" r r
        const json = await TestPlatform.loadFileAsString('test-data/json/score-1.8.4.json');
        const score = JsonConverter.jsonToScore(json);
        expectUnsetNoteValuesKept(score);

        const drum = score.tracks[2].staves[0].bars[0].voices[0].beats[0].notes[0];
        expect(drum.isPercussion).toBe(true);
        expect(drum.isStringed).toBe(false);
        expect(drum.isPiano).toBe(false);
        expect(drum.percussionArticulation).toBe(0);
        expect(drum.realValue).toBe(42);
    });
});
