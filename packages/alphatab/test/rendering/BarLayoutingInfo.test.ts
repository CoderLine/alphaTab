import { describe, expect, it } from 'vitest';
import { BarLayoutingInfo } from '@coderline/alphatab/rendering/staves/BarLayoutingInfo';

/**
 * Unit tests pinning the power-law spring formula introduced by the spacing spike.
 *
 * Section 6.3 of `docs/spacing/spacing-spike-plan.md` calls for math-only invariants on
 * `phi(d, dmin, r) = (d / dmin) ^ log2(r)` to catch accidental formula changes without
 * relying on visual diffs.
 *
 * `BarLayoutingInfo._calculateSpringConstant` is private; we exercise it through the public
 * `addSpring` + `finish` flow and read `spring.springConstant` from the public `springs` map.
 *
 * Spring constant for the chosen rod is computed as
 *
 *   k = (smallestDuration / duration) * (1 / (phi * minDurationWidth))
 *
 * For a single-spring bar where `smallestDuration == duration`, this collapses to
 *
 *   k = 1 / (phi * minDurationWidth)
 *
 * which is what we assert against - it is a direct read of `phi` modulo a fixed scale.
 *
 * Two-spring bars use the gap between the springs as the duration of the first spring (see
 * `_calculateSpringConstants`). We use that pattern to pin specific (d, dmin) pairs.
 */
describe('BarLayoutingInfoPowerLawFormula', () => {
    /** `_defaultMinDurationWidth` from BarLayoutingInfo - kept private; mirrored here. */
    const minDurationWidth = 6.5;

    /**
     * Builds a single-spring `BarLayoutingInfo` whose only spring covers exactly `duration` ticks
     * and forces the reference minimum-duration to `duration` via `recomputeSpringConstants`. With
     * `d == dmin == duration`, phi collapses to `(d/dmin)^exponent = 1` independent of the ratio,
     * so this helper is mainly used to confirm the `phi=1` baseline.
     *
     * Returns phi derived from the spring constant by inverting `k = 1 / (phi * minDurationWidth)`.
     */
    function phiAtMinDuration(duration: number, spacingRatio: number): number {
        const info = new BarLayoutingInfo(spacingRatio);
        info.addSpring(0, duration, 0, 0, 0);
        info.addSpring(duration, duration, 0, 0, 0);
        info.finish();
        // Force the system-wide reference to `duration` (mimics StaffSystem._trackSystemMinDuration).
        info.recomputeSpringConstants(duration);
        const spring = info.springs.get(0)!;
        return 1 / (spring.springConstant * minDurationWidth);
    }

    /**
     * Builds a `BarLayoutingInfo` such that the spring under test has duration `d` (gap to the
     * next spring) and the system-wide minimum-duration reference is `dmin`. The reference is
     * forced via `recomputeSpringConstants(dmin)` after `finish()`, mirroring the path
     * `StaffSystem` takes when a bar's local minimum disagrees with the system minimum.
     *
     * Returns phi for the spring under test, derived from its spring constant. Note that the
     * spring's `smallestDuration` equals its `duration` here (a single duration was added at that
     * spring's time position), so the `(smallestDuration / duration)` factor in
     * `_calculateSpringConstant` is 1 and the read of `phi` is uncontaminated.
     */
    function phiFromGap(d: number, dmin: number, spacingRatio: number): number {
        const info = new BarLayoutingInfo(spacingRatio);
        // Spring 0 at t=0, gap to next = d -> spring 0 gets duration `d`.
        info.addSpring(0, d, 0, 0, 0);
        info.addSpring(d, d, 0, 0, 0);
        info.finish();
        info.recomputeSpringConstants(dmin);
        const spring = info.springs.get(0)!;
        return 1 / (spring.springConstant * minDurationWidth);
    }

    describe('phi values match Section 3.3 reference table', () => {
        // Reference values from spike plan Section 3.3, r = 1.5 column:
        //   d/dmin = 1  -> phi = 1.00
        //   d/dmin = 2  -> phi = 1.50
        //   d/dmin = 4  -> phi = 2.25
        //   d/dmin = 8  -> phi = 3.38  (3.375 exact)
        //   d/dmin = 16 -> phi = 5.06  (5.0625 exact)
        const r = 1.5;

        it('phi(d/dmin=1) = 1.0', () => {
            expect(phiAtMinDuration(60, r)).toBeCloseTo(1.0, 6);
        });

        it('phi(d/dmin=2) = 1.5', () => {
            expect(phiFromGap(120, 60, r)).toBeCloseTo(1.5, 6);
        });

        it('phi(d/dmin=4) = 2.25', () => {
            expect(phiFromGap(240, 60, r)).toBeCloseTo(2.25, 6);
        });

        it('phi(d/dmin=8) = 3.375', () => {
            expect(phiFromGap(480, 60, r)).toBeCloseTo(3.375, 6);
        });

        it('phi(d/dmin=16) = 5.0625', () => {
            expect(phiFromGap(960, 60, r)).toBeCloseTo(5.0625, 6);
        });
    });

    describe('phi values for r = sqrt(2) (Dorico default)', () => {
        // From plan Section 3.3, r = 1.414 column:
        //   d/dmin = 2  -> phi = sqrt(2)  ≈ 1.41421
        //   d/dmin = 4  -> phi = 2.0
        //   d/dmin = 8  -> phi = 2*sqrt(2) ≈ 2.82843
        //   d/dmin = 16 -> phi = 4.0
        const r = Math.SQRT2;

        it('phi(d/dmin=2) = sqrt(2)', () => {
            expect(phiFromGap(120, 60, r)).toBeCloseTo(Math.SQRT2, 6);
        });

        it('phi(d/dmin=4) = 2.0', () => {
            expect(phiFromGap(240, 60, r)).toBeCloseTo(2.0, 6);
        });

        it('phi(d/dmin=16) = 4.0', () => {
            expect(phiFromGap(960, 60, r)).toBeCloseTo(4.0, 6);
        });
    });

    describe('phi values for r = phi (Finale Fibonacci)', () => {
        // From plan Section 3.3, r = 1.618 column:
        //   d/dmin = 2  -> phi = 1.618...
        //   d/dmin = 4  -> phi ≈ 2.618
        //   d/dmin = 8  -> phi ≈ 4.236
        const r = 1.618;

        it('phi(d/dmin=2) = 1.618', () => {
            expect(phiFromGap(120, 60, r)).toBeCloseTo(1.618, 3);
        });

        it('phi(d/dmin=4) = 2.618', () => {
            // 1.618^2 = 2.617924
            expect(phiFromGap(240, 60, r)).toBeCloseTo(1.618 * 1.618, 4);
        });
    });

    it('spring constants decrease monotonically as duration grows', () => {
        // For a fixed dmin, longer durations should produce smaller spring constants
        // (= softer springs that take more space under the same justification force).
        const r = 1.5;
        const k60 = 1 / (phiAtMinDuration(60, r) * minDurationWidth);
        const k120 = 1 / (phiFromGap(120, 60, r) * minDurationWidth);
        const k240 = 1 / (phiFromGap(240, 60, r) * minDurationWidth);
        const k480 = 1 / (phiFromGap(480, 60, r) * minDurationWidth);
        const k960 = 1 / (phiFromGap(960, 60, r) * minDurationWidth);

        expect(k60).toBeGreaterThan(k120);
        expect(k120).toBeGreaterThan(k240);
        expect(k240).toBeGreaterThan(k480);
        expect(k480).toBeGreaterThan(k960);
    });

    it('rest-bar spring constant is no longer collapsed against a dense neighbor (smoke check)', () => {
        // Re-creates the headline rest-bar-ballooning scenario in numbers: a sixteenth-note bar
        // and a whole-rest bar should produce spring constants in a ratio close to spacingRatio^4
        // (whole / sixteenth = 16x, log2(16) = 4 doublings). Under the OLD additive formula
        // `phi = 1 + 0.85 * log2(d/dmin)`, the whole-rest bar got phi = 1.0 (because d == dmin in
        // its own bar) and the sixteenth bar got phi = 1.0 too - making them equally stiff and
        // the rest bar absorb justification force disproportionately. With system-wide _minDuration
        // (A2) and the new power-law formula (A1), the whole rest now sits at phi = r^4 against a
        // 60-tick reference.
        const r = 1.5;
        const phi16 = phiAtMinDuration(60, r); // d/dmin = 1
        const phiWhole = phiFromGap(960, 60, r); // d/dmin = 16
        // Whole rest is `r^4 = 1.5^4 = 5.0625` times stiffer in *natural length*, which is the
        // correct, proportional behaviour. The previous formula gave 1.0 for both - the bug.
        expect(phiWhole / phi16).toBeCloseTo(Math.pow(r, 4), 4);
    });

    it('r = 1.0 produces equal phi for all durations (degenerate baseline)', () => {
        // Degenerate case: r=1 means `exponent = log2(1) = 0`, so phi = 1 for every duration.
        // The clamp pulls r=1.0 up to 1.2 (the documented minimum), so this test verifies the
        // *clamped* behavior - phi for r=1.0 should equal phi for r=1.2.
        const phiAt1 = phiFromGap(240, 60, 1.0);
        const phiAt12 = phiFromGap(240, 60, 1.2);
        expect(phiAt1).toBeCloseTo(phiAt12, 6);
    });

    it('sub-minimum duration produces phi < 1 (compression)', () => {
        // d/dmin < 1 means the spring is shorter than the system minimum reference. phi should
        // drop below 1 so that the spring is *stiffer* than the reference (less stretchy).
        // This case can arise during reconcile when an earlier bar's duration is shorter than
        // the reference passed in by the system.
        const info = new BarLayoutingInfo(1.5);
        info.addSpring(0, 60, 0, 0, 0);
        info.addSpring(60, 60, 0, 0, 0);
        // After finish(), recompute against a larger minDuration than this bar's local one.
        info.finish();
        info.recomputeSpringConstants(120); // pretend the system min is 120 (eighth)
        const spring = info.springs.get(0)!;
        // Spring duration = gap to next spring = 60. With minDuration = 120, d/dmin = 0.5.
        // phi = 0.5 ^ log2(1.5) = 0.5 ^ 0.5849... ≈ 0.6667
        const phi = 1 / (spring.springConstant * minDurationWidth);
        expect(phi).toBeLessThan(1.0);
        expect(phi).toBeCloseTo(Math.pow(0.5, Math.log2(1.5)), 6);
    });

    describe('spacingExponentFromRatio clamps to documented range', () => {
        it('returns log2(r) for r in range', () => {
            expect(BarLayoutingInfo.spacingExponentFromRatio(1.5)).toBeCloseTo(Math.log2(1.5), 10);
            expect(BarLayoutingInfo.spacingExponentFromRatio(Math.SQRT2)).toBeCloseTo(0.5, 10);
            expect(BarLayoutingInfo.spacingExponentFromRatio(2.0)).toBeCloseTo(1.0, 10);
        });

        it('clamps r < 1.2 up to 1.2', () => {
            expect(BarLayoutingInfo.spacingExponentFromRatio(1.0)).toBeCloseTo(Math.log2(1.2), 10);
            expect(BarLayoutingInfo.spacingExponentFromRatio(0.5)).toBeCloseTo(Math.log2(1.2), 10);
        });

        it('clamps r > 2.0 down to 2.0', () => {
            expect(BarLayoutingInfo.spacingExponentFromRatio(2.5)).toBeCloseTo(1.0, 10);
            expect(BarLayoutingInfo.spacingExponentFromRatio(10)).toBeCloseTo(1.0, 10);
        });
    });
});
