import { Settings } from '@src/Settings';
import { VisualTestHelper } from '@test/visualTests/VisualTestHelper';

describe('SpecialNotesTests', () => {
    it('tied-notes', async () => {
        await VisualTestHelper.runVisualTest('features/special-notes/tied-notes.gp5');
    });

    it('grace-notes', async () => {
        await VisualTestHelper.runVisualTest('features/special-notes/grace-notes.gp5');
    });

    it('grace-notes-advanced', async () => {
        await VisualTestHelper.runVisualTest('features/special-notes/grace-notes-advanced.gp', undefined, [0, 1]);
    });

    it('dead-notes', async () => {
        await VisualTestHelper.runVisualTest('features/special-notes/dead-notes.gp5');
    });

    it('ghost-notes', async () => {
        await VisualTestHelper.runVisualTest('features/special-notes/ghost-notes.gp5');
    });
});
