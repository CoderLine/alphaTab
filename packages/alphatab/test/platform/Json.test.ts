import { describe, expect, it } from 'vitest';
import { Json } from '@coderline/alphatab/platform/Json';
describe('JsonTests', () => {
    it('quoteJsonStringEmpty', () => {
        expect(Json.quoteJsonString('')).toBe('""');
    });

    it('quoteJsonStringAscii', () => {
        expect(Json.quoteJsonString('Test')).toBe('"Test"');
    });

    it('quoteJsonStringQuote', () => {
        expect(Json.quoteJsonString('"')).toBe('"\\""');
    });

    it('quoteJsonStringEscapes', () => {
        expect(Json.quoteJsonString('\b')).toBe('"\\b"');
        expect(Json.quoteJsonString('\t')).toBe('"\\t"');
        expect(Json.quoteJsonString('\n')).toBe('"\\n"');
        /*@target web*/
        expect(Json.quoteJsonString('\f')).toBe('"\\f"');
        expect(Json.quoteJsonString('\r')).toBe('"\\r"');
        expect(Json.quoteJsonString('\\')).toBe('"\\\\"');
    });

    it('quoteJsonStringNonReadable', () => {
        expect(Json.quoteJsonString('\u001B\u001B')).toBe('"\\u001b\\u001b"');
    });

    it('quoteJsonStringSurrogates', () => {
        expect(Json.quoteJsonString('\udc00\udc00')).toBe('"\\udc00\\udc00"');
    });

    it('quoteJsonStringSurrogatePair', () => {
        // cat emoji 😸
        expect(Json.quoteJsonString('\uD83D\uDE38')).toBe('"😸"');
        // hand emoji (color adjusted) 🤘🏻
        expect(Json.quoteJsonString('\uD83E\uDD18\uD83C\uDFFB')).toBe('"🤘🏻"');
    });
});
