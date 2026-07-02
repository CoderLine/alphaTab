import { describe, it } from 'vitest';

describe('Helpers', () => {
    const helper = (n: number): number => n * 2;

    it('uses helper', () => {
        const result = helper(5);
        if (result !== 10) {
            throw new Error('fail');
        }
    });
});
