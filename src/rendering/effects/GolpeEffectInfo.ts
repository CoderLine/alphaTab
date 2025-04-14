import { NotationElement } from '@src/NotationSettings';
import { EffectBarGlyphSizing } from '../EffectBarGlyphSizing';
import type { Settings } from '@src/Settings';
import type { Beat } from '@src/model';
import type { GolpeType } from '@src/model/GolpeType';
import { EffectBarRendererInfo } from '../EffectBarRendererInfo';
import type { BarRendererBase } from '../BarRendererBase';
import type { EffectGlyph } from '../glyphs/EffectGlyph';
import { GuitarGolpeGlyph } from '../glyphs/GuitarGolpeGlyph';

export class GolpeEffectInfo extends EffectBarRendererInfo {
    private _type: GolpeType;
    private _shouldCreate?: (settings: Settings, beat: Beat) => boolean;

    public constructor(type: GolpeType, shouldCreate?: (settings: Settings, beat: Beat) => boolean) {
        super();
        this._type = type;
        this._shouldCreate = shouldCreate;
    }

    public get notationElement(): NotationElement {
        return NotationElement.EffectGolpe;
    }

    public get hideOnMultiTrack(): boolean {
        return false;
    }

    public get canShareBand(): boolean {
        return true;
    }

    public get sizingMode(): EffectBarGlyphSizing {
        return EffectBarGlyphSizing.SingleOnBeat;
    }

    public shouldCreateGlyph(settings: Settings, beat: Beat): boolean {
        const shouldCreate = this._shouldCreate;
        return beat.golpe == this._type && (!shouldCreate || shouldCreate(settings, beat));
    }

    public createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new GuitarGolpeGlyph(0, 0, true);
    }

    public canExpand(from: Beat, to: Beat): boolean {
        return false;
    }
}
