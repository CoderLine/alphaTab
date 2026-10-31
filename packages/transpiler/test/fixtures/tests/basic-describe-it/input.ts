import { describe, it } from 'vitest';

describe('MyTests', () => {
    it('should add', () => {
        const a = 1;
        const b = 2;
        const c = a + b;
        if (c !== 3) {
            throw new Error('fail');
        }
    });

    it('should subtract', () => {
        const a = 5;
        const b = 2;
        const c = a - b;
        if (c !== 3) {
            throw new Error('fail');
        }
    });
});
