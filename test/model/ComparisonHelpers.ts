import { JsonConverter } from '@src/model/JsonConverter';
import { ModelUtils } from '@src/model/ModelUtils';
import type { Score } from '@src/model/Score';
import { TestPlatform } from '@test/TestPlatform';
import { assert } from 'chai';

/**
 * @partial
 */
export class ComparisonHelpers {
    private static removeInitialAutomations(score: Score) {
        for (const t of score.tracks) {
            if (
                t.staves.length > 0 &&
                t.staves[0].bars.length > 0 &&
                t.staves[0].bars[0].voices.length > 0 &&
                t.staves[0].bars[0].voices[0].beats.length > 0
            ) {
                const b = t.staves[0].bars[0].voices[0].beats[0];
                b.automations = [];
            }
        }
    }

    private static removeEmptyVoices(score: Score) {
        for (const track of score.tracks) {
            for (const staff of track.staves) {
                let biggestNonEmptyVoice = 0;

                // check which voices are filled somewhere
                for (const bar of staff.bars) {
                    for (const v of bar.voices) {
                        if (!v.isEmpty) {
                            if (v.index > biggestNonEmptyVoice) {
                                biggestNonEmptyVoice = v.index;
                            }
                        }
                    }
                }

                // remove empty voices from all bars
                const voiceCount = biggestNonEmptyVoice + 1;
                for (const bar of staff.bars) {
                    while (bar.voices.length > voiceCount) {
                        bar.voices.pop();
                    }
                }
            }
        }
    }

    public static alphaTexExportRoundtripPrepare(expected: Score) {
        // the exporter will clear out empty voices and bars, to have correct assertions we do that before
        ModelUtils.trimEmptyBarsAtEnd(expected);
        for (const t of expected.tracks) {
            for (const s of t.staves) {
                const filledVoices = Math.max(...s.filledVoices) + 1;
                for (const b of s.bars) {
                    while (b.voices.length > filledVoices) {
                        b.voices.pop();
                    }
                }
            }
        }
    }
    public static alphaTexExportRoundtripEqual(
        testName: string,
        actual: Score,
        expected: Score,
        ignoreKeys: string[] | null = null
    ) {
        const expectedJson = JsonConverter.scoreToJsObject(expected);
        const actualJson = JsonConverter.scoreToJsObject(actual);

        const ignorePaths: RegExp[] = [/^.*stringtuning\.isstandard$/i, /^.*masterbars.*\.fermata$/i];

        ComparisonHelpers.removeEmptyVoices(expected);
        // ignore instrument automation on first beat
        ComparisonHelpers.removeInitialAutomations(expected);
        ComparisonHelpers.removeInitialAutomations(actual);

        ignoreKeys = ignoreKeys ?? [];
        ignoreKeys.push(
            // score level
            'stylesheet',

            // track level
            'color',

            // staff level
            'chords', // ids differ
            'percussionarticulations', // unsupported

            // playback info
            'port',
            'volume',
            'primarychannel',
            'secondarychannel',
            'balance',

            // beat level
            'chordid', // ids differ
            'lyrics', // missing feature
            'preferredbeamdirection',
            'timer', // value will be calculated, only showTimer is important here

            // note level
            'accidentalmode',
            'ratioposition',
            'percussionarticulation',

            // for now ignore the automations as they get reorganized from beat to masterbar level
            // which messes with the 1:1 validation
            'automations',
            'tempoautomations',

            'isvisibleonmultitrack',

            // masterbar
            'isdoublebar', // deprecated

            // all
            'style'
        );

        ComparisonHelpers.expectJsonEqual(expectedJson, actualJson, `<${testName}>`, ignoreKeys, ignorePaths);
    }

    public static expectJsonEqual(
        expected: unknown,
        actual: unknown,
        path: string,
        ignoreKeys: string[] | null,
        ignorePaths: RegExp[] | null = null
    ) {
        if (ignorePaths && ignorePaths.some(p => p.exec(path) !== null)) {
            return;
        }

        const expectedType = typeof expected;
        const actualType = typeof actual;

        if (actualType !== expectedType) {
            assert.fail(`Type Mismatch on hierarchy: ${path}, actual<'${actualType}'> != expected<'${expectedType}'>`);
        }

        switch (actualType) {
            case 'boolean':
                if ((actual as boolean) !== (expected as boolean)) {
                    assert.fail(
                        `Boolean mismatch on hierarchy: ${path}, actual<'${actual}'> != expected<'${expected}'>`
                    );
                }
                break;
            case 'number':
                if (Math.abs((actual as number) - (expected as number)) >= 0.000001) {
                    assert.fail(
                        `Number mismatch on hierarchy: ${path}, actual<'${actual}'> != expected<'${expected}'>`
                    );
                }
                break;
            case 'object':
                if ((actual === null) !== (expected === null)) {
                    assert.fail(`Null mismatch on hierarchy: ${path}, actual<'${actual}'> != expected<'${expected}'>`);
                } else if (actual) {
                    if (Array.isArray(actual) !== Array.isArray(expected)) {
                        assert.fail(`IsArray mismatch on hierarchy: ${path}`);
                    } else if (Array.isArray(actual) && Array.isArray(expected)) {
                        const actualArray = TestPlatform.typedArrayAsUnknownArray(actual);
                        const expectedArray = TestPlatform.typedArrayAsUnknownArray(expected);

                        if (actualArray.length !== expectedArray.length) {
                            assert.fail(
                                `Array Length mismatch on hierarchy: ${path}, actual<${actualArray.length}> != expected<${expectedArray.length}>`
                            );
                        } else {
                            for (let i = 0; i < actualArray.length; i++) {
                                ComparisonHelpers.expectJsonEqual(
                                    expectedArray[i],
                                    actualArray[i],
                                    `${path}[${i}]`,
                                    ignoreKeys,
                                    ignorePaths
                                );
                            }
                        }
                    } else if (expected instanceof Map) {
                        if (!(actual instanceof Map)) {
                            assert.fail(
                                `Map mismatch on hierarchy: ${path}, actual<'${actual}'> != expected<'${expected}'>`
                            );
                        } else {
                            const expectedMap = expected as Map<string, unknown>;
                            const actualMap = actual as Map<string, unknown>;

                            const ignoredKeyLookup: Set<string> = new Set<string>([
                                'id',
                                'hammerpulloriginnoteid',
                                'hammerpulldestinationnoteid',
                                'tieoriginnoteid',
                                'tiedestinationnoteid',
                                'sluroriginnoteid',
                                'slurdestinationnoteid',
                                'slidetargetnoteid',
                                'slideoriginnoteid',
                                'systemslayout',
                                'defaultsystemslayout',
                                'displayscale',
                                'pertrackdisplaytuning',
                                'pertrackchorddiagramsontop'
                            ]);
                            if (ignoreKeys) {
                                for (const k of ignoreKeys) {
                                    ignoredKeyLookup.add(k);
                                }
                            }
                            const expectedKeys = Array.from(expectedMap.keys()).filter(k => !ignoredKeyLookup.has(k));
                            const actualKeys = Array.from(actualMap.keys()).filter(k => !ignoredKeyLookup.has(k));
                            expectedKeys.sort();
                            actualKeys.sort();

                            const actualKeyList = actualKeys.join(',');
                            const expectedKeyList = expectedKeys.join(',');
                            if (actualKeyList !== expectedKeyList) {
                                assert.fail(
                                    `Object Keys mismatch on hierarchy: ${path}, actual<'${actualKeyList}'> != expected<'${expectedKeyList}'>`
                                );
                            } else {
                                for (const key of actualKeys) {
                                    ComparisonHelpers.expectJsonEqual(
                                        expectedMap.get(key),
                                        actualMap.get(key),
                                        `${path}.${key}`,
                                        ignoreKeys,
                                        ignorePaths
                                    );
                                }
                            }
                        }
                    } else {
                        ComparisonHelpers.compareObjects(expected, actual, path, ignoreKeys);
                    }
                }
                break;
            case 'string':
                if ((actual as string) !== (expected as string)) {
                    assert.fail(
                        `String mismatch on hierarchy: ${path}, actual<'${actual}'> != expected<'${expected}'>`
                    );
                }
                break;
            case 'undefined':
                if (actual !== expected) {
                    assert.fail(`null mismatch on hierarchy: ${path}, actual<'${actual}'> != expected<'${expected}'>`);
                }
                break;
        }
    }

    /**
     * @target web
     * @partial
     */
    public static compareObjects(
        _expected: unknown,
        _actual: unknown,
        path: string,
        _ignoreKeys: string[] | null
    ): boolean {
        assert.fail(`Cannot compare unknown object types on path ${path}`);
        return false;
    }
}
