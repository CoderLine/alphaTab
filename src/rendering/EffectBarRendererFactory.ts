import type { Bar } from '@src/model/Bar';
import type { BarRendererBase } from '@src/rendering/BarRendererBase';
import { BarRendererFactory } from '@src/rendering/BarRendererFactory';
import { EffectBarRenderer } from '@src/rendering/EffectBarRenderer';
import type { EffectBarRendererInfo } from '@src/rendering/EffectBarRendererInfo';
import type { ScoreRenderer } from '@src/rendering/ScoreRenderer';
import type { RenderStaff } from '@src/rendering/staves/RenderStaff';
import type { Staff } from '@src/model/Staff';
import type { Track } from '@src/model/Track';

export class EffectBarRendererFactory extends BarRendererFactory {
    public infos: EffectBarRendererInfo[];
    private _staffId: string;
    public get staffId(): string {
        return this._staffId;
    }

    public shouldShow: ((track: Track, staff: Staff) => boolean) | null;

    public override getStaffPaddingTop(staff: RenderStaff): number {
        return staff.system.layout.renderer.settings.display.effectStaffPaddingTop;
    }

    public override getStaffPaddingBottom(staff: RenderStaff): number {
        return staff.system.layout.renderer.settings.display.effectStaffPaddingBottom;
    }

    public constructor(
        staffId: string,
        infos: EffectBarRendererInfo[],
        shouldShow: ((track: Track, staff: Staff) => boolean) | null = null
    ) {
        super();
        this.infos = infos;
        this._staffId = staffId;
        this.isInsideBracket = false;
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
