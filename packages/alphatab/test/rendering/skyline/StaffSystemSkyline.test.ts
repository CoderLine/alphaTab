import { StaffSide } from '@coderline/alphatab/rendering/skyline/BarLocalSkyline';
import { SkylineSegmentPool } from '@coderline/alphatab/rendering/skyline/SkylineSegmentPool';
import { StaffSystemSkyline } from '@coderline/alphatab/rendering/skyline/StaffSystemSkyline';
import { describe, expect, it } from 'vitest';

/**
 * @internal
 */
class SysSkyHandle {
    public readonly sky: StaffSystemSkyline;
    public readonly pool: SkylineSegmentPool;
    public constructor(sky: StaffSystemSkyline, pool: SkylineSegmentPool) {
        this.sky = sky;
        this.pool = pool;
    }
}

/**
 * @internal
 */
class StaffSystemSkylineFixtures {
    public static newSysSky(
        staffIndex: number = 0,
        systemIndex: number = 0,
        xMin: number = 0,
        xMax: number = 200
    ): SysSkyHandle {
        const pool: SkylineSegmentPool = new SkylineSegmentPool();
        const sky: StaffSystemSkyline = new StaffSystemSkyline(staffIndex, systemIndex, xMin, xMax, pool);
        return new SysSkyHandle(sky, pool);
    }
}

describe('StaffSystemSkyline — construction', () => {
    it('records staffIndex + systemIndex and starts with flat skylines', () => {
        const h: SysSkyHandle = StaffSystemSkylineFixtures.newSysSky(2, 5, 0, 80);
        const sky: StaffSystemSkyline = h.sky;
        expect(sky.staffIndex).toBe(2);
        expect(sky.systemIndex).toBe(5);
        expect(sky.upSky.xMin).toBe(0);
        expect(sky.upSky.xMax).toBe(80);
        expect(sky.downSky.xMin).toBe(0);
        expect(sky.downSky.xMax).toBe(80);
        expect(sky.upSky.maxHeight()).toBe(0);
        expect(sky.downSky.maxHeight()).toBe(0);
    });
});

describe('StaffSystemSkyline — insertPlaced + routing', () => {
    it('side-aware insertPlaced raises only the addressed skyline', () => {
        const h: SysSkyHandle = StaffSystemSkylineFixtures.newSysSky();
        const sky: StaffSystemSkyline = h.sky;
        sky.insertPlaced(StaffSide.Top, 20, 80, 5, 0);
        sky.insertPlaced(StaffSide.Bottom, 40, 60, 4, 0);
        expect(sky.upSky.maxHeight()).toBe(5);
        expect(sky.downSky.maxHeight()).toBe(4);
    });
});

describe('StaffSystemSkyline — reset', () => {
    it('clears state for reuse', () => {
        const h: SysSkyHandle = StaffSystemSkylineFixtures.newSysSky();
        const sky: StaffSystemSkyline = h.sky;
        sky.insertPlaced(StaffSide.Top, 20, 40, 6, 0);
        sky.insertPlaced(StaffSide.Bottom, 50, 70, 3, 0);
        sky.reset();
        expect(sky.upSky.maxHeight()).toBe(0);
        expect(sky.downSky.maxHeight()).toBe(0);
        sky.insertPlaced(StaffSide.Top, 30, 70, 4, 0);
        expect(sky.upSky.maxHeight()).toBe(4);
    });
});
