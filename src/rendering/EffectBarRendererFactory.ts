import { Bar } from '@src/model/Bar';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { BarRendererFactory } from '@src/rendering/BarRendererFactory';
import { EffectBarRenderer } from '@src/rendering/EffectBarRenderer';
import { EffectBarRendererInfo } from '@src/rendering/EffectBarRendererInfo';
import { ScoreRenderer } from '@src/rendering/ScoreRenderer';
import { RenderStaff } from './staves/RenderStaff';
import { Staff, Track } from '@src/model';

export class EffectBarRendererFactory extends BarRendererFactory {
    public infos: EffectBarRendererInfo[];
    private _staffId: string;
    public get staffId(): string {
        return this._staffId;
    }

    public shouldShow?: (track:Track, staff:Staff) => boolean;

    public override getStaffPaddingTop(staff: RenderStaff): number {
        return staff.system.layout.renderer.settings.display.effectStaffPaddingTop;
    }

    public override getStaffPaddingBottom(staff: RenderStaff): number {
        return staff.system.layout.renderer.settings.display.effectStaffPaddingBottom;
    }

    public constructor(staffId: string, infos: EffectBarRendererInfo[], shouldShow?: (track:Track, staff:Staff) => boolean) {
        super();
        this.infos = infos;
        this._staffId = staffId;
        this.isInAccolade = false;
        this.isRelevantForBoundsLookup = false;
        this.shouldShow = shouldShow;
    }

    public override canCreate(track: Track, staff: Staff): boolean {
        const shouldShow = this.shouldShow;
        return super.canCreate(track, staff) && (!shouldShow || shouldShow(track, staff));
    }


    public create(renderer: ScoreRenderer, bar: Bar): BarRendererBase {
        return new EffectBarRenderer(
            renderer,
            bar,
            this.infos.filter(i => renderer.settings.notation.isNotationElementVisible(i.notationElement))
        );
    }
}
