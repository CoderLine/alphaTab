import type { Bar } from '@src/model/Bar';
import type { Staff } from '@src/model/Staff';
import type { Track } from '@src/model/Track';
import type { BarRendererBase } from '@src/rendering/BarRendererBase';
import { BarRendererFactory } from '@src/rendering/BarRendererFactory';
import type { ScoreRenderer } from '@src/rendering/ScoreRenderer';
import { TabBarRenderer } from '@src/rendering/TabBarRenderer';
import type { RenderStaff } from '@src/rendering/staves/RenderStaff';

/**
 * This Factory produces TabBarRenderer instances
 */
export class TabBarRendererFactory extends BarRendererFactory {
    public showTimeSignature: boolean | null = null;
    public showRests: boolean | null = null;
    public showTiedNotes: boolean | null = null;

    public get staffId(): string {
        return TabBarRenderer.StaffId;
    }

    public override getStaffPaddingTop(staff: RenderStaff): number {
        return staff.system.layout.renderer.settings.display.notationStaffPaddingTop;
    }

    public override getStaffPaddingBottom(staff: RenderStaff): number {
        return staff.system.layout.renderer.settings.display.notationStaffPaddingBottom;
    }

    public constructor() {
        super();
        this.hideOnPercussionTrack = true;
    }

    public override canCreate(track: Track, staff: Staff): boolean {
        return staff.showTablature && staff.tuning.length > 0 && super.canCreate(track, staff);
    }

    public create(renderer: ScoreRenderer, bar: Bar): BarRendererBase {
        const tabBarRenderer: TabBarRenderer = new TabBarRenderer(renderer, bar);
        if (this.showRests !== null) {
            tabBarRenderer.showRests = this.showRests!;
        }
        if (this.showTimeSignature !== null) {
            tabBarRenderer.showTimeSignature = this.showTimeSignature!;
        }
        if (this.showTiedNotes !== null) {
            tabBarRenderer.showTiedNotes = this.showTiedNotes!;
        }
        return tabBarRenderer;
    }
}
