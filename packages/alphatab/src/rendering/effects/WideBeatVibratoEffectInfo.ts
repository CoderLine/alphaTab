import type { Beat } from '@coderline/alphatab/model/Beat';
import { VibratoType } from '@coderline/alphatab/model/VibratoType';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { BeatVibratoGlyph } from '@coderline/alphatab/rendering/glyphs/BeatVibratoGlyph';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { Settings } from '@coderline/alphatab/Settings';
import { NotationElement } from '@coderline/alphatab/NotationSettings';

/**
 * @internal
 */
export class WideBeatVibratoEffectInfo extends EffectInfo {
    public get notationElement(): NotationElement {
        return NotationElement.EffectWideBeatVibrato;
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
        return beat.vibrato === VibratoType.Wide;
    }

    public createNewGlyph(_renderer: BarRendererBase, _beat: Beat): EffectGlyph {
        return new BeatVibratoGlyph(0, 0, VibratoType.Wide);
    }

    public canExpand(_from: Beat, _to: Beat): boolean {
        return true;
    }
}
