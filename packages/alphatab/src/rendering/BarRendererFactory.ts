import type { Bar } from '@coderline/alphatab/model/Bar';
import type { Staff } from '@coderline/alphatab/model/Staff';
import type { Track } from '@coderline/alphatab/model/Track';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import type { EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import type { RenderStaff } from '@coderline/alphatab/rendering/staves/RenderStaff';

/**
 * The different modes on how effect bands are applied to bar renderers.
 */
export enum EffectBandMode {
    /**
     * The band is owned by the specific renderer.
     * If the owning renderer is not shown, the band will not be shown either.
     * The band is shown on top of the main renderer.
     */
    OwnedTop = 0,
    /**
     * The band is owned by the specific renderer.
     * If the owning renderer is not shown, the band will not be shown either.
     * The band is shown on bottom of the main renderer.
     */
    OwnedBottom = 1,
    /**
     * The band is shared across renderers.
     * If the owning renderer is shown, the band is shown on top the main renderer.
     * If the renderer is not shown, the band is shown on the top of the next renderer which is visible.
     *
     * If no visible render follows, they are added to the bottom of the previous visible renderer.
     */
    SharedTop = 2,

    /**
     * The band is shared across renderers.
     * If the owning renderer is shown, the band is shown on bottom of the main renderer.
     * If the owning renderer is not shown, the band is shown on the **bottom** of the next renderer which is visible.
     *
     * If no visible render follows, they are added to the bottom of the previous visible renderer.
     */
    SharedBottom = 3
}

/**
 * @record
 */
export interface EffectBandInfo {
    mode: EffectBandMode;
    effect: EffectInfo;
    order?: number;
    shouldCreate?: (staff: Staff) => boolean;
}

/**
 * This is the base public class for creating factories providing BarRenderers
 * @internal
 */
export abstract class BarRendererFactory {
    public isInsideBracket: boolean = true;
    public isRelevantForBoundsLookup: boolean = true;
    public hideOnMultiTrack: boolean = false;
    public hideOnPercussionTrack: boolean = false;

    public effectBands: EffectBandInfo[];

    public abstract get staffId(): string;
    public abstract getStaffPaddingTop(staff: RenderStaff): number;
    public abstract getStaffPaddingBottom(staff: RenderStaff): number;

    public constructor(effectBands: EffectBandInfo[]) {
        this.effectBands = effectBands;
    }

    public canCreate(_track: Track, staff: Staff): boolean {
        return !this.hideOnPercussionTrack || !staff.isPercussion;
    }

    public abstract create(renderer: ScoreRenderer, bar: Bar): BarRendererBase;
}
