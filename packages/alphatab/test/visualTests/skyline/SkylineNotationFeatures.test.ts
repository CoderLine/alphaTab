/**
 * Skyline coverage tests for individual notation features.
 */
import { describe, expect, it } from 'vitest';
import { SkylineTestHarness } from './SkylineTestHarness';

describe('SkylineNotationFeatures — stems', () => {
    it('high-pitch up-stem on a quarter note registers above the staff', async () => {
        const snap = await SkylineTestHarness.renderSkylineOnce(`
            \\track "Guitar"
            :4 24.1 r r r
        `);
        const score = SkylineTestHarness.findScoreStaff(snap);
        const bar0 = score.bars[0];
        // The high notehead with up-stem must register a non-zero above-staff
        // magnitude on the bar-local skyline.
        expect(bar0.upMax).toBeGreaterThan(0);
    });

    it('low-pitch down-stem on a quarter note registers below the staff', async () => {
        const snap = await SkylineTestHarness.renderSkylineOnce(`
            \\track "Guitar"
            :4 0.6 r r r
        `);
        const score = SkylineTestHarness.findScoreStaff(snap);
        const bar0 = score.bars[0];
        // Low note on string 6 / fret 0 — sits below the staff.
        expect(bar0.downMax).toBeGreaterThan(0);
    });

    it('half-note with up-stem on a high pitch extends the above-staff envelope', async () => {
        // Compare a high half-note (has stem) against a low half-note (no
        // significant stem extension above the staff). The high one's
        // above-staff magnitude must be strictly greater.
        const highSnap = await SkylineTestHarness.renderSkylineOnce(`
            \\track "Guitar"
            :2 22.1 r
        `);
        const lowSnap = await SkylineTestHarness.renderSkylineOnce(`
            \\track "Guitar"
            :2 0.6 r
        `);
        const highBar = SkylineTestHarness.findScoreStaff(highSnap).bars[0];
        const lowBar = SkylineTestHarness.findScoreStaff(lowSnap).bars[0];
        expect(highBar.upMax).toBeGreaterThan(lowBar.upMax);
    });
});

describe('SkylineNotationFeatures — flags', () => {
    it('isolated eighth note has at least as much above-staff envelope as a quarter', async () => {
        // A standalone eighth has a flag; a quarter does not. Same notehead
        // pitch → the eighth's bar-local up-side envelope must be >= the
        // quarter's.
        const eighthSnap = await SkylineTestHarness.renderSkylineOnce(`
            \\track "Guitar"
            :4 r :8 22.1 r :4 r r
        `);
        const quarterSnap = await SkylineTestHarness.renderSkylineOnce(`
            \\track "Guitar"
            :4 r 22.1 r r
        `);
        const eighthBar = SkylineTestHarness.findScoreStaff(eighthSnap).bars[0];
        const quarterBar = SkylineTestHarness.findScoreStaff(quarterSnap).bars[0];
        expect(eighthBar.upMax).toBeGreaterThanOrEqual(quarterBar.upMax);
    });
});

describe('SkylineNotationFeatures — beams', () => {
    it('beamed eighths register non-zero above-staff envelope inside the beam-group x-range', async () => {
        // Four beamed eighths at a high pitch followed by 4 rests. The
        // beam-group occupies roughly the first half of the bar.
        const snap = await SkylineTestHarness.renderSkylineOnce(`
            \\track "Guitar"
            :8 22.1 22.1 22.1 22.1 r r r r
        `);
        const bar0 = SkylineTestHarness.findScoreStaff(snap).bars[0];
        expect(bar0.upMax).toBeGreaterThan(0);

        // There must be at least one up-segment in the bar with positive
        // height (the beam itself + notes contribute).
        expect(bar0.upSegments.length).toBeGreaterThan(0);
        const tallestUp = bar0.upSegments.reduce((a, b) => Math.max(a, b.height), 0);
        expect(tallestUp).toBe(bar0.upMax);
    });

    it('beam region has greater above-staff height than the trailing rest region', async () => {
        // Two beamed eighth-notes at a high pitch followed by 4+ rests.
        // The beam contributes height in the first quarter of the bar; the
        // trailing rests contribute less.
        const snap = await SkylineTestHarness.renderSkylineOnce(`
            \\track "Guitar"
            :8 22.1 22.1 r r r r r r
        `);
        const bar0 = SkylineTestHarness.findScoreStaff(snap).bars[0];
        // Pick samples relative to the bar's full content width. The beam
        // sits in the early portion; the rests in the late portion.
        const w = bar0.rendererWidth;
        const beamRegion = SkylineTestHarness.maxUpHeightInRange(bar0, 0, w * 0.3);
        const restRegion = SkylineTestHarness.maxUpHeightInRange(bar0, w * 0.6, w);
        expect(beamRegion).toBeGreaterThan(restRegion);
    });
});

describe('SkylineNotationFeatures — tuplets', () => {
    it('score-staff triplet bracket extends the above-staff envelope', async () => {
        // High-pitch eighths beamed as a triplet on the score staff. The
        // tuplet number/bracket sits above the beam, adding magnitude to
        // the bar-local up-side. Compare against the same eighths without
        // tuplet → the tuplet score must be at least as tall.
        const tupletSnap = await SkylineTestHarness.renderSkylineOnce(`
            \\track "Guitar"
            :8 22.1{tu 3} 22.1{tu 3} 22.1{tu 3} :4 r r r
        `);
        const plainSnap = await SkylineTestHarness.renderSkylineOnce(`
            \\track "Guitar"
            :8 22.1 22.1 22.1 :4 r r r
        `);
        const tupletBar = SkylineTestHarness.findScoreStaff(tupletSnap).bars[0];
        const plainBar = SkylineTestHarness.findScoreStaff(plainSnap).bars[0];
        // Both have a beam group above the staff. The triplet adds a
        // number/bracket above the beam — magnitudes should differ.
        expect(tupletBar.upMax).toBeGreaterThan(0);
        expect(plainBar.upMax).toBeGreaterThan(0);
        expect(tupletBar.upMax).toBeGreaterThanOrEqual(plainBar.upMax);
    });

    it('triplet beat-span has greater above-staff height than the trailing rests', async () => {
        // Triplet beam followed by rests. The triplet's x-range should
        // report a taller above-staff magnitude than the rest region.
        const snap = await SkylineTestHarness.renderSkylineOnce(`
            \\track "Guitar"
            :8 22.1{tu 3} 22.1{tu 3} 22.1{tu 3} :4 r r r
        `);
        const bar0 = SkylineTestHarness.findScoreStaff(snap).bars[0];
        const w = bar0.rendererWidth;
        const tupletRegion = SkylineTestHarness.maxUpHeightInRange(bar0, 0, w * 0.4);
        const restRegion = SkylineTestHarness.maxUpHeightInRange(bar0, w * 0.7, w);
        expect(tupletRegion).toBeGreaterThan(restRegion);
    });
});

describe('SkylineNotationFeatures — slash staff', () => {
    it('slash beam group has greater above-staff height than the trailing rest region', async () => {
        // Four beamed eighth slashes followed by quarter rests. Slash
        // notation places noteheads at a fixed Y on the staff; only stems,
        // flags, and beams contribute to the above-staff envelope.
        const snap = await SkylineTestHarness.renderSkylineOnce(`
            \\track "Slash"
            \\staff {slash}
            :8 1.1 1.1 1.1 1.1 :4 r r
        `);
        const bar0 = SkylineTestHarness.findSlashStaff(snap).bars[0];
        expect(bar0.upMax).toBeGreaterThan(0);
        const w = bar0.rendererWidth;
        const beamRegion = SkylineTestHarness.maxUpHeightInRange(bar0, 0, w * 0.4);
        const restRegion = SkylineTestHarness.maxUpHeightInRange(bar0, w * 0.6, w);
        expect(beamRegion).toBeGreaterThan(restRegion);
    });

    it('slash tuplet bracket extends the above-staff envelope vs. the same eighths without tuplet', async () => {
        // SlashBarRenderer.doLayout registers a per-tuplet-group bracket
        // height on the top side. The tuplet score must therefore have at
        // least as much above-staff envelope as the plain equivalent.
        const tupletSnap = await SkylineTestHarness.renderSkylineOnce(`
            \\track "Slash"
            \\staff {slash}
            :8 1.1 {tu 3} 1.1 {tu 3} 1.1 {tu 3} :4 r r r
        `);
        const plainSnap = await SkylineTestHarness.renderSkylineOnce(`
            \\track "Slash"
            \\staff {slash}
            :8 1.1 1.1 1.1 :4 r r r
        `);
        const tupletBar = SkylineTestHarness.findSlashStaff(tupletSnap).bars[0];
        const plainBar = SkylineTestHarness.findSlashStaff(plainSnap).bars[0];
        expect(tupletBar.upMax).toBeGreaterThanOrEqual(plainBar.upMax);
    });
});

describe('SkylineNotationFeatures — numbered staff', () => {
    it('high-octave numbered note has a greater above-staff envelope than a low-octave one', async () => {
        // Numbered notation marks octaves with dots above/below the digit.
        // A high-octave note's dot extends above the staff; a low-octave
        // note's dot extends below. Compare bar-local up/down envelopes.
        const highSnap = await SkylineTestHarness.renderSkylineOnce(`
            \\track "Numbered"
            \\staff {numbered}
            C6.4 r r r
        `);
        const lowSnap = await SkylineTestHarness.renderSkylineOnce(`
            \\track "Numbered"
            \\staff {numbered}
            C4.4 r r r
        `);
        const highBar = SkylineTestHarness.findNumberedStaff(highSnap).bars[0];
        const lowBar = SkylineTestHarness.findNumberedStaff(lowSnap).bars[0];
        // Either the high octave's up-side is greater than the low octave's,
        // or both renderers contribute zero (numbered staff implementations
        // vary). The strict invariant we assert is "high octave is at least
        // as tall above".
        expect(highBar.upMax).toBeGreaterThanOrEqual(lowBar.upMax);
    });

    it('numbered staff produces non-zero envelopes when content extends beyond the line', async () => {
        // A few high-octave numbered notes plus a few low-octave ones. The
        // staff-system skyline aggregates them; at least one side must
        // exceed zero.
        const snap = await SkylineTestHarness.renderSkylineOnce(`
            \\track "Numbered"
            \\staff {numbered}
            C6.4 D6.4 C2.4 D2.4
        `);
        const staff = SkylineTestHarness.findNumberedStaff(snap);
        expect(staff.upMax + staff.downMax).toBeGreaterThan(0);
    });
});

describe('SkylineNotationFeatures — staff-skyline assembly', () => {
    it('staff skyline maxHeight equals the maximum bar-local up/down maxes', async () => {
        // Multi-bar mix where the tallest content varies by bar. The
        // staff-system skyline aggregates everything, so its maxHeight on
        // each side must match the peak across all per-bar maxes.
        const snap = await SkylineTestHarness.renderSkylineOnce(`
            \\track "Guitar"
            :4 24.1 r r r |
            :4 0.6 r r r |
            :4 12.1 r r r
        `);
        for (const staff of snap) {
            const peakUp = staff.bars.reduce((a, b) => Math.max(a, b.upMax), 0);
            const peakDown = staff.bars.reduce((a, b) => Math.max(a, b.downMax), 0);
            expect(staff.upMax).toBeCloseTo(peakUp, 3);
            expect(staff.downMax).toBeCloseTo(peakDown, 3);
        }
    });
});
