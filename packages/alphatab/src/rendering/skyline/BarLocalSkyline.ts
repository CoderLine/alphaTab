import { Skyline } from '@coderline/alphatab/rendering/skyline/Skyline';
import type { SkylineScratch } from '@coderline/alphatab/rendering/skyline/SkylineScratch';

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

    public constructor(xMin: number, xMax: number, scratch: SkylineScratch) {
        this.upSky = new Skyline(xMin, xMax, scratch);
        this.downSky = new Skyline(xMin, xMax, scratch);
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
