import { NotationElement } from '@coderline/alphatab/NotationSettings';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import type { Settings } from '@coderline/alphatab/Settings';
import type { Beat } from '@coderline/alphatab/model/Beat';
import { GolpeType } from '@coderline/alphatab/model/GolpeType';
import { EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { GuitarGolpeGlyph } from '@coderline/alphatab/rendering/glyphs/GuitarGolpeGlyph';

/**
 * @internal
 */
export class GolpeEffectInfo extends EffectInfo {
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

    public override get effectId(): string {
        return `${super.effectId}.${GolpeType[this._type]}`;
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
        return beat.golpe === this._type && (!shouldCreate || shouldCreate(settings, beat));
    }

    public createNewGlyph(_renderer: BarRendererBase, _beat: Beat): EffectGlyph {
        return new GuitarGolpeGlyph(0, 0, true);
    }

    public canExpand(_from: Beat, _to: Beat): boolean {
        return false;
    }
}
