import { Skyline } from '@coderline/alphatab/rendering/skyline/Skyline';
import type { SkylineSegmentPool } from '@coderline/alphatab/rendering/skyline/SkylineSegmentPool';

/** @internal */
export enum StaffSide {
    Top = 0,
    Bottom = 1
}

/**
 * Bar-local Skyline pair (renderer-local x).
 * @internal
 */
export class BarLocalSkyline {
    public readonly upSky: Skyline;
    public readonly downSky: Skyline;

    public constructor(xMin: number, xMax: number, pool: SkylineSegmentPool) {
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
