import type { Bar } from '@coderline/alphatab/model/Bar';
import type { Staff } from '@coderline/alphatab/model/Staff';
import type { Track } from '@coderline/alphatab/model/Track';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { BarRendererFactory } from '@coderline/alphatab/rendering/BarRendererFactory';
import { ScoreBarRenderer } from '@coderline/alphatab/rendering/ScoreBarRenderer';
import type { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';

/**
 * This Factory produces ScoreBarRenderer instances
 * @internal
 */
export class ScoreBarRendererFactory extends BarRendererFactory {
    public get staffId(): string {
        return ScoreBarRenderer.StaffId;
    }

    public create(renderer: ScoreRenderer, bar: Bar): BarRendererBase {
        return new ScoreBarRenderer(renderer, bar);
    }

    public override canCreate(track: Track, staff: Staff): boolean {
        return super.canCreate(track, staff) && staff.showStandardNotation;
    }
}
