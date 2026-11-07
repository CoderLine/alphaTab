import { VisualTestHelper } from 'test/visualTests/VisualTestHelper';
import { describe, it } from 'vitest';

describe('TablEditTests', () => {
    it('effects', async () => {
        await VisualTestHelper.runVisualTest('tabledit/effects-b5.tef');
    });

    it('tuplets', async () => {
        await VisualTestHelper.runVisualTest('tabledit/tuplets.tef');
    });

    it('reading-list', async () => {
        await VisualTestHelper.runVisualTest('tabledit/reading-list-voltas.tef');
    });

    it('chords', async () => {
        await VisualTestHelper.runVisualTest('tabledit/markers-text-chords.tef');
    });

    it('voices-ties', async () => {
        await VisualTestHelper.runVisualTest('tabledit/voices-ties.tef');
    });
});
