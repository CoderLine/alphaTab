import { describe, expect, it } from 'vitest';

describe('NumberParseFloatTests', () => {
    it('parses-decimals', () => {
        expect(Number.parseFloat('0.5')).toBe(0.5);
        expect(Number.parseFloat('-12.25')).toBe(-12.25);
        expect(Number.parseFloat('100')).toBe(100);
    });

    it('ignores-surrounding-whitespace', () => {
        expect(Number.parseFloat(' 0.5')).toBe(0.5);
        expect(Number.parseFloat('0.5 ')).toBe(0.5);
    });

    it('returns-nan-without-number', () => {
        expect(Number.isNaN(Number.parseFloat(''))).toBe(true);
        expect(Number.isNaN(Number.parseFloat('left'))).toBe(true);
    });
});
