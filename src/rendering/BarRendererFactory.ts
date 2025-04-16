import type { Bar } from '@src/model/Bar';
import type { Staff } from '@src/model/Staff';
import type { Track } from '@src/model/Track';
import type { BarRendererBase } from '@src/rendering/BarRendererBase';
import type { ScoreRenderer } from '@src/rendering/ScoreRenderer';
import type { RenderStaff } from '@src/rendering/staves/RenderStaff';

/**
 * This is the base public class for creating factories providing BarRenderers
 */
export abstract class BarRendererFactory {
    public isInsideBracket: boolean = true;
    public isRelevantForBoundsLookup: boolean = true;
    public hideOnMultiTrack: boolean = false;
    public hideOnPercussionTrack: boolean = false;

    public abstract get staffId(): string;
    public abstract getStaffPaddingTop(staff: RenderStaff): number;
    public abstract getStaffPaddingBottom(staff: RenderStaff): number;

    public canCreate(track: Track, staff: Staff): boolean {
        return !this.hideOnPercussionTrack || !staff.isPercussion;
    }

    public abstract create(renderer: ScoreRenderer, bar: Bar): BarRendererBase;
}
