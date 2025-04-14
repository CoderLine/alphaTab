import { Bar } from '@src/model/Bar';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { BarRendererFactory } from '@src/rendering/BarRendererFactory';
import { ScoreBarRenderer } from '@src/rendering/ScoreBarRenderer';
import { ScoreRenderer } from '@src/rendering/ScoreRenderer';
import { RenderStaff } from './staves/RenderStaff';
import { Track } from '@src/model/Track';
import { Staff } from '@src/model/Staff';

/**
 * This Factory produces ScoreBarRenderer instances
 */
export class ScoreBarRendererFactory extends BarRendererFactory {
    public get staffId(): string {
        return ScoreBarRenderer.StaffId;
    }

    public override getStaffPaddingTop(staff: RenderStaff): number {
        return staff.system.layout.renderer.settings.display.notationStaffPaddingTop;
    }

    public override getStaffPaddingBottom(staff: RenderStaff): number {
        return staff.system.layout.renderer.settings.display.notationStaffPaddingBottom;
    }

    public create(renderer: ScoreRenderer, bar: Bar): BarRendererBase {
        return new ScoreBarRenderer(renderer, bar);
    }

    public override canCreate(track: Track, staff: Staff): boolean {
        return super.canCreate(track, staff) && staff.showStandardNotation;
    }
}
