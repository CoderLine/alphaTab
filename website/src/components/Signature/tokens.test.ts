import { describe, it } from 'vitest';
import assert from 'node:assert/strict';
import { decodeSignatureTokens } from './tokens';

describe('decodeSignatureTokens', () => {
    it('decodes kinds and link targets', () => {
        assert.deepEqual(decodeSignatureTokens('kreadonly\nw \nimode\nt:\nw \niPlayerMode\t/docs/reference/types/playermode'), [
            ['keyword', 'readonly'],
            ['whitespace', ' '],
            ['identifier', 'mode'],
            ['token', ':'],
            ['whitespace', ' '],
            ['identifier', 'PlayerMode', '/docs/reference/types/playermode'],
        ]);
    });

    it('unescapes separators and backslashes in the text', () => {
        assert.deepEqual(decodeSignatureTokens('i{\\r\\n    size: number;\\r\\n}\nta\\tb\\\\n'), [
            ['identifier', '{\r\n    size: number;\r\n}'],
            ['token', 'a\tb\\n'],
        ]);
    });
});
