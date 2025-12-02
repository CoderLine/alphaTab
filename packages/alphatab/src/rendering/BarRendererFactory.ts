import type { Bar } from '@coderline/alphatab/model/Bar';
import type { Staff } from '@coderline/alphatab/model/Staff';
import type { Track } from '@coderline/alphatab/model/Track';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import type { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import type { RenderStaff } from '@coderline/alphatab/rendering/staves/RenderStaff';

/**
 * This is the base public class for creating factories providing BarRenderers
 * @internal
 */
export abstract class BarRendererFactory {
    public isInsideBracket: boolean = true;
    public isRelevantForBoundsLookup: boolean = true;
    public hideOnMultiTrack: boolean = false;
    public hideOnPercussionTrack: boolean = false;

    public abstract get staffId(): string;
    public abstract getStaffPaddingTop(staff: RenderStaff): number;
    public abstract getStaffPaddingBottom(staff: RenderStaff): number;

    public canCreate(_track: Track, staff: Staff): boolean {
        return !this.hideOnPercussionTrack || !staff.isPercussion;
    }

    public abstract create(renderer: ScoreRenderer, bar: Bar): BarRendererBase;
}
