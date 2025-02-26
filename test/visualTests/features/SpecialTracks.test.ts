import { VisualTestHelper } from '@test/visualTests/VisualTestHelper';

describe('SpecialTracksTests', () => {
    it('drum-tabs', async () => {
        await VisualTestHelper.runVisualTest('special-tracks/drum-tabs.gp');
    });

    it('percussion', async () => {
        await VisualTestHelper.runVisualTest('special-tracks/percussion.gp', undefined, o => {
            o.tracks = [0, 1, 2];
        });
    });

    it('grand-staff', async () => {
        await VisualTestHelper.runVisualTest('special-tracks/grand-staff.gp');
    });

    it('slash', async () => {
        await VisualTestHelper.runVisualTest('special-tracks/slash.gp');
    });

    it('numbered', async () => {
        await VisualTestHelper.runVisualTest('special-tracks/numbered.gp');
    });
});
