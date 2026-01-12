import type { Bar } from '@coderline/alphatab/model/Bar';
import type { Staff } from '@coderline/alphatab/model/Staff';
import type { Track } from '@coderline/alphatab/model/Track';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { BarRendererFactory, type EffectBandInfo } from '@coderline/alphatab/rendering/BarRendererFactory';
import type { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import { TabBarRenderer } from '@coderline/alphatab/rendering/TabBarRenderer';

/**
 * This Factory produces TabBarRenderer instances
 * @internal
 */
export class TabBarRendererFactory extends BarRendererFactory {
    public get staffId(): string {
        return TabBarRenderer.StaffId;
    }

    public constructor(effectBands: EffectBandInfo[]) {
        super(effectBands);
        this.hideOnPercussionTrack = true;
    }

    public override canCreate(track: Track, staff: Staff): boolean {
        return staff.showTablature && staff.tuning.length > 0 && super.canCreate(track, staff);
    }

    public create(renderer: ScoreRenderer, bar: Bar): BarRendererBase {
        return new TabBarRenderer(renderer, bar);
    }
}
