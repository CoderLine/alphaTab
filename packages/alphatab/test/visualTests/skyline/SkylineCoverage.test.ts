/**
 * Visual coverage tests for the skyline foundation (Phase 1).
 *
 * These tests render representative scores and overlay the assembled
 * up/down skylines on top of the rendered output via {@link SkylineDebugRenderer}.
 * They are NOT pixel-perfect regression tests against an algorithmic ground
 * truth — they exist so a reviewer can visually confirm that the populated
 * skyline matches the bar content envelope on real scores.
 *
 * On first run (no reference image), each test fails and writes a `.new.png`
 * next to the missing reference. Inspect those images: every above-staff
 * notehead, stem, accidental, ledger line, etc. should be covered by the
 * red (up-side) outline; below-staff content by the blue (down-side) outline.
 * Once a `.new.png` looks correct, promote it to the reference path and the
 * test will pass on subsequent runs.
 */

import { describe, it } from 'vitest';
import { VisualTestHelper, VisualTestOptions } from '../VisualTestHelper';
import { SkylineDebugRenderer } from './SkylineDebugRenderer';

describe('SkylineCoverage', () => {
    async function runWithOverlay(referenceFileName: string, tex: string): Promise<void> {
        const o = VisualTestOptions.tex(tex, `test-data/visual-tests/${referenceFileName}`);
        o.prepareFullImage = (_run, api, img) => {
            SkylineDebugRenderer.overlay(api, img);
        };
        await VisualTestHelper.runVisualTestFull(o);
    }

    it('beat-effects-above-and-below', async () => {
        // Beat effects (vibrato / accent / fade) drive the per-beat
        // x-ranged skyline insertion via registerBeatEffectOverflowsForBeat.
        // High frets reach above the staff; low frets sit on the staff
        // baseline. The red outline should rise where the effects/stems
        // climb, and the blue outline should dip below the staff for the
        // low-fret content.
        await runWithOverlay(
            'skyline-coverage/beat-effects-above-and-below.png',
            `
            \\track "Guitar 1"
            12.2{v f} 14.2{v f}.4 :8 15.2 17.2 |
            14.1.2 :8 17.2 15.1 14.1 17.2 |
            15.2{v d}.4 :16 17.2 15.2 :8 14.2 14.1 17.1.4 |
            `
        );
    });

    it('high-and-low-content', async () => {
        // Stretches above and below the staff via fretboard range.
        // Exercises stems, beams, and the pre-/post-beat glyph walk that
        // covers ledger-line-bearing notes.
        await runWithOverlay(
            'skyline-coverage/high-and-low-content.png',
            `
            \\track "Guitar"
            :4 17.1 19.1 22.1 24.1 |
            :4 0.6 0.6 0.6 0.6 |
            :4 12.1 12.6 17.1 0.6
            `
        );
    });

    it('multi-voice', async () => {
        // Multi-voice exercise — BarCollisionHelper may displace rests
        // upward / downward; the resulting overflow registers via the
        // pre/post/voice glyph walk in calculateOverflows.
        await runWithOverlay(
            'skyline-coverage/multi-voice.png',
            `
            \\track "Guitar"
            \\voice
            :4 12.1 12.2 14.1 14.2 |
            :4 15.1 15.2 17.1 17.2
            \\voice
            :4 0.6 0.6 0.6 0.6 |
            :4 0.6 0.6 0.6 0.6
            `
        );
    });

    it('slash-rhythm', async () => {
        // Slash notation — fixed-height slashes on the staff exercise the
        // stem / flag / beam y-bounds path on SlashBarRenderer (which uses
        // a fixed Y for noteheads). Verify the skyline tracks the stems and
        // beam groups above/below the slash staff.
        await runWithOverlay(
            'skyline-coverage/slash-rhythm.png',
            `
            \\track "Slash"
            \\staff {slash}
            :4 1.1 1.1 1.1 1.1 |
            :8 1.1 1.1 1.1 1.1 1.1 1.1 1.1 1.1 |
            :4 1.1 {tu 3} 1.1 {tu 3} 1.1 {tu 3} 1.1
            `
        );
    });

    it('numbered-notation', async () => {
        // Numbered notation — digits on a single line. Tests the per-beat
        // skyline coverage on the numbered staff (digits + duration dashes
        // sit on the line; their renderer-local bbox produces the expected
        // per-beat envelope).
        await runWithOverlay(
            'skyline-coverage/numbered-notation.png',
            `
            \\track "Numbered"
            \\staff {numbered}
            C4.4 D4.4 E4.4 F4.4 |
            C5.4 D5.4 E5.4 F5.4 |
            :8 C4 D4 E4 F4 G4 A4 B4 C5
            `
        );
    });

    it('mixed-staves', async () => {
        // Single track exposing multiple staff types simultaneously.
        // Confirms each staff line's skyline is independently populated
        // and that overlay alignment is correct across stacked staves.
        await runWithOverlay(
            'skyline-coverage/mixed-staves.png',
            `
            \\track "Mixed"
            \\staff {score tabs slash numbered}
            :4 22.1 24.1 19.1 17.1 |
            :4 12.1 14.1 17.1 0.6
            `
        );
    });
});
