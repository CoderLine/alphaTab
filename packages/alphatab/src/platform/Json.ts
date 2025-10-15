import { IOHelper } from '@src/io/IOHelper';

/**
 * A cross platform implementation of the EcmaScript JSON standard implementation.
 * @partial
 * @internal
 */
export class Json {
    // https://tc39.es/ecma262/multipage/structured-data.html#sec-quotejsonstring
    // https://tc39.es/proposal-well-formed-stringify/#sec-quotejsonstring
    public static quoteJsonString(text: string) {
        // 1.
        let product = `\u0022`;

        // 2.
        for (const c of IOHelper.iterateCodepoints(text)) {
            // 2a.
            if (Json._jsonSingleCharacterEscapeSequences.has(c)) {
                // 2ai.
                product += Json._jsonSingleCharacterEscapeSequences.get(c)!;
            }
            // 2b.
            else if (c < 0x0020 || IOHelper.isLeadingSurrogate(c) || IOHelper.isTrailingSurrogate(c)) {
                //  2bi.
                const unit = c;
                // 2bii.
                product += Json._unicodeEscape(unit);
            }
            // 2c
            else {
                product += String.fromCodePoint(c);
            }
        }

        // 3.
        product += '\u0022';

        // 4.
        return product;
    }

    // https://tc39.es/ecma262/multipage/structured-data.html#sec-unicodeescape
    private static _unicodeEscape(c: number): string {
        // 1.
        const n = c;
        // 2. skipped
        // 3.
        const hex = n.toString(16);
        // 4.
        return `\u005cu${hex.padStart(4, '0')}`;
    }

    // https://tc39.es/ecma262/multipage/structured-data.html#table-json-single-character-escapes
    private static _jsonSingleCharacterEscapeSequences = new Map<number, string>([
        [0x0008, '\\b'],
        [0x0009, '\\t'],
        [0x000a, '\\n'],
        [0x000c, '\\f'],
        [0x000d, '\\r'],
        [0x0022, '\\"'],
        [0x005c, '\\\\']
    ]);
}
