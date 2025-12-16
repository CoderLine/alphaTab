import { VisualTestHelper } from 'test/visualTests/VisualTestHelper';

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

    it('numbered-tuplets', async () => {
        await VisualTestHelper.runVisualTestTex(
            `
            \\track "Num"
            \\staff {numbered}
            
            C2.2 {tu 3}*3  | 
            C7.2 {tu 3}*3  | 

            C2.16 {tu 3}*3  | 
            C7.16 {tu 3}*3  | 

                
            \\track "Std & Num"
            \\staff {score numbered}
            
            C2.2 {tu 3}*3  | 
            C7.2 {tu 3}*3  | 

            C2.16 {tu 3}*3  | 
            C7.16 {tu 3}*3  | 
            `,
            'test-data/visual-tests/special-tracks/numbered-tuplets.png',
            undefined,
            o => {
                o.tracks = o.score.tracks.map(t => t.index);
            }
        );
    });
});
