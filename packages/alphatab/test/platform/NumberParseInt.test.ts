// biome-ignore-all lint/complexity/useNumericLiterals: the subject under test is parseInt itself
// biome-ignore-all lint/correctness/useParseIntRadix: covers parseInt without radix
import { describe, expect, it } from 'vitest';

describe('NumberParseIntTests', () => {
    it('parses-integers', () => {
        expect(Number.parseInt('42', 10)).toBe(42);
        expect(Number.parseInt('-12', 10)).toBe(-12);
        expect(Number.parseInt('4294967295', 10) - 4294967294).toBe(1);
    });

    it('ignores-surrounding-whitespace', () => {
        expect(Number.parseInt(' 3', 10)).toBe(3);
        expect(Number.parseInt('3 ', 10)).toBe(3);
    });

    it('truncates-fractions', () => {
        expect(Number.parseInt('3.5', 10)).toBe(3);
        expect(Number.parseInt('5.5', 10)).toBe(5);
        expect(Number.parseInt('-4.5', 10)).toBe(-4);
        expect(Number.parseInt('-0.5', 10) === 0).toBe(true);
    });

    it('returns-nan-without-number', () => {
        expect(Number.isNaN(Number.parseInt('', 10))).toBe(true);
        expect(Number.isNaN(Number.parseInt('error', 10))).toBe(true);
    });

    it('parses-hexadecimal', () => {
        expect(Number.parseInt('ff', 16)).toBe(255);
        expect(Number.parseInt('ED', 16)).toBe(237);
        expect(Number.parseInt('7', 16)).toBe(7);
        expect(Number.isNaN(Number.parseInt('XXXX', 16))).toBe(true);
    });

    it('parses-without-radix', () => {
        expect(Number.parseInt('42')).toBe(42);
    });
});
