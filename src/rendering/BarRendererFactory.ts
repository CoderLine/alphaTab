import { Bar } from '@src/model/Bar';
import { Staff } from '@src/model/Staff';
import { Track } from '@src/model/Track';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { ScoreRenderer } from '@src/rendering/ScoreRenderer';

/**
 * This is the base public class for creating factories providing BarRenderers
 */
export abstract class BarRendererFactory {
    public isInAccolade: boolean = true;
    public isRelevantForBoundsLookup: boolean = true;
    public hideOnMultiTrack: boolean = false;
    public hideOnPercussionTrack: boolean = false;

    public abstract get staffId(): string;

    public canCreate(track: Track, staff: Staff): boolean {
        return !this.hideOnPercussionTrack || !staff.isPercussion;
    }

    public abstract create(renderer: ScoreRenderer, bar: Bar): BarRendererBase;
}
