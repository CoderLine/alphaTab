import { describe, it } from 'vitest';

describe('Outer', () => {
    describe('Inner', () => {
        it('inner test', () => {
            const x = 1;
            if (x !== 1) {
                throw new Error('fail');
            }
        });
    });
});
