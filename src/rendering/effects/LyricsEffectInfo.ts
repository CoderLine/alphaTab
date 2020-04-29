import { Beat } from '@src/model/Beat';
import { TextAlign } from '@src/platform/ICanvas';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@src/rendering/EffectBarGlyphSizing';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { LyricsGlyph } from '@src/rendering/glyphs/LyricsGlyph';
import { IEffectBarRendererInfo } from '@src/rendering/IEffectBarRendererInfo';
import { Settings } from '@src/Settings';

export class LyricsEffectInfo implements IEffectBarRendererInfo {
    public get effectId(): string {
        return 'lyrics';
    }

    public get hideOnMultiTrack(): boolean {
        return false;
    }

    public get canShareBand(): boolean {
        return false;
    }

    public get sizingMode(): EffectBarGlyphSizing {
        return EffectBarGlyphSizing.SingleOnBeat;
    }

    public shouldCreateGlyph(settings: Settings, beat: Beat): boolean {
        return !!beat.lyrics;
    }

    public createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new LyricsGlyph(0, 0, beat.lyrics!, renderer.resources.effectFont, TextAlign.Center);
    }

    public canExpand(from: Beat, to: Beat): boolean {
        return true;
    }
}
