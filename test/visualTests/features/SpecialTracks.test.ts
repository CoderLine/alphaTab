import { VisualTestHelper } from '@test/visualTests/VisualTestHelper';

describe('SpecialTracksTests', () => {
    it('drum-tabs', async () => {
        await VisualTestHelper.runVisualTest('features/special-tracks/drum-tabs.gp');
    });

    it('percussion', async () => {
        await VisualTestHelper.runVisualTest('features/special-tracks/percussion.gp', undefined, [0, 1, 2]);
    });

    it('grand-staff', async () => {
        await VisualTestHelper.runVisualTest('features/special-tracks/grand-staff.gpx');
    });
});
