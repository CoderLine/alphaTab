import { VisualTestHelper } from '@test/visualTests/VisualTestHelper';

describe('SpecialNotesTests', () => {
    it('tied-notes', async () => {
        await VisualTestHelper.runVisualTest('special-notes/tied-notes.gp');
    });

    it('grace-notes', async () => {
        await VisualTestHelper.runVisualTest('special-notes/grace-notes.gp');
    });

    it('grace-notes-advanced', async () => {
        await VisualTestHelper.runVisualTest('special-notes/grace-notes-advanced.gp', undefined, [0, 1]);
    });

    it('grace-resize', async () => {
        // grace resize regression: we have the repeating issue that 
        // grace notes flick around to wrong positions during resizes
        // due to wrong size registrations. (#604)
        await VisualTestHelper.runVisualTest('special-notes/grace-notes-advanced.gp', undefined, [0, 1], undefined, 1, true);
    });

    it('dead-notes', async () => {
        await VisualTestHelper.runVisualTest('special-notes/dead-notes.gp');
    });

    it('ghost-notes', async () => {
        await VisualTestHelper.runVisualTest('special-notes/ghost-notes.gp');
    });
});
