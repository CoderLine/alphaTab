import type { Bar } from '@coderline/alphatab/model/Bar';
import type { Staff } from '@coderline/alphatab/model/Staff';
import type { Track } from '@coderline/alphatab/model/Track';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { BarRendererFactory } from '@coderline/alphatab/rendering/BarRendererFactory';
import { NumberedBarRenderer } from '@coderline/alphatab/rendering/NumberedBarRenderer';
import type { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';

/**
 * This Factory produces NumberedBarRenderer instances
 * @internal
 */
export class NumberedBarRendererFactory extends BarRendererFactory {
    public get staffId(): string {
        return NumberedBarRenderer.StaffId;
    }

    public create(renderer: ScoreRenderer, bar: Bar): BarRendererBase {
        return new NumberedBarRenderer(renderer, bar);
    }

    public override canCreate(track: Track, staff: Staff): boolean {
        return super.canCreate(track, staff) && staff.showNumbered;
    }
}
