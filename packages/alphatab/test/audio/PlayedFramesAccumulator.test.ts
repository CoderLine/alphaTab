import { PlayedFramesAccumulator } from '@coderline/alphatab/synth/ds/PlayedFramesAccumulator';
import { describe, expect, it } from 'vitest';

describe('PlayedFramesAccumulatorTests', () => {
    const nothing = PlayedFramesAccumulator.NothingToReport;

    it('interval-zero-reports-every-quantum', () => {
        const a = new PlayedFramesAccumulator(0);
        expect(a.add(128, 128)).toBe(128);
        expect(a.add(128, 0)).toBe(0);
        expect(a.add(128, 64)).toBe(64);
        expect(a.flush()).toBe(0);
    });

    it('reports-once-interval-elapsed', () => {
        const a = new PlayedFramesAccumulator(1024);
        let reported = 0;
        let reports = 0;
        for (let i = 0; i < 16; i++) {
            const r = a.add(128, 128);
            if (r !== nothing) {
                reported += r;
                reports++;
            }
        }
        expect(reports).toBe(2);
        expect(reported).toBe(2048);
        expect(a.flush()).toBe(0);
    });

    it('reports-partial-quantum-immediately', () => {
        const a = new PlayedFramesAccumulator(1024);
        expect(a.add(128, 128)).toBe(nothing);
        expect(a.add(128, 128)).toBe(nothing);
        expect(a.add(128, 40)).toBe(296);
        expect(a.add(128, 0)).toBe(nothing);
        expect(a.add(128, 128)).toBe(nothing);
    });

    it('flush-returns-pending-frames', () => {
        const a = new PlayedFramesAccumulator(1024);
        expect(a.add(128, 128)).toBe(nothing);
        expect(a.add(128, 128)).toBe(nothing);
        expect(a.flush()).toBe(256);
        expect(a.flush()).toBe(0);
        for (let i = 0; i < 7; i++) {
            expect(a.add(128, 128)).toBe(nothing);
        }
        expect(a.add(128, 128)).toBe(1024);
    });
});
