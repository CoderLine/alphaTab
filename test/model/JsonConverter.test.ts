import { FingeringMode, LayoutMode, LogLevel, NotationMode, Settings, StaveProfile } from "@src/alphatab";
import { SettingsSerializer } from "@src/generated/SettingsSerializer";
import { ScoreLoader } from "@src/importer/ScoreLoader";
import { Color } from "@src/model/Color";
import { Font, FontStyle } from "@src/model/Font";
import { JsonConverter } from "@src/model/JsonConverter";
import { Score } from "@src/model/Score";
import { NotationElement, TabRhythmMode } from "@src/NotationSettings";
import { TestPlatform } from "@test/TestPlatform";

describe('JsonConverterTest', () => {
    const loadScore: (name: string) => Promise<Score | null> = async (name: string): Promise<Score | null> => {
        const data = await TestPlatform.loadFile('test-data/' + name);
        try {
            return ScoreLoader.loadScoreFromBytes(data);
        }
        catch (e) {
            return null;
        }
    };

    function expectJsonEqual(expected: unknown, actual: unknown, path: string) {
        const expectedType = typeof expected;
        const actualType = typeof actual;

        // NOTE: performance wise expect() seems quite expensive
        // that's why we do a manual check for most asserts

        if (actualType != expectedType) {
            fail(`Type Mismatch on hierarchy: ${path}, '${actualType}' != '${expectedType}'`);
        }

        switch (actualType) {
            case 'boolean':
                if ((actual as boolean) != (expected as boolean)) {
                    fail(`Boolean mismatch on hierarchy: ${path}, '${actual}' != '${expected}'`);
                }
                break;
            case 'number':
                if (Math.abs((actual as number) - (expected as number)) >= 0.000001) {
                    fail(`Number mismatch on hierarchy: ${path}, '${actual}' != '${expected}'`);
                }
                break;
            case 'object':
                if ((actual === null) !== (expected === null)) {
                    fail(`Null mismatch on hierarchy: ${path}, '${actual}' != '${expected}'`);
                } else if (actual) {
                    if (Array.isArray(actual) !== Array.isArray(expected)) {
                        fail(`IsArray mismatch on hierarchy: ${path}`);
                    } else if (Array.isArray(actual) && Array.isArray(expected)) {
                        if (actual.length !== expected.length) {
                            fail(`Array Length mismatch on hierarchy: ${path}, ${actual.length} != ${expected.length}`);
                        } else {
                            for (let i = 0; i < actual.length; i++) {
                                expectJsonEqual(expected[i], actual[i], `${path}[${i}]`);
                            }
                        }
                    } else if (expected instanceof Map) {
                        if (!(actual instanceof Map)) {
                            fail(`Map mismatch on hierarchy: ${path}, '${actual}' != '${expected}'`);
                        } else {
                            const expectedMap = expected as Map<string, unknown>;
                            const actualMap = actual as Map<string, unknown>;

                            const expectedKeys = Array.from(expectedMap.keys());
                            const actualKeys = Array.from(actualMap.keys());
                            expectedKeys.sort();
                            actualKeys.sort();

                            const actualKeyList = actualKeys.join(',');
                            const expectedKeyList = expectedKeys.join(',');
                            if (actualKeyList !== expectedKeyList) {
                                fail(`Object Keys mismatch on hierarchy: ${path}, '${actualKeyList}' != '${expectedKeyList}'`);
                            } else {
                                for (const key of actualKeys) {
                                    switch (key) {
                                        // some ignored keys
                                        case 'id':
                                        case 'hammerPullOriginId':
                                        case 'hammerPullDestinationId':
                                        case 'tieOriginId':
                                        case 'tieDestinationId':
                                            break;
                                        default:
                                            expectJsonEqual(expectedMap.get(key), actualMap.get(key), `${path}.${key}`);
                                            break;
                                    }
                                }

                            }
                        }
                    } else {
                        fail('Need Map serialization for comparing json objects');
                    }
                }
                break;
            case 'string':
                if ((actual as string) != (expected as string)) {
                    fail(`String mismatch on hierarchy: ${path}, '${actual}' != '${expected}'`);
                }
                break;
            case 'undefined':
                if (actual !== expected) {
                    fail(`null mismatch on hierarchy: ${path}, '${actual}' != '${expected}'`);
                }
                break;
        }
    }

    const testRoundTripEqual: (name: string) => Promise<void> = async (name: string): Promise<void> => {
        try {
            const expected = await loadScore(name);
            if (!expected) {
                return;
            }

            const expectedJson = JsonConverter.scoreToJsObject(expected);
            const actual = JsonConverter.jsObjectToScore(expectedJson);
            const actualJson = JsonConverter.scoreToJsObject(actual);

            expectJsonEqual(expectedJson, actualJson, '<' + name.substr(name.lastIndexOf('/') + 1) + '>');
        } catch (e) {
            fail(e);
        }
    };

    const testRoundTripFolderEqual: (name: string) => Promise<void> = async (name: string): Promise<void> => {
        const files: string[] = await TestPlatform.listDirectory(`test-data/${name}`);
        for (const file of files) {
            await testRoundTripEqual(`${name}/${file}`);
        }
    };

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
        /**@target web*/
        expected.core.visibilityCheckInterval = 4711;

        expected.core.enableLazyLoading = false;
        expected.core.engine = "engine";
        expected.core.logLevel = LogLevel.Error;
        expected.core.useWorkers = false;
        expected.core.includeNoteBounds = true;

        expected.display.scale = 10;
        expected.display.stretchForce = 2;
        expected.display.staveProfile = StaveProfile.ScoreTab;
        expected.display.barCountPerPartial = 14;
        expected.display.resources.copyrightFont = new Font('copy', 15, FontStyle.Plain);
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

        expected.player.soundFont = 'soundfont';
        expected.player.scrollElement = 'scroll';
        expected.player.vibrato.noteSlightAmplitude = 10;
        expected.player.slide.simpleSlideDurationRatio = 8;

        const expectedJson = JsonConverter.settingsToJsObject(expected);
        const actual = JsonConverter.jsObjectToSettings(expectedJson);
        const actualJson = JsonConverter.settingsToJsObject(actual);

        expectJsonEqual(expectedJson, actualJson, '');
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
        raw.set('displayResourcesCopyrightFont', 'italic 18px Roboto');

        SettingsSerializer.fromJson(settings, raw);

        expect(settings.core.enableLazyLoading).toEqual(false);
        expect(settings.core.logLevel).toEqual(LogLevel.Error);
        expect(settings.display.layoutMode).toEqual(LayoutMode.Horizontal);
        expect(settings.display.scale).toEqual(5);
        expect(settings.notation.rhythmMode).toEqual(TabRhythmMode.ShowWithBars);
        expect(settings.display.resources.copyrightFont.family).toEqual('Roboto');
        expect(settings.display.resources.copyrightFont.size).toEqual(18);
        expect(settings.display.resources.copyrightFont.style).toEqual(FontStyle.Italic);
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
            displayResourcesCopyrightFont: 'italic 18px Roboto'
        };

        SettingsSerializer.fromJson(settings, raw);

        expect(settings.core.enableLazyLoading).toEqual(false);
        expect(settings.core.logLevel).toEqual(LogLevel.Error);
        expect(settings.display.layoutMode).toEqual(LayoutMode.Horizontal);
        expect(settings.display.scale).toEqual(5);
        expect(settings.notation.rhythmMode).toEqual(TabRhythmMode.ShowWithBars);
        expect(settings.display.resources.copyrightFont.family).toEqual('Roboto');
        expect(settings.display.resources.copyrightFont.size).toEqual(18);
        expect(settings.display.resources.copyrightFont.style).toEqual(FontStyle.Italic);
    });
});
