import type { Beat } from '@coderline/alphatab/model/Beat';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { LineRangedGlyph } from '@coderline/alphatab/rendering/glyphs/LineRangedGlyph';
import type { Settings } from '@coderline/alphatab/Settings';

/**
 * @internal
 */
export class RasgueadoEffectInfo extends EffectInfo {
    public get notationElement(): NotationElement {
        return NotationElement.EffectRasgueado;
    }

    public get hideOnMultiTrack(): boolean {
        return false;
    }

    public shouldCreateGlyph(_settings: Settings, beat: Beat): boolean {
        return beat.hasRasgueado;
    }

    public get sizingMode(): EffectBarGlyphSizing {
        return EffectBarGlyphSizing.GroupedOnBeat;
    }

    public createNewGlyph(_renderer: BarRendererBase, _beat: Beat): EffectGlyph {
        return new LineRangedGlyph('rasg.', NotationElement.EffectRasgueado);
    }

    public canExpand(_from: Beat, _to: Beat): boolean {
        return true;
    }
    public override get placementCategory(): EffectBandPlacementCategory {
        return EffectBandPlacementCategory.Span;
    }
}
