import { ScoreLoader } from "@src/importer/ScoreLoader";
import { JsonConverter } from "@src/model/JsonConverter";
import { Score } from "@src/model/Score";
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

    function expectJsonEqual(expected: any, actual: any, path: string) {
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
                    } else if(!Array.isArray(actual)) {

                        const expectedKeys = Object.keys(expected);
                        const actualKeys = Object.keys(actual);
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
                                        expectJsonEqual(expected[key], actual[key], `${path}.${key}`);
                                        break;
                                }
                            }

                        }
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
});
