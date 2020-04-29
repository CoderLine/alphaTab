import { Bar } from '@src/model/Bar';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { BarRendererFactory } from '@src/rendering/BarRendererFactory';
import { EffectBarRenderer } from '@src/rendering/EffectBarRenderer';
import { IEffectBarRendererInfo } from '@src/rendering/IEffectBarRendererInfo';
import { ScoreRenderer } from '@src/rendering/ScoreRenderer';

export class EffectBarRendererFactory extends BarRendererFactory {
    private _infos: IEffectBarRendererInfo[];
    private _staffId: string;
    public get staffId(): string {
        return this._staffId;
    }

    public constructor(staffId: string, infos: IEffectBarRendererInfo[]) {
        super();
        this._infos = infos;
        this._staffId = staffId;
        this.isInAccolade = false;
        this.isRelevantForBoundsLookup = false;
    }

    public create(renderer: ScoreRenderer, bar: Bar): BarRendererBase {
        return new EffectBarRenderer(renderer, bar, this._infos);
    }
}
