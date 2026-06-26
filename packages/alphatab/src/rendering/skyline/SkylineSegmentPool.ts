import { type IPoolable, ObjectPool } from '@coderline/alphatab/rendering/utils/ObjectPool';

/**
 * One segment of a piecewise-constant skyline. segment[i] covers
 * `[xStart, segments[i+1].xStart)`; final entry is a sentinel.
 * @internal
 */
export class SkylineSegment implements IPoolable {
    public xStart: number = 0;
    public height: number = 0;

    public reset(): void {
        this.xStart = 0;
        this.height = 0;
    }
}

/** @internal */
export class SkylineSegmentPool extends ObjectPool<SkylineSegment> {
    public constructor() {
        super(() => new SkylineSegment());
    }
}
