import { SystemsLayoutMode } from '@coderline/alphatab/DisplaySettings';
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

    it('numbered-durations', async () =>{
        await VisualTestHelper.runVisualTestTex(
            `
            \\bracketExtendMode noBrackets
            \\track {defaultSystemsLayout 1}
            \\staff {numbered}
                \\section ("16th notes")
                C4.16 * 16 |

                \\section ("8th notes")
                C4.8 * 8 |
                \\section ("8th notes dotted")
                C4.8 {d} * 6 r.16 |
                \\section ("8th notes double-dotted")
                C4.8 {dd} * 4 r.8 |

                \\section ("Quarter notes")
                C4.4 * 4 |
                \\section ("Quarter notes dotted")
                C4.4 {d} * 2 r.4 |
                \\section ("Quarter notes double-dotted")
                C4.4 {dd} * 2 r.8 |

                \\section ("Half notes")
                C4.2 * 2 |
                \\section ("Half notes dotted")
                C4.2 {d}  r.4 |
                \\section ("Half notes double dotted")
                C4.2 {dd}  r.8 |

                \\section ("Whole notes")
                \\ts (8 4)
                C4.1 * 2 |
                \\section ("Half notes dotted")
                C4.1 {d}  r.2 |
                \\section ("Half notes double dotted")
                C4.1 {dd}  r.4 |

            \\staff {numbered}
                C4.4 * 4 |
                
                C4.4 * 4 |
                C4.4 * 4 |
                C4.4 * 4 |

                C4.4 * 4 |
                C4.4 * 4 |
                C4.4 * 4 |

                C4.4 * 4 |
                C4.4 * 4 |
                C4.4 * 4 |

                C4.4 * 8 |
                C4.4 * 8 |
                C4.4 * 8 |
                
                r
            `,
            'test-data/visual-tests/special-tracks/numbered-durations.png',
            undefined,
            o => {
                o.settings.display.systemsLayoutMode = SystemsLayoutMode.UseModelLayout;
                o.tracks = o.score.tracks.map(t => t.index);
            }
        );
    })
});
