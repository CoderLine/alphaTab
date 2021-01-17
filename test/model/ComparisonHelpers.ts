
export class ComparisonHelpers {
    public static expectJsonEqual(expected: unknown, actual: unknown, path: string, ignoreKeys: string[] | null): boolean {
        const expectedType = typeof expected;
        const actualType = typeof actual;

        // NOTE: performance wise expect() seems quite expensive
        // that's why we do a manual check for most asserts
        let result = true;

        if (actualType != expectedType) {
            fail(`Type Mismatch on hierarchy: ${path}, '${actualType}' != '${expectedType}'`);
            result = false;
        }

        switch (actualType) {
            case 'boolean':
                if ((actual as boolean) != (expected as boolean)) {
                    fail(`Boolean mismatch on hierarchy: ${path}, '${actual}' != '${expected}'`);
                    result = false;
                }
                break;
            case 'number':
                if (Math.abs((actual as number) - (expected as number)) >= 0.000001) {
                    fail(`Number mismatch on hierarchy: ${path}, '${actual}' != '${expected}'`);
                    result = false;
                }
                break;
            case 'object':
                if ((actual === null) !== (expected === null)) {
                    fail(`Null mismatch on hierarchy: ${path}, '${actual}' != '${expected}'`);
                    result = false;
                } else if (actual) {
                    if (Array.isArray(actual) !== Array.isArray(expected)) {
                        fail(`IsArray mismatch on hierarchy: ${path}`);
                        result = false;
                    } else if (Array.isArray(actual) && Array.isArray(expected)) {
                        if (actual.length !== expected.length) {
                            fail(`Array Length mismatch on hierarchy: ${path}, ${actual.length} != ${expected.length}`);
                            result = false;
                        } else {
                            for (let i = 0; i < actual.length; i++) {
                                if(!ComparisonHelpers.expectJsonEqual(expected[i], actual[i], `${path}[${i}]`, ignoreKeys)) {
                                    result = false;
                                }
                            }
                        }
                    } else if (expected instanceof Map) {
                        if (!(actual instanceof Map)) {
                            fail(`Map mismatch on hierarchy: ${path}, '${actual}' != '${expected}'`);
                            result = false;
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
                                result = false;
                            } else {
                                for (const key of actualKeys) {
                                    switch (key) {
                                        // some ignored keys
                                        case 'id':
                                        case 'hammerPullOriginNoteId':
                                        case 'hammerPullDestinationNoteId':
                                        case 'tieOriginNoteId':
                                        case 'tieDestinationNoteId':
                                            break;
                                        default:
                                            if (!ignoreKeys || ignoreKeys.indexOf(key) === -1) {
                                                if(!ComparisonHelpers.expectJsonEqual(expectedMap.get(key), actualMap.get(key), `${path}.${key}`, ignoreKeys)) {
                                                    result = false;
                                                }
                                            }
                                            break;
                                    }
                                }

                            }
                        }
                    } else {
                        fail('Need Map serialization for comparing json objects');
                        result = false;
                    }
                }
                break;
            case 'string':
                if ((actual as string) != (expected as string)) {
                    fail(`String mismatch on hierarchy: ${path}, '${actual}' != '${expected}'`);
                    result = false;
                }
                break;
            case 'undefined':
                if (actual !== expected) {
                    fail(`null mismatch on hierarchy: ${path}, '${actual}' != '${expected}'`);
                    result = false;
                }
                break;
        }

        return result;
    }


}