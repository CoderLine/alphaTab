import type { Beat } from '@coderline/alphatab/model/Beat';
import { WahPedal } from '@coderline/alphatab/model/WahPedal';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBarRendererInfo } from '@coderline/alphatab/rendering/EffectBarRendererInfo';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { WahPedalGlyph } from '@coderline/alphatab/rendering/glyphs/WahPedalGlyph';
import type { Settings } from '@coderline/alphatab/Settings';

/**
 * @internal
 */
export class WahPedalEffectInfo extends EffectBarRendererInfo {
    public get notationElement(): NotationElement {
        return NotationElement.EffectWahPedal;
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
        return beat.wahPedal !== WahPedal.None;
    }

    public createNewGlyph(_renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new WahPedalGlyph(beat.wahPedal);
    }

    public canExpand(_from: Beat, _to: Beat): boolean {
        return false;
    }
}
