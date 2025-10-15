import type { Beat } from '@src/model/Beat';
import { VibratoType } from '@src/model/VibratoType';
import type { BarRendererBase } from '@src/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@src/rendering/EffectBarGlyphSizing';
import { BeatVibratoGlyph } from '@src/rendering/glyphs/BeatVibratoGlyph';
import type { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { EffectBarRendererInfo } from '@src/rendering/EffectBarRendererInfo';
import type { Settings } from '@src/Settings';
import { NotationElement } from '@src/NotationSettings';

/**
 * @internal
 */
export class WideBeatVibratoEffectInfo extends EffectBarRendererInfo {
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
