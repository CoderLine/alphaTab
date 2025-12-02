import type { Bar } from '@coderline/alphatab/model/Bar';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { BarRendererFactory } from '@coderline/alphatab/rendering/BarRendererFactory';
import { EffectBarRenderer } from '@coderline/alphatab/rendering/EffectBarRenderer';
import type { EffectBarRendererInfo } from '@coderline/alphatab/rendering/EffectBarRendererInfo';
import type { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import type { RenderStaff } from '@coderline/alphatab/rendering/staves/RenderStaff';
import type { Staff } from '@coderline/alphatab/model/Staff';
import type { Track } from '@coderline/alphatab/model/Track';

/**
 * @internal
 */
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
