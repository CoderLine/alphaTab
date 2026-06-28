import { LayoutMode } from '@coderline/alphatab/LayoutMode';
import { Settings } from '@coderline/alphatab/Settings';
import { StaveProfile } from '@coderline/alphatab/StaveProfile';
import { VisualTestHelper } from 'test/visualTests/VisualTestHelper';
import { describe, it } from 'vitest';

/**
 * Behaviour-focused coverage for the **overlay rod system** introduced as Topic 8 of the
 * spacing spike (see `docs/spacing/spacing-followup-topics.md`, section 8).
 *
 * Overlay rods are a first-class minimum-distance constraint registered against beats
 * that carry overlay content (lyrics, beat text). They live on `BarLayoutingInfo`
 * parallel to the rhythmic spring-rod model and contribute additional `minStretchForce`
 * constraints inside the existing `_calculateSpringConstants` flow. Beats without
 * overlays never register a rod, so:
 *
 *   - **non-overlapping content does not bloat spacing** — short syllables that fit
 *     between adjacent beats produce the same width as a no-lyrics control bar.
 *   - **sparse lyrics work naturally** — the overlay-rod loop walks only registered
 *     rods, regardless of how many silent (non-overlay) beats sit between two overlay-
 *     bearing beats. Multiple springs in between contribute through the `sum(1/k)`
 *     term of the multi-spring force constraint.
 *
 * Each test below pins one specific invariant of this system. Together they form the
 * regression guard for the overlay-rod calculation in
 * `BarLayoutingInfo._calculateSpringConstants` and the registration code in
 * `BarRendererBase._registerOverlayRods` / `_collectOverlayRods`.
 */
describe('OverlayRodSpacingTests', () => {
    /**
     * Long syllables on every quarter would overlap at default spacing. The overlay-rod
     * constraint forces the bar to widen so no syllable touches its neighbour. Baseline:
     * the bar is visibly wider than a no-lyrics control bar (test 3) and the four
     * syllables remain legible without overlap.
     */
    it('overlay-rod-lyrics-tight-bar', async () => {
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track { defaultSystemsLayout 1 }
            \\lyrics "happiness birthday celebration congratulations"
            \\ts 4 4
            :4 c4 c4 c4 c4
            `,
            'test-data/visual-tests/overlay-rod-spacing/overlay-rod-lyrics-tight-bar.png',
            settings
        );
    });

    /**
     * Lyrics only on beats 1 and 3 of a 4-beat bar; beats 2 and 4 are silent. The
     * overlay-rod loop must walk by registered overlay-bearing beats (1 -> 3), spanning
     * two springs (1->2 and 2->3) via the `sum(1/k)` multi-spring force constraint.
     * Beats 2 and 4 stay close to their natural spring positions because no rod
     * inflation reaches them. Baseline: gap between beats 1 and 3 visibly widened to
     * clear the long syllables, beats 2 / 4 are not bloated.
     */
    it('overlay-rod-sparse-lyrics', async () => {
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track { defaultSystemsLayout 1 }
            \\lyrics "happiness  congratulations  "
            \\ts 4 4
            :4 c4 c4 c4 c4
            `,
            'test-data/visual-tests/overlay-rod-spacing/overlay-rod-sparse-lyrics.png',
            settings
        );
    });

    /**
     * Short syllables that fit between adjacent beats at default spacing. No overlap
     * means no overlay-rod force contribution, so the bar's width is identical to the
     * no-lyrics control bar. This pins the "no bloat for non-overlapping content"
     * principle — the overlay-rod system must NEVER inflate spacing just because lyrics
     * exist.
     */
    it('overlay-rod-non-overlapping-lyrics-no-widening', async () => {
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track { defaultSystemsLayout 1 }
            \\lyrics "a b c d"
            \\ts 4 4
            :4 c4 c4 c4 c4
            `,
            'test-data/visual-tests/overlay-rod-spacing/overlay-rod-non-overlapping-lyrics-no-widening.png',
            settings
        );
    });

    /**
     * Right-edge overflow via the phantom-next-beat reframe. A long left-aligned
     * beat-text on the LAST beat of a bar has rightExtent = full text width, so the
     * overlay extends past the natural rhythmic post-content of the last beat. The
     * last spring's `requiredSpace` becomes max(postSpringWidth, rightExtent + padding),
     * force grows accordingly, and the bar widens such that the text ends inside the
     * voice container before the barline. Pins right-edge overflow handling
     * exclusively — does NOT exercise pair-overlap (only one rod registered).
     */
    it('overlay-rod-beat-text-end-overflow', async () => {
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track { defaultSystemsLayout 1 }
            \\ts 4 4
            :4 c4 c4 c4 c4 {txt "ALongBeatTextAnnotation"}
            `,
            'test-data/visual-tests/overlay-rod-spacing/overlay-rod-beat-text-end-overflow.png',
            settings
        );
    });

    /**
     * Multi-staff control: the same long lyric on a guitar tab + score combination must
     * widen both staves identically because they share the master bar's
     * BarLayoutingInfo and `addOverlayRod` max-merges duplicate registrations from each
     * staff. Baseline: the tab and score staves align column-by-column even though the
     * tab numbers are narrower than the score noteheads.
     */
    it('overlay-rod-multi-staff-aggregation', async () => {
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        settings.display.staveProfile = StaveProfile.ScoreTab;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track { defaultSystemsLayout 1 }
            \\lyrics "happiness birthday celebration congratulations"
            \\ts 4 4
            :4 3.3.4 3.3.4 3.3.4 3.3.4
            `,
            'test-data/visual-tests/overlay-rod-spacing/overlay-rod-multi-staff-aggregation.png',
            settings
        );
    });

    /**
     * Single overlay rod that fits naturally inside the bar — should NOT trigger any
     * widening. This pins the no-bloat invariant for the isolated-rod case (no pair
     * neighbour to overlap with, and the rod's extent is much smaller than the bar's
     * natural rhythmic content). Baseline: the bar's width must match a no-overlay
     * control rendering of the same rhythm.
     */
    it('overlay-rod-single-rod-no-stretch', async () => {
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track { defaultSystemsLayout 1 }
            \\lyrics "  hi  "
            \\ts 4 4
            :4 c4 c4 c4 c4
            `,
            'test-data/visual-tests/overlay-rod-spacing/overlay-rod-single-rod-no-stretch.png',
            settings
        );
    });

    /**
     * SINGLE ROD INTERNAL: a long left-aligned beat text on the FIRST beat of a 4-beat
     * bar. Only one overlay rod exists in the bar, anchored on a non-last beat. No
     * pair-overlap can fire (no neighbour rod). The last-rod handler does not fire
     * (the rod is not on the last spring). Result: no force adjustment, the text
     * overhangs freely over subsequent beats inside the bar. This pins the MVP
     * behavior for the "single rod, internal, overhangs" scenario as a known gap.
     *
     * TODO(overlay-rods, internal-overhang): a future refinement could detect when a
     * single rod's rightExtent crosses subsequent beats and widen the rod's host
     * spring accordingly — symmetric to the last-rod phantom mechanism but against
     * the rod's actual next spring rather than the bar edge.
     */
    it('overlay-rod-single-rod-internal-overhang', async () => {
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track { defaultSystemsLayout 1 }
            \\ts 4 4
            :4 c4 {txt "ALongBeatTextAnnotation"} c4 c4 c4
            `,
            'test-data/visual-tests/overlay-rod-spacing/overlay-rod-single-rod-internal-overhang.png',
            settings
        );
    });

    /**
     * Multi-bar score with lyrics on the LAST beat of bar 1 and FIRST beat of bar 2.
     * The two rods sit in different `BarLayoutingInfo` instances, so the in-bar
     * pair-overlap cannot see them as a pair. Bar 1's last-rod overflow handling
     * widens its trailing space (rightExtent past `postSpringWidth + postBeatSize`);
     * bar 2's leading lyric is currently NOT handled (left-edge gap is documented as
     * an MVP gap). Baseline pins how cross-bar lyrics render at MVP — typically clear
     * on bar 1's side, may touch the barline on bar 2's side. Doc-block IS the spec.
     */
    it('overlay-rod-cross-bar-end-and-start', async () => {
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track { defaultSystemsLayout 2 }
            \\lyrics "a b c celebration congratulations b c d"
            \\ts 4 4
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4
            `,
            'test-data/visual-tests/overlay-rod-spacing/overlay-rod-cross-bar-end-and-start.png',
            settings
        );
    });

    /**
     * RESIZE / RECOMPUTE: pair-overlap constraint must be re-applied when the system
     * is resized. After the initial layout produces a `minStretchForce` that includes
     * the overlay constraint, a width change triggers `reconcileMinDurationIfDirty`
     * which calls `recomputeSpringConstants` -> `_calculateSpringConstants`. The
     * overlay-rod loop is INSIDE `_calculateSpringConstants`, so the constraint is
     * re-applied automatically. Guards regression where the constraint might be
     * cached / orphaned and only applied at first layout. Renders a 2-bar score with
     * overlapping lyrics at a narrower width than the natural fit.
     */
    it('overlay-rod-reconciles-on-resize', async () => {
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track { defaultSystemsLayout 2 }
            \\lyrics "happiness birthday celebration congratulations happiness birthday celebration congratulations"
            \\ts 4 4
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4
            `,
            '',
            settings,
            o => {
                o.runs[0].width = 900;
                o.runs[0].referenceFileName =
                    'test-data/visual-tests/overlay-rod-spacing/overlay-rod-reconciles-on-resize.png';
            }
        );
    });

    /**
     * END-OF-SYSTEM: the LAST bar of a system carrying overlay rods on multiple beats.
     * Right-edge overflow on the last beat of the last bar of a system is the
     * end-of-system case. The phantom-next-beat handler still fires because each bar
     * sees the same right-edge logic regardless of whether it is the last bar in the
     * system. Pin the rendering so future system-level cross-bar accumulator work has
     * a fixed reference for the MVP behavior. Uses Page mode so the system is fully
     * justified, exercising the interaction between overlay constraints and system
     * justification.
     */
    it('overlay-rod-end-of-system', async () => {
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track { defaultSystemsLayout 3 }
            \\lyrics "happiness birthday celebration happiness birthday celebration happiness birthday celebration"
            \\ts 4 4
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4 |
            :4 c4 c4 c4 c4
            `,
            'test-data/visual-tests/overlay-rod-spacing/overlay-rod-end-of-system.png',
            settings
        );
    });

    /**
     * Beat text AND lyric on the SAME beat (beat 2). Rods in different bands are
     * kept in SEPARATE buckets — lyrics live in the `EffectLyrics` bucket and beat
     * text lives in the `EffectText` bucket. They do NOT merge into one rod, and
     * pair-overlap runs independently per band.
     *
     * Lyric bucket: rods on beats 1 (`x`), 2 (`widewidewideword`), 3 (`x`), 4 (`x`).
     * The wide lyric on beat 2 pair-overlaps with the narrow lyrics on beats 1 and
     * 3, which drives the visible widening of the bar.
     *
     * Text bucket: a single rod on beat 2 (`shortTxt`). No pair partner exists in
     * this bucket, so the text contributes NO pair-overlap force. The previous
     * single-stream design erroneously max-merged the text width into the lyric's
     * rod on beat 2; with bucketing that no longer happens.
     */
    it('overlay-rod-text-plus-lyric-same-beat', async () => {
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track { defaultSystemsLayout 1 }
            \\lyrics "x widewidewideword x x"
            \\ts 4 4
            :4 c4 c4 {txt "shortTxt"} c4 c4
            `,
            'test-data/visual-tests/overlay-rod-spacing/overlay-rod-text-plus-lyric-same-beat.png',
            settings
        );
    });

    /**
     * MULTI-BAND BUCKETING REGRESSION GUARD — control case.
     *
     * Wide lyric on beat 1, short lyric on beat 2. Only the lyric band contributes
     * overlay rods, so the bar widens via the lyric-bucket pair-overlap between
     * beats 1 and 2. This file is paired with `overlay-rod-multi-band-no-spurious-
     * overlap` below: the two renderings MUST produce identical bar widths and
     * beat positions. If they drift, the bucketing has broken and cross-band rods
     * are once again firing spurious force.
     */
    it('overlay-rod-multi-band-no-spurious-overlap-control', async () => {
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track { defaultSystemsLayout 1 }
            \\lyrics "widewidewideword x"
            \\ts 4 4
            :4 c4 c4 c4 c4
            `,
            'test-data/visual-tests/overlay-rod-spacing/overlay-rod-multi-band-no-spurious-overlap-control.png',
            settings
        );
    });

    /**
     * MULTI-BAND BUCKETING REGRESSION GUARD — multi-band case.
     *
     * Same as the control above (wide lyric on beat 1, short lyric on beat 2),
     * PLUS a wide beat-text annotation on beat 1 (`ALongBeatTextAnnotation`). The
     * wide text alone would, under the OLD single-stream design, have max-merged
     * with the lyric's rod on beat 1 and inflated the pair-overlap between beats
     * 1 and 2 — widening the bar spuriously. With per-band bucketing, the text
     * rod lives in the `EffectText` bucket where it has no pair-overlap partner,
     * so it contributes NO force. The lyric bucket still drives the same widening
     * as the control case.
     *
     * Expected: bar width and beat positions match the control rendering exactly
     * (modulo subpixel differences from the text glyph rendering above the staff).
     */
    it('overlay-rod-multi-band-no-spurious-overlap', async () => {
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track { defaultSystemsLayout 1 }
            \\lyrics "widewidewideword x"
            \\ts 4 4
            :4 c4 {txt "ALongBeatTextAnnotation"} c4 c4 c4
            `,
            'test-data/visual-tests/overlay-rod-spacing/overlay-rod-multi-band-no-spurious-overlap.png',
            settings
        );
    });

});
