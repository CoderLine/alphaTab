import { describe, it } from 'vitest';
import { VisualTestHelper, VisualTestOptions, VisualTestRun } from 'test/visualTests/VisualTestHelper';

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

    it('beaming-anacrusis', async () => {
        // the pick-up forms the end of a full bar: first eighth is the offbeat of beat 1, the others form beat 2
        await VisualTestHelper.runVisualTestTex(
            `
            \\ts 2 4
            \\ac C4.8 D4.8 E4.8 |
            F4.4 G4.4 |
            A4.8 B4.8 C5.8 D5.8 |
            C4.2
            `,
            'test-data/visual-tests/special-notes/beaming-anacrusis.png'
        );
    });

    it('full-bar-notes-rests', async () => {
        await VisualTestHelper.runVisualTestTex(
            `
                C4 {slur s1} | C4 {slur s1} .1 | r.4 | r.1
                \\ts(3 8) C4{slur S2}.4 {d} | C4 {slur S2} |
                \\ts(4 4) C4{gr} C4.1
            `,
            'test-data/visual-tests/special-notes/full-bar-notes-rests.png'
        );
    });
});
