import type { Bar } from '@coderline/alphatab/model/Bar';
import type { Staff } from '@coderline/alphatab/model/Staff';
import type { Track } from '@coderline/alphatab/model/Track';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { BarRendererFactory } from '@coderline/alphatab/rendering/BarRendererFactory';
import type { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import { SlashBarRenderer } from '@coderline/alphatab/rendering/SlashBarRenderer';

/**
 * This Factory produces SlashBarRenderer instances
 * @internal
 */
export class SlashBarRendererFactory extends BarRendererFactory {
    public get staffId(): string {
        return SlashBarRenderer.StaffId;
    }

    public create(renderer: ScoreRenderer, bar: Bar): BarRendererBase {
        return new SlashBarRenderer(renderer, bar);
    }

    public override canCreate(track: Track, staff: Staff): boolean {
        return super.canCreate(track, staff) && staff.showSlash;
    }
}
