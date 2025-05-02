import type { Bar } from '@src/model/Bar';
import type { BarRendererBase } from '@src/rendering/BarRendererBase';
import { BarRendererFactory } from '@src/rendering/BarRendererFactory';
import type { ScoreRenderer } from '@src/rendering/ScoreRenderer';
import type { Track } from '@src/model/Track';
import type { Staff } from '@src/model/Staff';
import type { RenderStaff } from '@src/rendering/staves/RenderStaff';
import { NumberedBarRenderer } from '@src/rendering/NumberedBarRenderer';

/**
 * This Factory produces NumberedBarRenderer instances
 */
export class NumberedBarRendererFactory extends BarRendererFactory {
    public get staffId(): string {
        return NumberedBarRenderer.StaffId;
    }

    public override getStaffPaddingTop(staff: RenderStaff): number {
        return staff.system.layout.renderer.settings.display.notationStaffPaddingTop;
    }

    public override getStaffPaddingBottom(staff: RenderStaff): number {
        return staff.system.layout.renderer.settings.display.notationStaffPaddingBottom;
    }

    public create(renderer: ScoreRenderer, bar: Bar): BarRendererBase {
        return new NumberedBarRenderer(renderer, bar);
    }

    public override canCreate(track: Track, staff: Staff): boolean {
        return super.canCreate(track, staff) && staff.showNumbered;
    }
}
