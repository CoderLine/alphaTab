import { Skyline } from '@coderline/alphatab/rendering/skyline/Skyline';
import { SkylineSegmentPool } from '@coderline/alphatab/rendering/skyline/SkylineSegmentPool';
import { describe, expect, it } from 'vitest';

/**
 * @record
 * @internal
 */
interface SkylineSegmentExpect {
    s: number;
    e: number;
    h: number;
}

/**
 * @internal
 */
class SkylineFixtures {
    public static newSkyline(xMin: number, xMax: number): Skyline {
        const pool: SkylineSegmentPool = new SkylineSegmentPool();
        return new Skyline(xMin, xMax, pool);
    }
}

describe('Skyline — construction', () => {
    it('starts with two segments: baseline at xMin + sentinel at xMax', () => {
        const sky: Skyline = SkylineFixtures.newSkyline(0, 100);
        expect(sky.xMin).toBe(0);
        expect(sky.xMax).toBe(100);
        expect(sky.segmentCount).toBe(1);
        expect(sky.maxHeight()).toBe(0);
    });

    it('empty placeAbove on a fresh skyline returns pad (zero clearance for pad=0)', () => {
        const sky: Skyline = SkylineFixtures.newSkyline(0, 100);
        expect(sky.placeAbove(10, 20, 1, 0)).toBe(0);
        expect(sky.placeAbove(10, 20, 1, 0.5)).toBe(0.5);
    });
});

describe('Skyline — insert + placeAbove', () => {
    it('a single insert raises the skyline in its range', () => {
        const sky: Skyline = SkylineFixtures.newSkyline(0, 100);
        sky.insert(10, 30, 5, 0);
        expect(sky.placeAbove(15, 25, 1, 0)).toBe(5);
        expect(sky.placeAbove(40, 60, 1, 0)).toBe(0);
    });

    it('placeAbove adds pad clearance on top of max-in-range', () => {
        const sky: Skyline = SkylineFixtures.newSkyline(0, 100);
        sky.insert(10, 30, 5, 0);
        expect(sky.placeAbove(15, 25, 1, 0.5)).toBe(5.5);
    });

    it('placeAbove pad does NOT widen the x-axis query range', () => {
        // The `pad` parameter governs vertical clearance only — the
        // horizontal collision range is the band's actual x extent.
        // A neighbouring inserted rect outside that range stays
        // invisible regardless of pad size, because the rhythmic
        // spacing solver does not reserve a horizontal pad gap.
        const sky: Skyline = SkylineFixtures.newSkyline(0, 100);
        sky.insert(10, 30, 5, 0);
        expect(sky.placeAbove(35, 40, 1, 0)).toBe(0);
        expect(sky.placeAbove(35, 40, 1, 10)).toBe(10);
    });

    it('multiple non-overlapping inserts coexist', () => {
        const sky: Skyline = SkylineFixtures.newSkyline(0, 100);
        sky.insert(10, 30, 5, 0);
        sky.insert(50, 70, 3, 0);
        expect(sky.placeAbove(15, 25, 1, 0)).toBe(5);
        expect(sky.placeAbove(55, 65, 1, 0)).toBe(3);
        expect(sky.placeAbove(35, 45, 1, 0)).toBe(0);
    });

    it('overlapping inserts take the per-x max', () => {
        const sky: Skyline = SkylineFixtures.newSkyline(0, 100);
        sky.insert(10, 40, 5, 0);
        sky.insert(30, 60, 8, 0);
        expect(sky.placeAbove(15, 25, 1, 0)).toBe(5);
        expect(sky.placeAbove(35, 38, 1, 0)).toBe(8);
        expect(sky.placeAbove(45, 55, 1, 0)).toBe(8);
        expect(sky.placeAbove(80, 90, 1, 0)).toBe(0);
    });

    it('insert below current height is a no-op (per-x max semantics)', () => {
        const sky: Skyline = SkylineFixtures.newSkyline(0, 100);
        sky.insert(10, 30, 5, 0);
        sky.insert(10, 30, 2, 0);
        expect(sky.placeAbove(15, 25, 1, 0)).toBe(5);
    });

    it('non-positive newHeight is a no-op', () => {
        const sky: Skyline = SkylineFixtures.newSkyline(0, 100);
        sky.insert(10, 30, 0, 0);
        sky.insert(10, 30, -5, 0);
        expect(sky.maxHeight()).toBe(0);
    });

    it('insert outside the skyline range is clamped to [xMin, xMax]', () => {
        const sky: Skyline = SkylineFixtures.newSkyline(0, 100);
        sky.insert(-50, 200, 7, 0);
        expect(sky.placeAbove(0, 100, 1, 0)).toBe(7);
    });
});

describe('Skyline — placeBelow', () => {
    it('placeBelow runs the same algorithm as placeAbove', () => {
        const sky: Skyline = SkylineFixtures.newSkyline(0, 100);
        sky.insert(10, 30, 4, 0);
        expect(sky.placeBelow(15, 25, 1, 0)).toBe(4);
        expect(sky.placeBelow(15, 25, 1, 0.5)).toBe(4.5);
    });
});

describe('Skyline — adjacency merge', () => {
    it('two contiguous same-height inserts collapse into one segment', () => {
        const sky: Skyline = SkylineFixtures.newSkyline(0, 100);
        sky.insert(10, 30, 5, 0);
        sky.insert(30, 50, 5, 0);
        expect(sky.segmentCount).toBe(3);
        expect(sky.placeAbove(40, 45, 1, 0)).toBe(5);
    });

    it('three overlapping inserts at same height collapse', () => {
        const sky: Skyline = SkylineFixtures.newSkyline(0, 100);
        sky.insert(10, 30, 5, 0);
        sky.insert(20, 40, 5, 0);
        sky.insert(35, 50, 5, 0);
        expect(sky.segmentCount).toBe(3);
        expect(sky.placeAbove(15, 45, 1, 0)).toBe(5);
    });
});

describe('Skyline — segment splitting at insert boundaries', () => {
    it('insert splits existing segments at xStart and xEnd', () => {
        const sky: Skyline = SkylineFixtures.newSkyline(0, 100);
        sky.insert(0, 100, 3, 0);
        expect(sky.segmentCount).toBe(1);
        sky.insert(20, 40, 7, 0);
        expect(sky.segmentCount).toBe(3);
        expect(sky.placeAbove(10, 15, 1, 0)).toBe(3);
        expect(sky.placeAbove(25, 35, 1, 0)).toBe(7);
        expect(sky.placeAbove(50, 60, 1, 0)).toBe(3);
    });
});

describe('Skyline — maxHeight', () => {
    it('returns the largest segment height', () => {
        const sky: Skyline = SkylineFixtures.newSkyline(0, 100);
        sky.insert(10, 30, 5, 0);
        sky.insert(50, 70, 12, 0);
        sky.insert(80, 90, 3, 0);
        expect(sky.maxHeight()).toBe(12);
    });

    it('returns 0 for an empty skyline', () => {
        const sky: Skyline = SkylineFixtures.newSkyline(0, 100);
        expect(sky.maxHeight()).toBe(0);
    });
});

describe('Skyline — union', () => {
    it('raises self to per-x max of self and other', () => {
        const a: Skyline = SkylineFixtures.newSkyline(0, 100);
        const b: Skyline = SkylineFixtures.newSkyline(0, 100);
        a.insert(10, 40, 5, 0);
        b.insert(30, 60, 8, 0);
        a.union(b);
        expect(a.placeAbove(15, 25, 1, 0)).toBe(5);
        expect(a.placeAbove(35, 38, 1, 0)).toBe(8);
        expect(a.placeAbove(45, 55, 1, 0)).toBe(8);
        expect(a.placeAbove(65, 75, 1, 0)).toBe(0);
    });

    it('union of an empty skyline is a no-op', () => {
        const a: Skyline = SkylineFixtures.newSkyline(0, 100);
        a.insert(10, 30, 5, 0);
        const empty: Skyline = SkylineFixtures.newSkyline(0, 100);
        a.union(empty);
        expect(a.placeAbove(15, 25, 1, 0)).toBe(5);
        expect(a.maxHeight()).toBe(5);
    });
});

describe('Skyline — unionShifted', () => {
    it('shifts other by dx and takes per-x max with self', () => {
        const a: Skyline = SkylineFixtures.newSkyline(0, 100);
        const b: Skyline = SkylineFixtures.newSkyline(0, 50);
        a.insert(10, 40, 5, 0);
        b.insert(0, 20, 8, 0);
        // dx = 30: b's [0,20)@8 lands on a as [30,50)@8.
        a.unionShifted(b, 30);
        expect(a.placeAbove(15, 25, 1, 0)).toBe(5);
        expect(a.placeAbove(30, 40, 1, 0)).toBe(8); // overlap of a's [10,40)@5 and shifted b's [30,50)@8 → 8
        expect(a.placeAbove(40, 50, 1, 0)).toBe(8);
        expect(a.placeAbove(60, 80, 1, 0)).toBe(0);
    });

    it('clamps shifted segments to [xMin, xMax]', () => {
        const a: Skyline = SkylineFixtures.newSkyline(0, 100);
        const b: Skyline = SkylineFixtures.newSkyline(0, 100);
        b.insert(10, 30, 6, 0);
        // dx = -20 → b's [10,30)@6 maps to a's [-10, 10)@6; clamp to [0, 10).
        a.unionShifted(b, -20);
        expect(a.placeAbove(0, 10, 1, 0)).toBe(6);
        expect(a.placeAbove(10, 20, 1, 0)).toBe(0);
    });

    it('drops shifted segments that fall fully outside the target range', () => {
        const a: Skyline = SkylineFixtures.newSkyline(0, 100);
        const b: Skyline = SkylineFixtures.newSkyline(0, 50);
        b.insert(0, 50, 9, 0);
        // dx = 200 → entire shifted other lies past xMax=100; no-op.
        a.unionShifted(b, 200);
        expect(a.maxHeight()).toBe(0);
        expect(a.segmentCount).toBe(1);
    });

    it('empty other is a no-op', () => {
        const a: Skyline = SkylineFixtures.newSkyline(0, 100);
        a.insert(10, 30, 5, 0);
        const empty: Skyline = SkylineFixtures.newSkyline(0, 100);
        a.unionShifted(empty, 7);
        expect(a.placeAbove(15, 25, 1, 0)).toBe(5);
        expect(a.maxHeight()).toBe(5);
    });

    it('repeated unions accumulate correctly (per-x max)', () => {
        const a: Skyline = SkylineFixtures.newSkyline(0, 100);
        const b: Skyline = SkylineFixtures.newSkyline(0, 20);
        b.insert(0, 20, 4, 0);
        a.unionShifted(b, 0); // contributes [0,20)@4
        a.unionShifted(b, 30); // contributes [30,50)@4
        a.unionShifted(b, 60); // contributes [60,80)@4
        expect(a.placeAbove(0, 20, 1, 0)).toBe(4);
        expect(a.placeAbove(20, 30, 1, 0)).toBe(0);
        expect(a.placeAbove(30, 50, 1, 0)).toBe(4);
        expect(a.placeAbove(50, 60, 1, 0)).toBe(0);
        expect(a.placeAbove(60, 80, 1, 0)).toBe(4);
    });

    it('produces canonical segments (no adjacent same-height entries)', () => {
        const a: Skyline = SkylineFixtures.newSkyline(0, 100);
        const b: Skyline = SkylineFixtures.newSkyline(0, 50);
        a.insert(10, 30, 5, 0);
        b.insert(0, 20, 5, 0);
        // b shifted by 30 -> [30,50)@5. Adjacent to a's [10,30)@5 → must coalesce
        // into a single [10,50)@5 segment.
        a.unionShifted(b, 30);
        // segmentCount counts non-sentinel pieces. A canonical layout for this
        // result is: [{0,0},{10,5},{50,0},{100,0sentinel}] => 3 visible pieces
        // (the [50,100)@0 tail is one segment before sentinel).
        expect(a.segmentCount).toBe(3);
        expect(a.placeAbove(15, 25, 1, 0)).toBe(5);
        expect(a.placeAbove(30, 50, 1, 0)).toBe(5);
        expect(a.placeAbove(50, 60, 1, 0)).toBe(0);
    });

    it('index-based segment accessors mirror forEachSegment', () => {
        const sky: Skyline = SkylineFixtures.newSkyline(0, 100);
        sky.insert(10, 30, 5, 0);
        sky.insert(50, 70, 8, 0);

        const fromCb: SkylineSegmentExpect[] = [];
        sky.forEachSegment((xStart: number, xEnd: number, height: number) => {
            fromCb.push({ s: xStart, e: xEnd, h: height });
        });
        const fromIdx: SkylineSegmentExpect[] = [];
        for (let i: number = 0; i < sky.segmentCount; i = i + 1) {
            fromIdx.push({ s: sky.segmentXStart(i), e: sky.segmentXEnd(i), h: sky.segmentHeight(i) });
        }
        // Per-element scalar comparison (named-record arrays lack structural
        // equality in the C# transpilation target — see SYNTAX.md notes on
        // @record class identity).
        expect(fromIdx.length).toBe(fromCb.length);
        for (let i: number = 0; i < fromIdx.length; i = i + 1) {
            expect(fromIdx[i].s).toBe(fromCb[i].s);
            expect(fromIdx[i].e).toBe(fromCb[i].e);
            expect(fromIdx[i].h).toBe(fromCb[i].h);
        }
    });
});

describe('Skyline — reset', () => {
    it('returns segments to the pool and rebuilds the baseline', () => {
        const pool: SkylineSegmentPool = new SkylineSegmentPool();
        const sky: Skyline = new Skyline(0, 100, pool);
        sky.insert(10, 30, 5, 0);
        sky.insert(50, 70, 8, 0);
        const grownBefore: number = pool.grownCount;
        expect(grownBefore).toBeGreaterThan(2);
        sky.reset();
        expect(sky.maxHeight()).toBe(0);
        expect(sky.segmentCount).toBe(1);
        sky.insert(20, 80, 6, 0);
        expect(sky.placeAbove(40, 60, 1, 0)).toBe(6);
        expect(pool.grownCount).toBe(grownBefore);
    });

    it('reset is idempotent', () => {
        const sky: Skyline = SkylineFixtures.newSkyline(0, 100);
        sky.insert(10, 30, 5, 0);
        sky.reset();
        sky.reset();
        expect(sky.maxHeight()).toBe(0);
        expect(sky.segmentCount).toBe(1);
    });
});

describe('SkylineSegmentPool class', () => {
    it('acquires a fresh segment with zeroed fields', () => {
        const pool: SkylineSegmentPool = new SkylineSegmentPool();
        const a = pool.acquire();
        expect(a.xStart).toBe(0);
        expect(a.height).toBe(0);
    });

    it('reuses released segments before growing', () => {
        const pool: SkylineSegmentPool = new SkylineSegmentPool();
        const a = pool.acquire();
        a.xStart = 5;
        a.height = 7;
        pool.release(a);
        const b = pool.acquire();
        expect(b).toBe(a);
        expect(b.xStart).toBe(0);
        expect(b.height).toBe(0);
        expect(pool.grownCount).toBe(1);
    });
});
