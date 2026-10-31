/**
 * Visual coverage tests for skyline behavior at different system sizes.
 *
 * Renders the same score at multiple widths and overlays the assembled
 * `StaffSystemSkyline` on each render. Each width is rendered with a
 * FRESH API instance so the overlay captures the correct per-width state.
 *
 * On first run, each width produces a `.new.png` next to the missing
 * reference. Inspect the images side-by-side: the red (up-side) and blue
 * (down-side) overlay should hug the actual rendered content envelope on
 * every width.
 *
 * Note: we do not exercise `triggerResize` here because the visual-test
 * harness compares snapshots AFTER all renders finish, at which point a
 * resize-style sequence shares one API and `prepareFullImage` would see
 * the final skyline state for every width. Using fresh APIs per width
 * sidesteps that and keeps the visualisation accurate for each width.
 * Lifecycle behaviour under shared-API resize is covered separately by
 * `SkylineResizeFlow.test.ts`.
 */

import { describe, it } from 'vitest';
import { VisualTestHelper, VisualTestOptions } from '../VisualTestHelper';
import { SkylineDebugRenderer } from './SkylineDebugRenderer';

describe('SkylineResizeCoverage', () => {
    async function runAtWidth(name: string, width: number, tex: string): Promise<void> {
        const refPath = `test-data/visual-tests/skyline-resize-coverage/${name}-w${width}.png`;
        const o = VisualTestOptions.tex(tex, refPath);
        o.runs[0].width = width;
        o.prepareFullImage = (_run, api, img) => {
            SkylineDebugRenderer.overlay(api, img);
        };
        await VisualTestHelper.runVisualTestFull(o);
    }

    const mixedContent = `
        \\track "Guitar"
        :4 17.1 19.1 22.1 24.1 |
        12.1{v f} 14.1{v f}.4 :8 15.1 17.1 |
        :4 0.6 0.6 0.6 0.6 |
        :4 12.1 14.1 17.1 0.6 |
        :4 22.1 24.1 17.1 19.1 |
        :4 12.1 12.6 17.1 0.6
    `;

    it('mixed-content at wide width (one system)', async () => {
        await runAtWidth('mixed-content', 1300, mixedContent);
    });

    it('mixed-content at medium width (multiple systems)', async () => {
        await runAtWidth('mixed-content', 800, mixedContent);
    });

    it('mixed-content at narrow width (more systems)', async () => {
        await runAtWidth('mixed-content', 500, mixedContent);
    });

    const beamedEighths = `
        \\track "Guitar"
        :8 22.1 22.1 22.1 22.1 22.1 22.1 22.1 22.1 |
        :8 19.1 19.1 19.1 19.1 17.1 17.1 17.1 17.1 |
        :8 15.1 15.1 15.1 15.1 12.1 12.1 12.1 12.1 |
        :8 24.1 22.1 19.1 17.1 15.1 14.1 12.1 10.1
    `;

    it('beamed-eighths at wide width', async () => {
        await runAtWidth('beamed-eighths', 1300, beamedEighths);
    });

    it('beamed-eighths at narrow width', async () => {
        await runAtWidth('beamed-eighths', 700, beamedEighths);
    });

    const multiVoice = `
        \\track "Guitar"
        \\voice
        :4 22.1 24.1 19.1 17.1 |
        :4 24.1 22.1 19.1 17.1 |
        :4 22.1 24.1 19.1 17.1 |
        :4 24.1 22.1 19.1 17.1
        \\voice
        :4 0.6 0.6 0.6 0.6 |
        :4 0.6 0.6 0.6 0.6 |
        :4 0.6 0.6 0.6 0.6 |
        :4 0.6 0.6 0.6 0.6
    `;

    it('multi-voice at wide width', async () => {
        await runAtWidth('multi-voice', 1300, multiVoice);
    });

    it('multi-voice at narrow width', async () => {
        await runAtWidth('multi-voice', 500, multiVoice);
    });

    const tuplets = `
        \\track "Guitar"
        :8 22.1{tu 3} 22.1{tu 3} 22.1{tu 3} :4 r r r |
        :4 r :8 19.1{tu 3} 19.1{tu 3} 19.1{tu 3} :4 r |
        :4 r r :8 17.1{tu 3} 17.1{tu 3} 17.1{tu 3} |
        :4 r r r :8 15.1{tu 3} 15.1{tu 3} 15.1{tu 3}
    `;

    it('tuplet brackets at wide width', async () => {
        await runAtWidth('tuplet', 1300, tuplets);
    });

    it('tuplet brackets at narrow width', async () => {
        await runAtWidth('tuplet', 700, tuplets);
    });

    const slashRhythm = `
        \\track "Slash"
        \\staff {slash}
        :4 1.1 1.1 1.1 1.1 |
        :8 1.1 1.1 1.1 1.1 1.1 1.1 1.1 1.1 |
        :4 1.1 {tu 3} 1.1 {tu 3} 1.1 {tu 3} 1.1 |
        :16 1.1 1.1 1.1 1.1 :8 1.1 1.1 :4 1.1
    `;

    it('slash-rhythm at wide width', async () => {
        await runAtWidth('slash-rhythm', 1300, slashRhythm);
    });

    it('slash-rhythm at narrow width', async () => {
        await runAtWidth('slash-rhythm', 700, slashRhythm);
    });

    const numberedNotation = `
        \\track "Numbered"
        \\staff {numbered}
        C4.4 D4.4 E4.4 F4.4 |
        C5.4 D5.4 E5.4 F5.4 |
        :8 C4 D4 E4 F4 G4 A4 B4 C5 |
        :16 C4 D4 E4 F4 G4 A4 B4 C5 D5 E5 F5 G5 A5 B5 C6 D6
    `;

    it('numbered-notation at wide width', async () => {
        await runAtWidth('numbered-notation', 1300, numberedNotation);
    });

    it('numbered-notation at narrow width', async () => {
        await runAtWidth('numbered-notation', 700, numberedNotation);
    });
});
