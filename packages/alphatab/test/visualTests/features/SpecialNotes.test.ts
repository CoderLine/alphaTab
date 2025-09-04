import { VisualTestHelper, VisualTestOptions, VisualTestRun } from '@test/visualTests/VisualTestHelper';

describe('SpecialNotesTests', () => {
    it('tied-notes', async () => {
        await VisualTestHelper.runVisualTest('special-notes/tied-notes.gp');
    });

    it('grace-notes', async () => {
        await VisualTestHelper.runVisualTest('special-notes/grace-notes.gp');
    });

    it('grace-notes-advanced', async () => {
        await VisualTestHelper.runVisualTest('special-notes/grace-notes-advanced.gp', undefined, o => {
            o.tracks = [0, 1];
        });
    });

    it('grace-resize', async () => {
        // grace resize regression: we have the repeating issue that
        // grace notes flick around to wrong positions during resizes
        // due to wrong size registrations. (#604)
        const options = await VisualTestOptions.file('special-notes/grace-notes-advanced.gp', [
            new VisualTestRun(1300, 'test-data/visual-tests/special-notes/grace-notes-advanced-1300.png'),
            new VisualTestRun(1300, 'test-data/visual-tests/special-notes/grace-notes-advanced-1300-2.png'),
            new VisualTestRun(800, 'test-data/visual-tests/special-notes/grace-notes-advanced-800.png')
        ]);
        options.tracks = [0, 1];
        await VisualTestHelper.runVisualTestFull(options);
    });

    it('grace-alignment', async () => {
        await VisualTestHelper.runVisualTest('special-notes/grace-notes-alignment.gp', undefined, o => {
            o.tracks = [0, 1];
        });
    });

    it('dead-notes', async () => {
        await VisualTestHelper.runVisualTest('special-notes/dead-notes.gp');
    });

    it('ghost-notes', async () => {
        await VisualTestHelper.runVisualTest('special-notes/ghost-notes.gp');
    });

    it('beaming-mode', async () => {
        await VisualTestHelper.runVisualTest('special-notes/beaming-mode.gp');
    });
});
