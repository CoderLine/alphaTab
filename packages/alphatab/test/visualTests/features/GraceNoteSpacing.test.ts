import { describe, it } from 'vitest';
import { LayoutMode } from '@coderline/alphatab/LayoutMode';
import { Settings } from '@coderline/alphatab/Settings';
import { VisualTestHelper } from 'test/visualTests/VisualTestHelper';

/**
 * Phase 3 (A3) of the spacing spike: targeted visual coverage for the six grace note scenarios
 * called out in `docs/spacing/spacing-spike-plan.md` Section 2.2 (A3) and 6.3.
 *
 * AlphaTab follows Dorico's Model 3 for grace notes: graces are placed before their host note
 * column, their internal layout uses fixed pre-beat + post-spring widths per grace, and they do
 * not participate in the main spring system - their total width is folded into the host beat's
 * `graceBeatWidth` and consumed as a pre-beat rod extension on the host's spring.
 *
 * The power-law formula introduced by A1 does not touch grace springs at all (graces go through
 * `addBeatSpring`'s grace branch, never `addSpring`). These tests pin behaviour-level invariants
 * that should remain true regardless of the formula:
 *
 *   1. Single grace before a regular note
 *   2. Multiple consecutive graces in one group
 *   3. Grace at a bar boundary (graces belonging to the first beat of the next bar)
 *   4. Grace with no following host (incomplete group)
 *   5. Grace in a multi-voice context
 *   6. Grace across staves in a multi-track layout
 *
 * Existing coverage in `SpecialNotes.test.ts` (`grace-notes`, `grace-notes-advanced`,
 * `grace-notes-alignment`) is GP-fixture-driven and broad. The tests here are alphaTex-driven
 * and minimal so that one specific invariant per test is exposed.
 */
describe('GraceNoteSpacingTests', () => {
    it('grace-single-before-regular-note', async () => {
        // Simplest case: one before-beat grace eighth before the first quarter of bar 1, plain
        // quarters thereafter. The grace cluster sits left of the host quarter without disturbing
        // the spring positions of the rest of the bar.
        //
        // Expected baseline: a single small grace notehead with flag, anchored just before the
        // first regular quarter at bar start. The remaining three quarters are evenly spaced.
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track { defaultSystemsLayout 1 }
            \\ts 4 4
            :8 c5 {gr bb} :4 c4 c4 c4 c4
            `,
            'test-data/visual-tests/grace-spacing/grace-single-before-regular-note.png',
            settings
        );
    });

    it('grace-multiple-consecutive', async () => {
        // Three before-beat grace 32nds attached to bar 1's first quarter. The grace group's
        // internal spacing uses fixed widths per grace (current alphaTab behaviour); under the
        // power-law formula change the regular-note spring positions to the right of the host
        // are unaffected because graces do not contribute to `_minDuration` and have their own
        // pre-beat rod width separate from the spring system.
        //
        // Expected baseline: three small grace noteheads beamed together as a cluster, anchored
        // before the first regular quarter. Quarters 2/3/4 evenly spaced.
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track { defaultSystemsLayout 1 }
            \\ts 4 4
            :32 c5 {gr bb} d5 {gr bb} e5 {gr bb} :4 c4 c4 c4 c4
            `,
            'test-data/visual-tests/grace-spacing/grace-multiple-consecutive.png',
            settings
        );
    });

    it('grace-at-bar-boundary', async () => {
        // Bar 1 ends with a before-beat grace 32nd that belongs to bar 2's first quarter (the
        // graceGroup's host is in the next bar). The grace must render visually at the end of
        // bar 1 (before the barline) but the host pointer keeps the spring system in bar 2
        // anchored on bar 2's first quarter.
        //
        // Expected baseline: bar 1 has four quarters followed by a small grace cluster just
        // before the barline; bar 2 starts with the host quarter that the grace anchors to.
        // The barline sits between the grace and the host.
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track { defaultSystemsLayout 2 }
            \\ts 4 4
            :4 c4 c4 c4 c4 :32 c5 {gr bb} |
            :4 c4 c4 c4 c4
            `,
            'test-data/visual-tests/grace-spacing/grace-at-bar-boundary.png',
            settings
        );
    });

    it('grace-without-host-incomplete-group', async () => {
        // Bar 1 ends with a before-beat grace, and there is no following beat anywhere in the
        // score (no bar 2). This is the "incomplete grace group" path - common in imported
        // Guitar Pro files with invalid notation. The renderer must place the grace at a
        // reasonable position (within bar 1's available space) and not distort the system
        // width via `_incompleteGraceRodsWidth` under the new formula.
        //
        // Expected baseline: a single bar with four quarters followed by a small grace cluster
        // before the closing barline. No layout corruption, no negative widths, no missing
        // glyphs.
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track { defaultSystemsLayout 1 }
            \\ts 4 4
            :4 c4 c4 c4 c4 :32 c5 {gr bb}
            `,
            'test-data/visual-tests/grace-spacing/grace-without-host-incomplete-group.png',
            settings
        );
    });

    it('grace-multi-voice', async () => {
        // Two voices in a single bar. Voice 1 has a before-beat grace eighth before its first
        // quarter; voice 2 has plain quarters. The grace in voice 1 must not shift the time-axis
        // alignment of voice 2's quarters - they share the same spring system, and graces
        // contribute only to the pre-beat rod width of the host column they anchor to.
        //
        // Expected baseline: two stacked quarter-note voices with their notes aligned column-by-
        // column. A small grace notehead sits before voice 1's first quarter without pushing
        // voice 2's first quarter off the column.
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track { defaultSystemsLayout 1 }
            \\ts 4 4
            \\voice
            :8 c5 {gr bb} :4 c5 c5 c5 c5
            \\voice
            :4 c4 c4 c4 c4
            `,
            'test-data/visual-tests/grace-spacing/grace-multi-voice.png',
            settings
        );
    });

    it('grace-multi-track', async () => {
        // Two tracks with one bar each. Track 1 has plain quarters; Track 2 starts with a
        // before-beat grace eighth before its first quarter. The grace cluster in Track 2 must
        // not displace the column alignment between Track 1 and Track 2 - a host beat in either
        // track at the same time position must still render at the same x-coordinate.
        //
        // Expected baseline: two stacked staves; quarter notes align column-by-column across
        // tracks; Track 2's first quarter has a small grace notehead anchored to its left.
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track "T1"
            \\ts 4 4
            :4 c4 c4 c4 c4
            \\track "T2"
            \\ts 4 4
            :8 c5 {gr bb} :4 c4 c4 c4 c4
            `,
            'test-data/visual-tests/grace-spacing/grace-multi-track.png',
            settings,
            o => {
                o.tracks = [0, 1];
            }
        );
    });
});
