
export class ComparisonHelpers {
    public static expectJsonEqual(expected: unknown, actual: unknown, path: string) {
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
                                ComparisonHelpers.expectJsonEqual(expected[i], actual[i], `${path}[${i}]`);
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
                                        case 'hammerPullOriginNoteId':
                                        case 'hammerPullDestinationNoteId':
                                        case 'tieOriginNoteId':
                                        case 'tieDestinationNoteId':
                                            break;
                                        default:
                                            ComparisonHelpers.expectJsonEqual(expectedMap.get(key), actualMap.get(key), `${path}.${key}`);
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


}