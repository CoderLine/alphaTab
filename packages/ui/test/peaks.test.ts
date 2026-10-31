import { describe, expect, it } from 'vitest';
import { buildPeaks, PEAK_BUCKET, peaksForWidth } from '../src/state/peaks';

describe('buildPeaks', () => {
    it('builds levels of normalized peaks down to a single entry', () => {
        const samples = new Float32Array(8 * PEAK_BUCKET);
        samples[300] = 0.25;
        samples[900] = -0.5;
        const levels = buildPeaks(samples, samples);

        expect(levels.map(l => l.length)).toEqual([8, 4, 2, 1]);
        expect(levels[0][7]).toBeCloseTo(1);
        expect(levels[0][2]).toBeCloseTo(0.5);
        expect(levels[0][0]).toBe(0);
        expect(levels[1][1]).toBeCloseTo(0.5);
        expect(levels[3][0]).toBeCloseTo(1);
    });

    it('takes the louder channel', () => {
        const left = new Float32Array(PEAK_BUCKET * 2);
        const right = new Float32Array(PEAK_BUCKET * 2);
        left[10] = 0.2;
        right[PEAK_BUCKET + 10] = -0.8;
        const [base] = buildPeaks(left, right);
        expect(base[0]).toBeCloseTo(0.25);
        expect(base[1]).toBeCloseTo(1);
    });

    it('keeps silence at zero', () => {
        const silence = new Float32Array(PEAK_BUCKET * 3);
        expect(Array.from(buildPeaks(silence, silence)[0])).toEqual([0, 0, 0]);
    });
});

describe('peaksForWidth', () => {
    it('picks the coarsest level with enough entries', () => {
        const levels = buildPeaks(new Float32Array(8 * PEAK_BUCKET), new Float32Array(8 * PEAK_BUCKET));
        expect(peaksForWidth(levels, 3).length).toBe(4);
        expect(peaksForWidth(levels, 4).length).toBe(4);
        expect(peaksForWidth(levels, 100).length).toBe(8);
    });
});
