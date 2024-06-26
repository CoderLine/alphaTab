import { Bar } from '@src/model/Bar';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { BarRendererFactory } from '@src/rendering/BarRendererFactory';
import { SlashBarRenderer } from '@src/rendering/SlashBarRenderer';
import { ScoreRenderer } from '@src/rendering/ScoreRenderer';
import { Track } from '@src/model/Track';
import { Staff } from '@src/model';
import { RenderStaff } from './staves/RenderStaff';

/**
 * This Factory procudes SlashBarRenderer instances
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

    public constructor() {
        super();
    }
}
