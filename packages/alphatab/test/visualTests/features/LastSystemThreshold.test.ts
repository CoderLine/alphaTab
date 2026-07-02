import { describe, it } from 'vitest';
import { LayoutMode } from '@coderline/alphatab/LayoutMode';
import { Settings } from '@coderline/alphatab/Settings';
import { VisualTestHelper } from 'test/visualTests/VisualTestHelper';

/**
 * Phase 4 (B1) of the spacing spike: visual coverage for the last-system fill threshold.
 *
 * Industry convention (Dorico, MuseScore): when the final system of a flow is sparsely
 * populated relative to the available staff width, it looks better rendered at its natural
 * width than stretched to fill the row. The {@link DisplaySettings.lastSystemFillThreshold}
 * setting decides where that boundary sits.
 *
 * Semantics:
 * - `lastSystemFillThreshold = 1` (default) — never justify the last system.
 * - `lastSystemFillThreshold = 0` — always justify, even when sparse.
 * - `lastSystemFillThreshold = 0.4`–`0.7` — Dorico/MuseScore-style: justify only when the
 *   last system is reasonably full.
 *
 * The legacy {@link DisplaySettings.justifyLastSystem} property is now a deprecated
 * computed accessor on top of the threshold (`true` ⇔ threshold `< 1`).
 */
describe('LastSystemThresholdTests', () => {
    it('last-system-below-threshold-not-stretched', async () => {
        // 12 bars laid out in a page layout where the line break splits 11 + 1. The lone
        // final bar's natural width is only ~7-10% of the available staff width. With an
        // intermediate threshold of 0.5, the lone bar's fullness is below the threshold so
        // justification is suppressed and the final bar renders at its natural compact width.
        //
        // Expected baseline: row 1 has 11 bars filling the system; row 2 has a single short
        // bar at the left (not stretched to the right edge).
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;
        settings.display.lastSystemFillThreshold = 0.5;
        settings.display.barsPerRow = 11;
        await VisualTestHelper.runVisualTestTex(
            `
            \\ts 4 4
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4
            `,
            'test-data/visual-tests/last-system-threshold/last-system-below-threshold-not-stretched.png',
            settings
        );
    });

    it('last-system-above-threshold-stretched', async () => {
        // 19 bars in Parchment mode with explicit systemsLayout 11+8 directing the wrap. Row 1
        // holds 11 bars (densely filling); row 2 holds 8 bars whose natural width is ~73% of
        // row 1. With `lastSystemFillThreshold = 0.5`, row 2 is above the threshold so it IS
        // justified to fill the available staff width.
        //
        // Expected baseline: two rows, both filling the full staff width. The 8 bars in row 2
        // are visibly wider per bar than the 11 bars in row 1 because the same staff width is
        // distributed across fewer bars. The right edge of both rows aligns with the page
        // padding - confirming the last system was justified, not left at its narrower
        // natural width.
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        settings.display.lastSystemFillThreshold = 0.5;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track { systemsLayout 11 8 }
            \\ts 4 4
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4
            `,
            'test-data/visual-tests/last-system-threshold/last-system-above-threshold-stretched.png',
            settings
        );
    });

    it('last-system-threshold-disabled-stretches', async () => {
        // Same score as `last-system-below-threshold-not-stretched` but with the threshold
        // explicitly set to `0` (always justify). The lone final bar stretches to fill the
        // full row regardless of fullness. Equivalent to the legacy
        // `justifyLastSystem = true` behaviour. Confirms the always-justify path.
        //
        // Expected baseline: row 1 has 11 bars; row 2 has the single bar stretched across
        // the full available width.
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;
        settings.display.lastSystemFillThreshold = 0;
        settings.display.barsPerRow = 11;
        await VisualTestHelper.runVisualTestTex(
            `
            \\ts 4 4
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4
            `,
            'test-data/visual-tests/last-system-threshold/last-system-threshold-disabled-stretches.png',
            settings
        );
    });

    it('last-system-default-never-stretches', async () => {
        // Same score as `last-system-threshold-disabled-stretches` but at the default
        // `lastSystemFillThreshold = 1` (never justify). The lone final bar stays compact
        // regardless of fullness, matching the legacy `justifyLastSystem = false` default.
        //
        // Expected baseline: row 1 has 11 bars; row 2 has the single bar at its natural
        // compact width at the left of the row.
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;
        // lastSystemFillThreshold left at default 1
        settings.display.barsPerRow = 11;
        await VisualTestHelper.runVisualTestTex(
            `
            \\ts 4 4
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4
            `,
            'test-data/visual-tests/last-system-threshold/last-system-default-never-stretches.png',
            settings
        );
    });
});
