import { Skyline } from '@coderline/alphatab/rendering/skyline/Skyline';
import { SkylineScratch } from '@coderline/alphatab/rendering/skyline/SkylineScratch';

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

    private static _empty: BarLocalSkyline | null = null;

    /**
     * A skyline pair without segments that stands in for bar-local skylines which were never
     * created. Must not be inserted into.
     */
    public static get empty(): BarLocalSkyline {
        let empty = BarLocalSkyline._empty;
        if (!empty) {
            empty = new BarLocalSkyline(0, Number.MAX_SAFE_INTEGER, new SkylineScratch());
            BarLocalSkyline._empty = empty;
        }
        return empty;
    }

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
