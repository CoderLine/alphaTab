import type { Beat } from '@coderline/alphatab/model/Beat';
import { PickStroke } from '@coderline/alphatab/model/PickStroke';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { PickStrokeGlyph } from '@coderline/alphatab/rendering/glyphs/PickStrokeGlyph';
import { EffectBarRendererInfo } from '@coderline/alphatab/rendering/EffectBarRendererInfo';
import type { Settings } from '@coderline/alphatab/Settings';
import { NotationElement } from '@coderline/alphatab/NotationSettings';

/**
 * @internal
 */
export class PickStrokeEffectInfo extends EffectBarRendererInfo {
    public get notationElement(): NotationElement {
        return NotationElement.EffectPickStroke;
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

    public shouldCreateGlyph(_settings: Settings, beat: Beat): boolean {
        return beat.pickStroke !== PickStroke.None;
    }

    public createNewGlyph(_renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new PickStrokeGlyph(0, 0, beat.pickStroke);
    }

    public canExpand(_from: Beat, _to: Beat): boolean {
        return true;
    }
}
