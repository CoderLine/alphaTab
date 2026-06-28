import { StaffSide } from '@coderline/alphatab/rendering/skyline/BarLocalSkyline';
import { Skyline } from '@coderline/alphatab/rendering/skyline/Skyline';
import type { SkylineSegmentPool } from '@coderline/alphatab/rendering/skyline/SkylineSegmentPool';

/**
 * Skyline pair for system-level placement. Assembled by unioning per-bar
 * local skylines shifted by `renderer.x`.
 * @internal
 */
export class StaffSystemSkyline {
    public readonly staffIndex: number;
    public readonly systemIndex: number;
    public readonly upSky: Skyline;
    public readonly downSky: Skyline;

    public constructor(staffIndex: number, systemIndex: number, xMin: number, xMax: number, pool: SkylineSegmentPool) {
        this.staffIndex = staffIndex;
        this.systemIndex = systemIndex;
        this.upSky = new Skyline(xMin, xMax, pool);
        this.downSky = new Skyline(xMin, xMax, pool);
    }

    public insertPlaced(side: StaffSide, xStart: number, xEnd: number, outerEdgeHeight: number, pad: number): void {
        if (side === StaffSide.Top) {
            this.upSky.insert(xStart, xEnd, outerEdgeHeight, pad);
        } else {
            this.downSky.insert(xStart, xEnd, outerEdgeHeight, pad);
        }
    }

    public reset(): void {
        this.upSky.reset();
        this.downSky.reset();
    }
}
