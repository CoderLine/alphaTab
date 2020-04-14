import { Bar } from '@src/model/Bar';
import { Staff } from '@src/model/Staff';
import { Track } from '@src/model/Track';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { BarRendererFactory } from '@src/rendering/BarRendererFactory';
import { ScoreRenderer } from '@src/rendering/ScoreRenderer';
import { TabBarRenderer } from '@src/rendering/TabBarRenderer';

/**
 * This Factory produces TabBarRenderer instances
 */
export class TabBarRendererFactory extends BarRendererFactory {
    private _showTimeSignature: boolean;
    private _showRests: boolean;
    private _showTiedNotes: boolean;

    public get staffId(): string {
        return TabBarRenderer.StaffId;
    }

    public constructor(showTimeSignature: boolean, showRests: boolean, showTiedNotes: boolean) {
        super();
        this._showTimeSignature = showTimeSignature;
        this._showRests = showRests;
        this._showTiedNotes = showTiedNotes;
        this.hideOnPercussionTrack = true;
    }

    public canCreate(track: Track, staff: Staff): boolean {
        return staff.tuning.length > 0 && super.canCreate(track, staff);
    }

    public create(renderer: ScoreRenderer, bar: Bar): BarRendererBase {
        let tabBarRenderer: TabBarRenderer = new TabBarRenderer(renderer, bar);
        tabBarRenderer.showRests = this._showRests;
        tabBarRenderer.showTimeSignature = this._showTimeSignature;
        tabBarRenderer.showTiedNotes = this._showTiedNotes;
        return tabBarRenderer;
    }
}
