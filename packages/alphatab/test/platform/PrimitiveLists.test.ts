import { describe, expect, it } from 'vitest';

describe('PrimitiveListsTests', () => {
    it('boolean-push', () => {
        const flags: boolean[] = [];
        for (let i = 0; i < 6; i++) {
            flags.push(i % 2 === 0);
        }
        flags[1] = true;

        expect(flags.length).toBe(6);
        expect(flags[0]).toBe(true);
        expect(flags[1]).toBe(true);
        expect(flags[5]).toBe(false);
        expect(flags.indexOf(false)).toBe(3);
    });

    it('number-index-of', () => {
        const values: number[] = [];
        values.push(0.5);
        values.push(1);
        values.push(1.5);

        expect(values.indexOf(1)).toBe(1);
        expect(values.indexOf(1.5)).toBe(2);
        expect(values.indexOf(2)).toBe(-1);
        expect(values.indexOf(1) === -1).toBe(false);
    });

    it('number-sort-with-comparison', () => {
        const values: number[] = [];
        values.push(1);
        values.push(0.25);
        values.push(1.5);
        values.push(0.5);
        values.sort((a, b) => b - a);

        expect(values.length).toBe(4);
        expect(values[0]).toBe(1.5);
        expect(values[1]).toBe(1);
        expect(values[2]).toBe(0.5);
        expect(values[3]).toBe(0.25);
    });
});
