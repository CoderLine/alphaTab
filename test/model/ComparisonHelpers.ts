import { TestPlatform } from '@test/TestPlatform';
import { assert } from 'chai';

/**
 * @partial
 */
export class ComparisonHelpers {
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
                        `Boolean mismatch on hierarchy: ${path}, actualy<'${actual}'> != expected<'${expected}'>`
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
                    assert.fail(`Null mismatch on hierarchy: ${path}, actualy<'${actual}'> != expected<'${expected}'>`);
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
                                ComparisonHelpers.expectJsonEqual(expectedArray[i], actualArray[i], `${path}[${i}]`, ignoreKeys);
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
                                        ignoreKeys
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
        expected: unknown,
        actual: unknown,
        path: string,
        ignoreKeys: string[] | null
    ): boolean {
        assert.fail(`Cannot compare unknown object types on path ${path}`);
        return false;
    }
}
