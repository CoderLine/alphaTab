import { describe, it } from 'vitest';
import { LayoutMode } from '@coderline/alphatab/LayoutMode';
import { Settings } from '@coderline/alphatab/Settings';
import { VisualTestHelper } from 'test/visualTests/VisualTestHelper';

/**
 * Behaviour-focused coverage for the horizontal spacing subsystem.
 *
 * The tests in this file each target one specific invariant of the Gourlay spring-based
 * spacing algorithm rather than broad rendering smoke-tests. They are intended as
 * regression guards for layout changes that touch `BarLayoutingInfo`, `StaffSystem` or
 * `VerticalLayoutBase._scaleToWidth`.
 *
 * Two axes of behaviour are covered:
 *
 *  - **System-wide minimum-duration reference.** The Gourlay stretch formula uses the
 *    shortest note of the entire system (not of each bar) so that rhythmically-equivalent
 *    beats across bars of the same system receive spring constants derived from the same
 *    reference. The `shared-min-duration-*` tests exercise this end-to-end: the core fix,
 *    both positions of the shorter note during system assembly, multiple successive
 *    shortenings, per-system isolation, mode-specific variants and the resize path.
 *
 *  - **Stretch-formula duration scaling.** The Gourlay log-scale formula produces spacing
 *    that grows with note duration. `stretch-formula-*` tests pin the current coefficient
 *    choices so an accidental change (or a deliberate formula swap) is caught explicitly
 *    rather than hiding inside a bulk baseline regeneration.
 *
 * Bar content used in the short-note tests is tuned to exactly fill 4/4 (3840 ticks) so
 * that alphaTex does not auto-pad or truncate and the rendered layout reflects only the
 * spacing behaviour under test. The padding pattern `:8 r :16 r :32 r :64 r` (= 900 ticks)
 * pairs with "3 quarters + a 60-tick short-duration slot" (128th triplet or four 256ths)
 * to reach the bar total.
 *
 * The short-duration slot uses rests rather than notes - a `:128 {tu 3} r r r` still
 * pushes the bar-local minimum duration to 20 ticks (which is what the phase-B tests
 * need) but renders as compact rest glyphs. Using notes in that slot would stack three
 * noteheads at almost the same x-position under heavy 128th beaming, producing a visually
 * unreadable cluster that obscures the quarters we actually want to compare across bars.
 */
describe('SystemSpacingTests', () => {
    it('shared-min-duration-aligns-same-duration-notes', async () => {
        // Bar 1: four quarters. No sub-30-tick spring, so the bar-local minimum falls back
        // to the default reference (30 ticks).
        // Bar 2: three quarters plus a 128th-triplet rest slot (20 ticks per rest),
        // pushing the bar-local minimum below the default. With per-bar minimums the two
        // bars would produce different spring constants for their shared quarter-note
        // positions; with a shared system minimum they produce the same spring constant,
        // so the quarters in bar 1 and bar 2 line up column-by-column.
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track { defaultSystemsLayout 2 }
            \\ts 4 4
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 :128 {tu 3} r r r :8 r :16 r :32 r :64 r
            `,
            'test-data/visual-tests/system-spacing/shared-min-duration-aligns-same-duration-notes.png',
            settings
        );
    });

    it('shared-min-duration-reconciles-on-resize', async () => {
        // Same score content as the alignment test, rendered at a narrower width so that
        // the reconcile path runs under a tighter fit (distributable share smaller, force
        // differs from the wider case). Guards the reconcile-on-fit path when a system is
        // re-sized after layout.
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track { defaultSystemsLayout 2 }
            \\ts 4 4
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 :128 {tu 3} r r r :8 r :16 r :32 r :64 r
            `,
            '',
            settings,
            o => {
                o.runs[0].width = 900;
                o.runs[0].referenceFileName =
                    'test-data/visual-tests/system-spacing/shared-min-duration-reconciles-on-resize.png';
            }
        );
    });

    it('shared-min-duration-shorter-note-first', async () => {
        // Bar 1 already carries the system's shortest note (128th triplet). Bars 2 and 3
        // hold only quarters, so their bar-local minimum falls back to the default. When
        // each subsequent bar is added, the system's existing minimum is already lower
        // than the bar's local one, so the system minimum does not move and no reconcile
        // is flagged; instead, each newly-added bar has its spring constants recomputed
        // immediately so it references the system minimum. This exercises the
        // "eager-recompute-on-add" branch of `_trackSystemMinDuration`.
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track { defaultSystemsLayout 3 }
            \\ts 4 4
            :4 c4 c4 c4 :128 {tu 3} r r r :8 r :16 r :32 r :64 r |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4
            `,
            'test-data/visual-tests/system-spacing/shared-min-duration-shorter-note-first.png',
            settings
        );
    });

    it('shared-min-duration-multiple-short-arrivals', async () => {
        // Successive shortenings of the system minimum: bar 2 introduces a 128th triplet
        // rest (20 ticks per rest), bar 4 introduces 256th rests (15 ticks each). When
        // bar 2 is added the reconcile flag is set for bar 1; when bar 4 is added the
        // flag is re-asserted for bars 1-3. A single reconcile pass at fit time must
        // re-derive all stale bars in one iteration, not once per shortening event.
        //
        // Bar 4's padding uses an extra `:128 r` (30 ticks) compared to bar 2, because
        // bar 4's short slot is only 30 ticks (two 256th rests) whereas bar 2's is 60
        // ticks (three 128th-triplet rests).
        //
        // This test is rendered at a wider canvas (1800 px) than the rest of the suite
        // because the system is forced to hold all four heavy bars in a single row.
        // The natural content width at min-stretch-force (dominated by the 256th-rest
        // spring, bbox ~2.16 staff spaces = ~16 px) exceeds the default 1300 px staff,
        // which would push content-share below 1 and force the 256th rests below their
        // minimum spacing - producing visible glyph overlap that is a rendering artefact
        // of the over-packed system, not of the spacing algorithm.
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track { defaultSystemsLayout 4 }
            \\ts 4 4
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 :128 {tu 3} r r r :8 r :16 r :32 r :64 r |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 :256 r r :8 r :16 r :32 r :64 r :128 r
            `,
            '',
            settings,
            o => {
                o.runs[0].width = 1800;
                o.runs[0].referenceFileName =
                    'test-data/visual-tests/system-spacing/shared-min-duration-multiple-short-arrivals.png';
            }
        );
    });

    it('shared-min-duration-per-system-isolation', async () => {
        // Four bars laid out as two systems of two bars each. System 1 holds pure quarters
        // (local minimum falls back to the default). System 2 holds quarters plus a 128th
        // triplet (minimum drops to 20 ticks). Because the shared-minimum reference lives
        // on `StaffSystem` rather than being score-wide, system 1's spacing must not be
        // influenced by system 2's shorter notes - each system's bars use only their own
        // system's minimum.
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track { defaultSystemsLayout 2 }
            \\ts 4 4
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 :128 {tu 3} r r r :8 r :16 r :32 r :64 r |
            :4 c4 c4 c4 :128 {tu 3} r r r :8 r :16 r :32 r :64 r
            `,
            'test-data/visual-tests/system-spacing/shared-min-duration-per-system-isolation.png',
            settings
        );
    });

    it('shared-min-duration-page-automatic', async () => {
        // Same two-bar score as the core alignment test, but rendered in Page layout with
        // the Automatic systems mode (the default). In this mode the system distributes
        // the distributable staff width across bars by their natural content width, not
        // by authored `displayScale`. The system-wide minimum fix applies equally here:
        // bar 1 and bar 2 share a reference so their quarter-note spring constants match,
        // and each bar's natural content width reflects the shared spacing.
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track { defaultSystemsLayout 2 }
            \\ts 4 4
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 :128 {tu 3} r r r :8 r :16 r :32 r :64 r
            `,
            'test-data/visual-tests/system-spacing/shared-min-duration-page-automatic.png',
            settings
        );
    });

    it('shared-min-duration-horizontal-preserves-local', async () => {
        // Horizontal layout sizes each bar independently (by `bar.displayWidth` or the
        // bar's intrinsic width) - there is no shared staff width to distribute across
        // bars. The `StaffSystem.shareMinDurationAcrossBars` flag is set to `false` for
        // this layout so each bar's spring constants stay referenced against its local
        // minimum, preserving the historical per-bar rendering. This test guards the
        // opt-out: under shared-minimum bar 1 would have its quarters widened to match
        // bar 2's reference, which must NOT happen in Horizontal.
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Horizontal;
        await VisualTestHelper.runVisualTestTex(
            `
            \\ts 4 4
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 :128 {tu 3} r r r :8 r :16 r :32 r :64 r
            `,
            'test-data/visual-tests/system-spacing/shared-min-duration-horizontal-preserves-local.png',
            settings
        );
    });

    it('stretch-formula-duration-spacing', async () => {
        // A single bar with three distinct durations - half, quarter, two eighths - laid
        // out in decreasing order. Under the current log-scale Gourlay formula
        // `phi = 1 + 0.85 * log2(duration / minDuration)` the half-note occupies visibly
        // more horizontal space than the quarter, which occupies more than each eighth.
        // No short notes are involved, so this test also validates the non-phase-B path
        // and pins the current formula's proportions: a coefficient change or a switch to
        // linear / square-root spacing would shift this baseline.
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track { defaultSystemsLayout 1 }
            \\ts 4 4
            :2 c4 :4 c4 :8 c4 c4
            `,
            'test-data/visual-tests/system-spacing/stretch-formula-duration-spacing.png',
            settings
        );
    });
});
