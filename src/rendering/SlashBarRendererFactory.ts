import type { Bar } from '@src/model/Bar';
import type { BarRendererBase } from '@src/rendering/BarRendererBase';
import { BarRendererFactory } from '@src/rendering/BarRendererFactory';
import { SlashBarRenderer } from '@src/rendering/SlashBarRenderer';
import type { ScoreRenderer } from '@src/rendering/ScoreRenderer';
import type { Track } from '@src/model/Track';
import type { Staff } from '@src/model/Staff';
import type { RenderStaff } from '@src/rendering/staves/RenderStaff';

/**
 * This Factory produces SlashBarRenderer instances
 */
export class SlashBarRendererFactory extends BarRendererFactory {
    public get staffId(): string {
        return SlashBarRenderer.StaffId;
    }

    public override getStaffPaddingTop(staff: RenderStaff): number {
        return staff.system.layout.renderer.settings.display.notationStaffPaddingTop;
    }

    public override getStaffPaddingBottom(staff: RenderStaff): number {
        return staff.system.layout.renderer.settings.display.notationStaffPaddingBottom;
    }

    public create(renderer: ScoreRenderer, bar: Bar): BarRendererBase {
        return new SlashBarRenderer(renderer, bar);
    }

    public override canCreate(track: Track, staff: Staff): boolean {
        return super.canCreate(track, staff) && staff.showSlash;
    }
}
