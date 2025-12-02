import type { Beat } from '@coderline/alphatab/model/Beat';
import { CrescendoType } from '@coderline/alphatab/model/CrescendoType';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { CrescendoGlyph } from '@coderline/alphatab/rendering/glyphs/CrescendoGlyph';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { EffectBarRendererInfo } from '@coderline/alphatab/rendering/EffectBarRendererInfo';
import type { Settings } from '@coderline/alphatab/Settings';
import { NotationElement } from '@coderline/alphatab/NotationSettings';

/**
 * @internal
 */
export class CrescendoEffectInfo extends EffectBarRendererInfo {
    public get notationElement(): NotationElement {
        return NotationElement.EffectCrescendo;
    }

    public get hideOnMultiTrack(): boolean {
        return false;
    }

    public get canShareBand(): boolean {
        return true;
    }

    public get sizingMode(): EffectBarGlyphSizing {
        return EffectBarGlyphSizing.GroupedOnBeatToEnd;
    }

    public shouldCreateGlyph(_settings: Settings, beat: Beat): boolean {
        return beat.crescendo !== CrescendoType.None;
    }

    public createNewGlyph(_renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new CrescendoGlyph(0, 0, beat.crescendo);
    }

    public canExpand(from: Beat, to: Beat): boolean {
        return from.crescendo === to.crescendo;
    }
}
