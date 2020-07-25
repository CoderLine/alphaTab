import { Beat } from '@src/model/Beat';
import { VibratoType } from '@src/model/VibratoType';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@src/rendering/EffectBarGlyphSizing';
import { BeatVibratoGlyph } from '@src/rendering/glyphs/BeatVibratoGlyph';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { EffectBarRendererInfo } from '@src/rendering/EffectBarRendererInfo';
import { Settings } from '@src/Settings';
import { NotationElement } from '@src/NotationSettings';

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

    public shouldCreateGlyph(settings: Settings, beat: Beat): boolean {
        return beat.vibrato === VibratoType.Wide;
    }

    public createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new BeatVibratoGlyph(VibratoType.Wide);
    }

    public canExpand(from: Beat, to: Beat): boolean {
        return true;
    }
}
