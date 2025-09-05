import { Json } from '@src/platform/Json';
import { expect } from 'chai';

describe('JsonTests', () => {
    it('quoteJsonStringEmpty', () => {
        expect(Json.quoteJsonString('')).to.equal('""');
    });

    it('quoteJsonStringAscii', () => {
        expect(Json.quoteJsonString('Test')).to.equal('"Test"');
    });

    it('quoteJsonStringQuote', () => {
        expect(Json.quoteJsonString('"')).to.equal('"\\""');
    });

    it('quoteJsonStringEscapes', () => {
        expect(Json.quoteJsonString('\b')).to.equal('"\\b"');
        expect(Json.quoteJsonString('\t')).to.equal('"\\t"');
        expect(Json.quoteJsonString('\n')).to.equal('"\\n"');
        /*@target web*/
        expect(Json.quoteJsonString('\f')).to.equal('"\\f"');
        expect(Json.quoteJsonString('\r')).to.equal('"\\r"');
        expect(Json.quoteJsonString('\\')).to.equal('"\\\\"');
    });

    it('quoteJsonStringNonReadable', () => {
        expect(Json.quoteJsonString('\u001B\u001B')).to.equal('"\\u001b\\u001b"');
    });

    it('quoteJsonStringSurrogates', () => {
        expect(Json.quoteJsonString('\udc00\udc00')).to.equal('"\\udc00\\udc00"');
    });

    it('quoteJsonStringSurrogatePair', () => {
        // cat emoji 😸
        expect(Json.quoteJsonString('\uD83D\uDE38')).to.equal('"😸"');
        // hand emoji (color adjusted) 🤘🏻
        expect(Json.quoteJsonString('\uD83E\uDD18\uD83C\uDFFB')).to.equal('"🤘🏻"');
    });
});
