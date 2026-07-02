import { BarLocalSkyline, StaffSide } from '@coderline/alphatab/rendering/skyline/BarLocalSkyline';
import { SkylineSegmentPool } from '@coderline/alphatab/rendering/skyline/SkylineSegmentPool';
import { describe, expect, it } from 'vitest';

/**
 * @internal
 */
class Wrapper {
    public readonly bar: BarLocalSkyline;
    public readonly pool: SkylineSegmentPool;
    public constructor(xMin: number = 0, xMax: number = 100) {
        this.pool = new SkylineSegmentPool();
        this.bar = new BarLocalSkyline(xMin, xMax, this.pool);
    }
}

/**
 * @internal
 */
class BarLocalSkylineFixtures {
    public static newWrapper(xMin: number = 0, xMax: number = 100): Wrapper {
        return new Wrapper(xMin, xMax);
    }
}

describe('BarLocalSkyline — construction', () => {
    it('builds two flat skylines over the bar x-range', () => {
        const w: Wrapper = BarLocalSkylineFixtures.newWrapper(0, 50);
        expect(w.bar.upSky.xMin).toBe(0);
        expect(w.bar.upSky.xMax).toBe(50);
        expect(w.bar.downSky.xMin).toBe(0);
        expect(w.bar.downSky.xMax).toBe(50);
        expect(w.bar.upSky.maxHeight()).toBe(0);
        expect(w.bar.downSky.maxHeight()).toBe(0);
    });
});

describe('BarLocalSkyline — side-aware routing', () => {
    it('insertPlaced(Top) only affects upSky', () => {
        const w: Wrapper = BarLocalSkylineFixtures.newWrapper();
        w.bar.insertPlaced(StaffSide.Top, 10, 30, 5, 0);
        expect(w.bar.upSky.maxHeight()).toBe(5);
        expect(w.bar.downSky.maxHeight()).toBe(0);
    });

    it('insertPlaced(Bottom) only affects downSky', () => {
        const w: Wrapper = BarLocalSkylineFixtures.newWrapper();
        w.bar.insertPlaced(StaffSide.Bottom, 10, 30, 4, 0);
        expect(w.bar.downSky.maxHeight()).toBe(4);
        expect(w.bar.upSky.maxHeight()).toBe(0);
    });

    it('top and bottom are mutually independent', () => {
        const w: Wrapper = BarLocalSkylineFixtures.newWrapper();
        w.bar.insertPlaced(StaffSide.Top, 20, 60, 7, 0);
        w.bar.insertPlaced(StaffSide.Bottom, 20, 60, 2, 0);
        expect(w.bar.upSky.placeAbove(30, 50, 1, 0)).toBe(7);
        expect(w.bar.downSky.placeBelow(30, 50, 1, 0)).toBe(2);
    });
});

describe('BarLocalSkyline — reset', () => {
    it('returns child Skylines to baseline + reuses pool segments', () => {
        const w: Wrapper = BarLocalSkylineFixtures.newWrapper();
        w.bar.insertPlaced(StaffSide.Top, 10, 30, 4, 0);
        w.bar.insertPlaced(StaffSide.Bottom, 50, 70, 3, 0);
        const grownBefore: number = w.pool.grownCount;
        w.bar.reset();
        expect(w.bar.upSky.maxHeight()).toBe(0);
        expect(w.bar.downSky.maxHeight()).toBe(0);
        w.bar.insertPlaced(StaffSide.Top, 20, 80, 6, 0);
        expect(w.bar.upSky.placeAbove(40, 60, 1, 0)).toBe(6);
        expect(w.pool.grownCount).toBe(grownBefore);
    });
});
