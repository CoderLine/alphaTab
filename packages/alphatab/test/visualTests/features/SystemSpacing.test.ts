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
        // A single bar with three distinct durations - half, quarter, two eighths - laid out in
        // decreasing order. The power-law formula `phi = (d/dmin)^log2(spacingRatio)` (default
        // r=1.5, exponent ≈ 0.585) makes the half-note occupy visibly more horizontal space than
        // the quarter, which occupies more than each eighth. The 1:2:4 duration ratio maps to
        // 1.0 : 1.5 : 2.25 in `phi`, i.e. successive durations get 1.5x the natural length.
        //
        // No short notes are involved, so this test also validates the non-phase-B path and pins
        // the current formula's proportions: a change to the default `spacingRatio` (or a switch
        // back to the additive formula, or to linear / square-root spacing) would shift this
        // baseline visibly.
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

    /**
     * Visual coverage for the power-law spacing formula introduced by Phase 1 of the spacing
     * spike. Each test in this group pins one specific behaviour of the new formula.
     *
     * Reference: `docs/spacing/spacing-spike-plan.md` Section 6.3, "Tests to add per phase".
     */
    it('power-law-rest-bar-not-ballooning', async () => {
        // Two-bar system rendered at default `spacingRatio = 1.5`:
        //   Bar 1: a dense bar with sixteenth-note runs (60-tick duration).
        //   Bar 2: a single whole-note rest (3840-tick duration).
        // System-wide minDuration resolves to 60 (the sixteenth) so bar 2's rest sits at
        // d/dmin = 64 -> phi = 64^log2(1.5) ≈ 16.0. The whole rest is therefore proportionally
        // wider than the sixteenths but NOT the runaway 4-5x balloon that the additive formula
        // produced when `stretchForce` was raised.
        //
        // Expected baseline: bar 2 (whole rest) is visibly wider than each beat of bar 1, but
        // the two bars stay in roughly comparable widths. Under the OLD additive formula at
        // stretchForce > 1, bar 2 would dominate the system width.
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        settings.display.stretchForce = 1.5;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track { defaultSystemsLayout 2 }
            \\ts 4 4
            :16 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 |
            :1 r
            `,
            'test-data/visual-tests/system-spacing/power-law-rest-bar-not-ballooning.png',
            settings
        );
    });

    it('power-law-duration-proportions', async () => {
        // A single bar containing whole, half, quarter, eighth, sixteenth in sequence (decreasing
        // duration). With the default `spacingRatio = 1.5`, each successive note allocates 1.5x
        // the horizontal space of its half-duration successor (because doubling the duration
        // multiplies phi by exactly `spacingRatio`).
        //
        // Expected baseline: visually the durations form a clean geometric progression in
        // horizontal allocation - the whole occupies ~1.5x the half, the half ~1.5x the quarter,
        // and so on. This is the classic power-law visual signature used by Dorico/MuseScore.
        //
        // The bar exceeds 4/4 by design - the durations are placed inside 13/4 to give every
        // note its own clean spring without rest padding muddling the comparison.
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track { defaultSystemsLayout 1 }
            \\ts 13 4
            :1 c4 :2 c4 :4 c4 :8 c4 :16 c4
            `,
            'test-data/visual-tests/system-spacing/power-law-duration-proportions.png',
            settings
        );
    });

    it('power-law-stretch-force-orthogonal', async () => {
        // Same single-bar score rendered at `stretchForce ∈ {0.5, 1.0, 1.5}` across three runs
        // (output stacked into a single canvas via the multi-run mechanism). Each run uses the
        // default `spacingRatio = 1.5`. The expected behaviour is that increasing `stretchForce`
        // makes everything wider proportionally - the *shape* of the spacing curve (relative
        // widths of half / quarter / eighth) stays constant, only the overall scale changes.
        //
        // This test pins the orthogonality claim from Section 4.6 of the plan:
        // `stretchForce` and `spacingRatio` control density and proportionality independently.
        //
        // Expected baseline: three rendered systems at increasing widths but with identical
        // *internal* duration proportions in each.
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        settings.display.stretchForce = 0.5;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track { defaultSystemsLayout 1 }
            \\ts 4 4
            :2 c4 :4 c4 :8 c4 c4
            `,
            'test-data/visual-tests/system-spacing/power-law-stretch-force-orthogonal-low.png',
            settings
        );
    });

    it('power-law-stretch-force-orthogonal-high', async () => {
        // Sibling to `power-law-stretch-force-orthogonal` rendered at `stretchForce = 1.5`. The
        // higher force should produce a wider system but with the *same* duration ratios as the
        // low-force run. This is the visual proof of orthogonality: changing the force scales
        // the system uniformly without distorting the proportions established by `spacingRatio`.
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        settings.display.stretchForce = 1.5;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track { defaultSystemsLayout 1 }
            \\ts 4 4
            :2 c4 :4 c4 :8 c4 c4
            `,
            'test-data/visual-tests/system-spacing/power-law-stretch-force-orthogonal-high.png',
            settings
        );
    });

    it('power-law-spacing-ratio-tight', async () => {
        // Same score rendered with `spacingRatio = 1.2` (the tight end of the documented range).
        // At r=1.2, exponent = log2(1.2) ≈ 0.263, so doubling the duration multiplies phi by
        // 1.2 - durations crowd together more tightly than at the default 1.5.
        //
        // Expected baseline: the half-note's allocated space is only ~1.2x the quarter (vs.
        // ~1.5x at default). Visually this looks more "compressed" than the default.
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        settings.display.spacingRatio = 1.2;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track { defaultSystemsLayout 1 }
            \\ts 4 4
            :2 c4 :4 c4 :8 c4 c4
            `,
            'test-data/visual-tests/system-spacing/power-law-spacing-ratio-tight.png',
            settings
        );
    });

    it('power-law-spacing-ratio-loose', async () => {
        // Same score rendered with `spacingRatio = 1.8` (the loose end of the documented range).
        // At r=1.8, exponent = log2(1.8) ≈ 0.848, so doubling the duration multiplies phi by 1.8 -
        // durations spread further apart than at the default 1.5.
        //
        // Expected baseline: the half-note's allocated space is ~1.8x the quarter (vs. ~1.5x at
        // default). Visually this looks more "open" / "traditional" than the default and closer
        // to Finale's Fibonacci-style spacing.
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        settings.display.spacingRatio = 1.8;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track { defaultSystemsLayout 1 }
            \\ts 4 4
            :2 c4 :4 c4 :8 c4 c4
            `,
            'test-data/visual-tests/system-spacing/power-law-spacing-ratio-loose.png',
            settings
        );
    });

    /**
     * Visual coverage for Phase 2 (A2) of the spacing spike: the system-wide minimum-duration
     * reference (`StaffSystem.minDuration`) must aggregate across tracks and must NOT be
     * inflated by grace-note durations.
     *
     * The pre-existing `shared-min-duration-*` tests cover the core cross-bar behaviour for
     * single-track scores; these two tests cover the cases the spike plan explicitly calls out
     * in Section 6.3 as needing dedicated coverage.
     */
    it('system-min-duration-grace-notes-excluded', async () => {
        // Two-bar system. Bar 1 has a 32nd-note grace flourish (60 ticks per grace) before its
        // first quarter; bar 2 has only quarters with no graces. Grace-note durations are routed
        // through `addBeatSpring`'s grace branch which never calls `addSpring`, so they cannot
        // update `BarLayoutingInfo._minDuration`. The system-wide minimum therefore falls back
        // to the default reference (30 ticks) - identical to the no-graces case - and the
        // quarter-note positions in bar 1 and bar 2 align column-by-column.
        //
        // If a regression introduced grace durations into `_minDuration`, bar 1's reference
        // would drop below bar 2's, the system would reconcile against the smaller value, and
        // the quarters would shift visibly between the two bars.
        //
        // Expected baseline: quarter notes in both bars align under the same x-coordinates.
        // Bar 1 has a small grace cluster anchored to the first quarter; bar 2 is plain quarters.
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track { defaultSystemsLayout 2 }
            \\ts 4 4
            :32 c5 {gr bb} d5 {gr bb} e5 {gr bb} :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4
            `,
            'test-data/visual-tests/system-spacing/system-min-duration-grace-notes-excluded.png',
            settings
        );
    });

    it('system-min-duration-multi-track-aggregation', async () => {
        // Two tracks rendered together as a multi-track system, two bars per system.
        //   Track 1, bar 1: sixteenth-note runs (60-tick minimum).
        //   Track 1, bar 2: only quarters.
        //   Track 2, bar 1: only quarters.
        //   Track 2, bar 2: sixteenth-note runs (60-tick minimum).
        //
        // Bar 1's `BarLayoutingInfo` is shared between Track 1's sixteenths and Track 2's
        // quarters - so its local minimum is 60 (set by Track 1). Bar 2's `BarLayoutingInfo` is
        // shared between Track 1's quarters and Track 2's sixteenths - so its local minimum is
        // also 60 (set by Track 2). Both bars therefore reference the same minimum and the
        // quarter-note columns in both bars (across both tracks) line up.
        //
        // This test pins the cross-track aggregation: the shared `BarLayoutingInfo` per
        // `MasterBarsRenderers` ensures every staff at the same bar index contributes to the
        // same `_minDuration`. A regression that gave each track its own layouting info would
        // produce mismatched per-bar minima and visible misalignment between the rows.
        //
        // Expected baseline: vertically aligned columns. The quarter notes in track 2 bar 1 sit
        // directly above the regular quarter-note positions established by track 1's sixteenth
        // grouping, and vice versa for bar 2.
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track "T1"
            \\ts 4 4
            :16 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4
            \\track "T2"
            \\ts 4 4
            :4 c4 c4 c4 c4 |
            :16 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4
            `,
            'test-data/visual-tests/system-spacing/system-min-duration-multi-track-aggregation.png',
            settings,
            o => {
                o.tracks = [0, 1];
            }
        );
    });
});
