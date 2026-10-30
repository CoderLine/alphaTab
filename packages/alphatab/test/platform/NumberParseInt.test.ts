// biome-ignore-all lint/complexity/useNumericLiterals: the subject under test is parseInt itself
// biome-ignore-all lint/correctness/useParseIntRadix: covers parseInt without radix
import { describe, expect, it } from 'vitest';

describe('NumberParseIntTests', () => {
    it('parses-integers', () => {
        expect(Number.parseInt('42', 10)).toBe(42);
        expect(Number.parseInt('+7', 10)).toBe(7);
        expect(Number.parseInt('-12', 10)).toBe(-12);
        expect(Number.parseInt('007', 10)).toBe(7);
        expect(Number.parseInt('12345678901', 10) - 12345678900).toBe(1);
    });

    it('ignores-surrounding-whitespace', () => {
        expect(Number.parseInt('  42', 10)).toBe(42);
        expect(Number.parseInt('\t\r\n8 ', 10)).toBe(8);
    });

    it('stops-at-first-invalid-character', () => {
        expect(Number.parseInt('3.5', 10)).toBe(3);
        expect(Number.parseInt('5.9', 10)).toBe(5);
        expect(Number.parseInt('12abc', 10)).toBe(12);
        expect(Number.parseInt('1e3', 10)).toBe(1);
        expect(Number.parseInt('1,234', 10)).toBe(1);
        expect(Number.parseInt('0x1A', 10)).toBe(0);
    });

    it('keeps-sign-of-zero', () => {
        expect(1 / Number.parseInt('-0.5', 10)).toBe(-Number.POSITIVE_INFINITY);
        expect(1 / Number.parseInt('-0', 10)).toBe(-Number.POSITIVE_INFINITY);
        expect(1 / Number.parseInt('0.5', 10)).toBe(Number.POSITIVE_INFINITY);
    });

    it('returns-nan-without-digits', () => {
        expect(Number.isNaN(Number.parseInt('', 10))).toBe(true);
        expect(Number.isNaN(Number.parseInt('   ', 10))).toBe(true);
        expect(Number.isNaN(Number.parseInt('-', 10))).toBe(true);
        expect(Number.isNaN(Number.parseInt('.5', 10))).toBe(true);
        expect(Number.isNaN(Number.parseInt('abc', 10))).toBe(true);
        expect(Number.isNaN(Number.parseInt('- 1', 10))).toBe(true);
    });

    it('parses-hexadecimal', () => {
        expect(Number.parseInt('ff', 16)).toBe(255);
        expect(Number.parseInt('FF', 16)).toBe(255);
        expect(Number.parseInt('0x1A', 16)).toBe(26);
        expect(Number.parseInt('-ff', 16)).toBe(-255);
        expect(Number.parseInt('1g', 16)).toBe(1);
        expect(Number.isNaN(Number.parseInt('g', 16))).toBe(true);
    });

    it('detects-radix-without-argument', () => {
        expect(Number.parseInt('42')).toBe(42);
        expect(Number.parseInt('0x10')).toBe(16);
        expect(Number.parseInt('010')).toBe(10);
        expect(Number.parseInt('7.9')).toBe(7);
        expect(Number.isNaN(Number.parseInt('x'))).toBe(true);
    });
});
