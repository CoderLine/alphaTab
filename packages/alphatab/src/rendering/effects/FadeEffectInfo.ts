import type { Beat } from '@coderline/alphatab/model/Beat';
import { FadeType } from '@coderline/alphatab/model/FadeType';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { FadeGlyph } from '@coderline/alphatab/rendering/glyphs/FadeGlyph';
import type { Settings } from '@coderline/alphatab/Settings';

/**
 * @internal
 */
export class FadeEffectInfo extends EffectInfo {
    public get notationElement(): NotationElement {
        return NotationElement.EffectFadeIn;
    }

    public get hideOnMultiTrack(): boolean {
        return false;
    }

    public get sizingMode(): EffectBarGlyphSizing {
        return EffectBarGlyphSizing.SingleOnBeat;
    }

    public shouldCreateGlyph(_settings: Settings, beat: Beat): boolean {
        return beat.fade !== FadeType.None;
    }

    public createNewGlyph(_renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new FadeGlyph(beat.fade);
    }

    public canExpand(_from: Beat, _to: Beat): boolean {
        return true;
    }
    public override get placementCategory(): EffectBandPlacementCategory {
        return EffectBandPlacementCategory.Span;
    }
}
