import { NotationElement } from '@coderline/alphatab/NotationSettings';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import type { Settings } from '@coderline/alphatab/Settings';
import type { Beat } from '@coderline/alphatab/model/Beat';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { EffectBarRendererInfo } from '@coderline/alphatab/rendering/EffectBarRendererInfo';
import { SustainPedalGlyph } from '@coderline/alphatab/rendering/glyphs/SustainPedalGlyph';

/**
 * @internal
 */
export class SustainPedalEffectInfo extends EffectBarRendererInfo {
    public get notationElement(): NotationElement {
        return NotationElement.EffectSustainPedal;
    }

    public get hideOnMultiTrack(): boolean {
        return false;
    }

    public get canShareBand(): boolean {
        return false;
    }

    public get sizingMode(): EffectBarGlyphSizing {
        return EffectBarGlyphSizing.FullBar;
    }

    public shouldCreateGlyph(_settings: Settings, beat: Beat): boolean {
        return beat.voice.index === 0 && beat.index === 0 && beat.voice.bar.sustainPedals.length > 0;
    }

    public createNewGlyph(_renderer: BarRendererBase, _beat: Beat): EffectGlyph {
        return new SustainPedalGlyph();
    }

    public canExpand(_from: Beat, _to: Beat): boolean {
        return true;
    }
}
