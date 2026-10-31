import { describe, expect, it } from 'vitest';

describe('ArraySpliceTests', () => {
    it('returns-removed-elements-from-middle', () => {
        const list: string[] = ['a', 'b', 'c', 'd', 'e'];
        const removed = list.splice(1, 2);

        expect(removed.join(',')).toBe('b,c');
        expect(list.join(',')).toBe('a,d,e');
    });

    it('returns-removed-elements-with-insert', () => {
        const list: string[] = ['a', 'b', 'c', 'd', 'e'];
        const removed = list.splice(2, 1, 'x', 'y');

        expect(removed.join(',')).toBe('c');
        expect(list.join(',')).toBe('a,b,x,y,d,e');
    });

    it('returns-nothing-for-insert-only', () => {
        const list: string[] = ['a', 'b', 'c'];
        const removed = list.splice(1, 0, 'x');

        expect(removed.length).toBe(0);
        expect(list.join(',')).toBe('a,x,b,c');
    });

    it('removes-to-end', () => {
        const list: string[] = ['a', 'b', 'c', 'd'];
        const removed = list.splice(1);

        expect(removed.join(',')).toBe('b,c,d');
        expect(list.join(',')).toBe('a');
    });
});
