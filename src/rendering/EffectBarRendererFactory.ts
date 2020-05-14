import { Bar } from '@src/model/Bar';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { BarRendererFactory } from '@src/rendering/BarRendererFactory';
import { EffectBarRenderer } from '@src/rendering/EffectBarRenderer';
import { EffectBarRendererInfo } from '@src/rendering/EffectBarRendererInfo';
import { ScoreRenderer } from '@src/rendering/ScoreRenderer';

export class EffectBarRendererFactory extends BarRendererFactory {
    private _infos: EffectBarRendererInfo[];
    private _staffId: string;
    public get staffId(): string {
        return this._staffId;
    }

    public constructor(staffId: string, infos: EffectBarRendererInfo[]) {
        super();
        this._infos = infos;
        this._staffId = staffId;
        this.isInAccolade = false;
        this.isRelevantForBoundsLookup = false;
    }

    public create(renderer: ScoreRenderer, bar: Bar): BarRendererBase {
        return new EffectBarRenderer(
            renderer,
            bar,
            this._infos.filter(i => renderer.settings.notation.isNotationElementVisible(i.notationElement))
        );
    }
}
