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
    ): boolean {
        if(ignorePaths && ignorePaths.some(p => p.exec(path) !== null)) {
            return true;
        }
        
        const expectedType = typeof expected;
        const actualType = typeof actual;

        // NOTE: performance wise expect() seems quite expensive
        // that's why we do a manual check for most asserts
        let result = true;

        if (actualType != expectedType) {
            assert.fail(`Type Mismatch on hierarchy: ${path}, actual<'${actualType}'> != expected<'${expectedType}'>`);
            result = false;
        }

        switch (actualType) {
            case 'boolean':
                if ((actual as boolean) != (expected as boolean)) {
                    assert.fail(`Boolean mismatch on hierarchy: ${path}, actualy<'${actual}'> != expected<'${expected}'>`);
                    result = false;
                }
                break;
            case 'number':
                if (Math.abs((actual as number) - (expected as number)) >= 0.000001) {
                    assert.fail(`Number mismatch on hierarchy: ${path}, actual<'${actual}'> != expected<'${expected}'>`);
                    result = false;
                }
                break;
            case 'object':
                if ((actual === null) !== (expected === null)) {
                    assert.fail(`Null mismatch on hierarchy: ${path}, actualy<'${actual}'> != expected<'${expected}'>`);
                    result = false;
                } else if (actual) {
                    if (Array.isArray(actual) !== Array.isArray(expected)) {
                        assert.fail(`IsArray mismatch on hierarchy: ${path}`);
                        result = false;
                    } else if (Array.isArray(actual) && Array.isArray(expected)) {
                        if (actual.length !== expected.length) {
                            assert.fail(`Array Length mismatch on hierarchy: ${path}, actual<${actual.length}> != expected<${expected.length}>`);
                            result = false;
                        } else {
                            for (let i = 0; i < actual.length; i++) {
                                if (
                                    !ComparisonHelpers.expectJsonEqual(
                                        expected[i],
                                        actual[i],
                                        `${path}[${i}]`,
                                        ignoreKeys
                                    )
                                ) {
                                    result = false;
                                }
                            }
                        }
                    } else if (expected instanceof Map) {
                        if (!(actual instanceof Map)) {
                            assert.fail(`Map mismatch on hierarchy: ${path}, actual<'${actual}'> != expected<'${expected}'>`);
                            result = false;
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
                                'systemslayout',
                                'defaultsystemslayout',
                                'displayscale',
                                'pertrackdisplaytuning'
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
                                result = false;
                            } else {
                                for (const key of actualKeys) {
                                    if (
                                        !ComparisonHelpers.expectJsonEqual(
                                            expectedMap.get(key),
                                            actualMap.get(key),
                                            `${path}.${key}`,
                                            ignoreKeys
                                        )
                                    ) {
                                        result = false;
                                    }
                                }
                            }
                        }
                    } else if (!ComparisonHelpers.compareObjects(expected, actual, path, ignoreKeys)) {
                        result = false;
                    }
                }
                break;
            case 'string':
                if ((actual as string) !== (expected as string)) {
                    assert.fail(`String mismatch on hierarchy: ${path}, actual<'${actual}'> != expeted<'${expected}'>`);
                    result = false;
                }
                break;
            case 'undefined':
                if (actual !== expected) {
                    assert.fail(`null mismatch on hierarchy: ${path}, actual<'${actual}'> != expected<'${expected}'>`);
                    result = false;
                }
                break;
        }

        return result;
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
