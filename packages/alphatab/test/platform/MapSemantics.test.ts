import { describe, expect, it } from 'vitest';

// 1 and -1 as well as 'Aa' and 'BB' share a hash code on the JVM.
describe('MapSemanticsTests', () => {
    it('number-object-keys-with-equal-hash', () => {
        const map = new Map<number, string>();
        map.set(1, 'positive');
        map.set(-1, 'negative');
        expect(map.size).toBe(2);
        expect(map.get(1)).toBe('positive');
        expect(map.get(-1)).toBe('negative');

        map.delete(1);
        expect(map.size).toBe(1);
        expect(map.has(1)).toBe(false);
        expect(map.has(-1)).toBe(true);
        expect(map.get(-1)).toBe('negative');

        map.delete(1);
        expect(map.size).toBe(1);
        expect(map.has(-1)).toBe(true);

        map.delete(-1);
        expect(map.size).toBe(0);
        expect(map.has(-1)).toBe(false);
    });

    it('number-number-keys-with-equal-hash', () => {
        const map = new Map<number, number>();
        map.set(-1, 10);
        map.set(1, 20);
        map.delete(-1);
        expect(map.size).toBe(1);
        expect(map.has(-1)).toBe(false);
        expect(map.get(1)).toBe(20);
    });

    it('number-boolean-keys-with-equal-hash', () => {
        const map = new Map<number, boolean>();
        map.set(1, true);
        map.set(-1, false);
        map.delete(1);
        expect(map.size).toBe(1);
        expect(map.has(1)).toBe(false);
        expect(map.get(-1)).toBe(false);
    });

    it('string-object-keys-with-equal-hash', () => {
        const map = new Map<string, string>();
        map.set('Aa', 'first');
        map.set('BB', 'second');
        expect(map.size).toBe(2);
        expect(map.get('Aa')).toBe('first');
        expect(map.get('BB')).toBe('second');

        map.delete('Aa');
        expect(map.size).toBe(1);
        expect(map.has('Aa')).toBe(false);
        expect(map.get('BB')).toBe('second');
    });

    it('string-number-keys-with-equal-hash', () => {
        const map = new Map<string, number>();
        map.set('Aa', 1);
        map.set('BB', 2);
        map.delete('Aa');
        expect(map.size).toBe(1);
        expect(map.has('Aa')).toBe(false);
        expect(map.get('BB')).toBe(2);
    });

    it('string-boolean-keys-with-equal-hash', () => {
        const map = new Map<string, boolean>();
        map.set('Aa', true);
        map.set('BB', false);
        map.delete('Aa');
        expect(map.size).toBe(1);
        expect(map.has('Aa')).toBe(false);
        expect(map.has('BB')).toBe(true);
    });

    it('set-values-with-equal-hash', () => {
        const strings = new Set<string>();
        strings.add('Aa');
        strings.add('BB');
        strings.delete('Aa');
        expect(strings.size).toBe(1);
        expect(strings.has('Aa')).toBe(false);
        expect(strings.has('BB')).toBe(true);

        const numbers = new Set<number>();
        numbers.add(1);
        numbers.add(-1);
        numbers.delete(1);
        expect(numbers.size).toBe(1);
        expect(numbers.has(1)).toBe(false);
        expect(numbers.has(-1)).toBe(true);
    });

    it('negative-zero-is-zero-key', () => {
        const zero: number = 0;
        const negativeZero: number = -zero;
        expect(1 / negativeZero).toBe(-Number.POSITIVE_INFINITY);

        const map = new Map<number, string>();
        map.set(zero, 'zero');
        map.set(negativeZero, 'negative zero');
        expect(map.size).toBe(1);
        expect(map.get(zero)).toBe('negative zero');
        map.delete(negativeZero);
        expect(map.size).toBe(0);
        expect(map.has(zero)).toBe(false);

        const set = new Set<number>();
        set.add(negativeZero);
        expect(set.has(zero)).toBe(true);
        set.add(zero);
        expect(set.size).toBe(1);
        set.delete(zero);
        expect(set.size).toBe(0);
    });

    it('nan-is-one-key', () => {
        const map = new Map<number, string>();
        map.set(Number.NaN, 'first');
        map.set(Number.NaN, 'second');
        expect(map.size).toBe(1);
        expect(map.has(Number.NaN)).toBe(true);
        expect(map.get(Number.NaN)).toBe('second');
        map.delete(Number.NaN);
        expect(map.size).toBe(0);

        const set = new Set<number>();
        set.add(Number.NaN);
        set.add(Number.NaN);
        expect(set.size).toBe(1);
        expect(set.has(Number.NaN)).toBe(true);
    });

    it('delete-during-iteration-visits-remaining-entries', () => {
        const map = new Map<string, number>();
        map.set('a', 1);
        map.set('b', 2);
        map.set('c', 3);
        let visited = '';
        for (const key of map.keys()) {
            visited += key;
            map.delete(key);
        }
        expect(visited).toBe('abc');
        expect(map.size).toBe(0);
    });
});
