import { Color } from '@src/model/Color';
import { VisualTestHelper, VisualTestOptions } from '../VisualTestHelper';
import { AlphaSkiaCanvas } from '@coderline/alphaskia';
import type { BoundsLookup } from '@src/rendering/utils/BoundsLookup';
import { Bounds } from '@src/rendering/utils/Bounds';

describe('BoundsLookupRenderingTests', () => {
    async function runTest(referenceFileName: string, color: Color, collectBounds: (bounds: BoundsLookup) => Bounds[]) {
        const o = VisualTestOptions.tex(
            `
        \\track "Guitar 1"
        12.2{v f} 14.2{v f}.4 :8 15.2 17.2 |
        14.1.2 :8 17.2 15.1 14.1{h} 17.2 |
        15.2{v d}.4 :16 17.2{h} 15.2 :8 14.2 14.1 17.1{b(0 4 4 0)}.4 |
        15.1.8 :16 14.1{tu 3} 15.1{tu 3} 14.1{tu 3} :8 17.2 15.1 14.1 :16 12.1{tu 3} 14.1{tu 3} 12.1{tu 3} :8 15.2 14.2 |
        12.2 14.3 12.3 15.2 :32 14.2{h} 15.2{h} 14.2{h} 15.2{h}14.2{h} 15.2{h}14.2{h} 15.2{h}14.2{h} 15.2{h}14.2{h} 15.2{h}14.2{h} 15.2{h}14.2{h} 15.2{h}
        \\track "Guitar 2"
        3.3 
        `,
            `test-data/visual-tests/${referenceFileName}`
        );
        o.tracks = [0, 1];
        o.prepareFullImage = (_run, api, img) => {
            const boundsLookup = api.renderer.boundsLookup!;
            for (const bounds of collectBounds(boundsLookup)) {
                img.color = AlphaSkiaCanvas.rgbaToColor(color.r, color.g, color.b, 128);
                img.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
                img.color = AlphaSkiaCanvas.rgbaToColor(color.r, color.g, color.b, 255);
                img.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h);
            }
        };
        o.settings!.core.includeNoteBounds = true;

        await VisualTestHelper.runVisualTestFull(o);
    }

    it('visual-system', async () => {
        await runTest('bounds-lookup/visual-system.png', new Color(0x19, 0x76, 0xd2), lookup => {
            const bounds: Bounds[] = [];
            for (const system of lookup.staffSystems) {
                bounds.push(system.visualBounds);
            }
            return bounds;
        });
    });

    it('real-system', async () => {
        await runTest('bounds-lookup/real-system.png', new Color(0x19, 0x76, 0xd2), lookup => {
            const bounds: Bounds[] = [];
            for (const system of lookup.staffSystems) {
                bounds.push(system.realBounds);
            }
            return bounds;
        });
    });

    it('visual-master', async () => {
        await runTest('bounds-lookup/visual-master.png', new Color(0x38, 0x8e, 0x3c), lookup => {
            const bounds: Bounds[] = [];
            for (const system of lookup.staffSystems) {
                for (const masterBar of system.bars) {
                    bounds.push(masterBar.visualBounds);
                }
            }
            return bounds;
        });
    });

    it('real-master', async () => {
        await runTest('bounds-lookup/real-master.png', new Color(0x38, 0x8e, 0x3c), lookup => {
            const bounds: Bounds[] = [];
            for (const system of lookup.staffSystems) {
                for (const masterBar of system.bars) {
                    bounds.push(masterBar.realBounds);
                }
            }
            return bounds;
        });
    });

    it('visual-bar', async () => {
        await runTest('bounds-lookup/visual-bar.png', new Color(0xfd, 0xd8, 0x35), lookup => {
            const bounds: Bounds[] = [];
            for (const system of lookup.staffSystems) {
                for (const masterBar of system.bars) {
                    for (const bar of masterBar.bars) {
                        bounds.push(bar.visualBounds);
                    }
                }
            }
            return bounds;
        });
    });

    it('real-bar', async () => {
        await runTest('bounds-lookup/real-bar.png', new Color(0xfd, 0xd8, 0x35), lookup => {
            const bounds: Bounds[] = [];
            for (const system of lookup.staffSystems) {
                for (const masterBar of system.bars) {
                    for (const bar of masterBar.bars) {
                        bounds.push(bar.realBounds);
                    }
                }
            }
            return bounds;
        });
    });

    it('visual-beat', async () => {
        await runTest('bounds-lookup/visual-beat.png', new Color(0xe6, 0x4a, 0x19), lookup => {
            const bounds: Bounds[] = [];
            for (const system of lookup.staffSystems) {
                for (const masterBar of system.bars) {
                    for (const bar of masterBar.bars) {
                        for (const beat of bar.beats) {
                            bounds.push(beat.visualBounds);
                        }
                    }
                }
            }
            return bounds;
        });
    });

    it('real-beat', async () => {
        await runTest('bounds-lookup/real-beat.png', new Color(0xe6, 0x4a, 0x19), lookup => {
            const bounds: Bounds[] = [];
            for (const system of lookup.staffSystems) {
                for (const masterBar of system.bars) {
                    for (const bar of masterBar.bars) {
                        for (const beat of bar.beats) {
                            bounds.push(beat.realBounds);
                        }
                    }
                }
            }
            return bounds;
        });
    });

    it('onnotes-beat', async () => {
        await runTest('bounds-lookup/onnotes-beat.png', new Color(0xe6, 0x4a, 0x19), lookup => {
            const bounds: Bounds[] = [];
            for (const system of lookup.staffSystems) {
                for (const masterBar of system.bars) {
                    for (const bar of masterBar.bars) {
                        for (const beat of bar.beats) {
                            const b = new Bounds();
                            b.x = beat.onNotesX;
                            b.y = beat.realBounds.y;
                            b.w = 1;
                            b.h = beat.realBounds.h;
                            bounds.push(b);
                        }
                    }
                }
            }
            return bounds;
        });
    });

    it('visual-note', async () => {
        await runTest('bounds-lookup/visual-note.png', new Color(0x51, 0x2d, 0xa8), lookup => {
            const bounds: Bounds[] = [];
            for (const system of lookup.staffSystems) {
                for (const masterBar of system.bars) {
                    for (const bar of masterBar.bars) {
                        for (const beat of bar.beats) {
                            if (beat.notes) {
                                for (const note of beat.notes!) {
                                    bounds.push(note.noteHeadBounds);
                                }
                            }
                        }
                    }
                }
            }
            return bounds;
        });
    });

    it('real-note', async () => {
        await runTest('bounds-lookup/real-note.png', new Color(0x51, 0x2d, 0xa8), lookup => {
            const bounds: Bounds[] = [];
            for (const system of lookup.staffSystems) {
                for (const masterBar of system.bars) {
                    for (const bar of masterBar.bars) {
                        for (const beat of bar.beats) {
                            if (beat.notes) {
                                for (const note of beat.notes!) {
                                    bounds.push(note.noteHeadBounds);
                                }
                            }
                        }
                    }
                }
            }
            return bounds;
        });
    });
});
