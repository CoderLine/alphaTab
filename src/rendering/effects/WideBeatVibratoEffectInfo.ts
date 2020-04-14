import { Beat } from '@src/model/Beat';
import { VibratoType } from '@src/model/VibratoType';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@src/rendering/EffectBarGlyphSizing';
import { BeatVibratoGlyph } from '@src/rendering/glyphs/BeatVibratoGlyph';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { IEffectBarRendererInfo } from '@src/rendering/IEffectBarRendererInfo';
import { Settings } from '@src/Settings';

export class WideBeatVibratoEffectInfo implements IEffectBarRendererInfo {
    public get effectId(): string {
        return 'wide-beat-vibrato';
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
