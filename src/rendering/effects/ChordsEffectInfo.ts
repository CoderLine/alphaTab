import { Beat } from '@src/model/Beat';
import { TextAlign } from '@src/platform/ICanvas';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@src/rendering/EffectBarGlyphSizing';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { TextGlyph } from '@src/rendering/glyphs/TextGlyph';
import { IEffectBarRendererInfo } from '@src/rendering/IEffectBarRendererInfo';
import { Settings } from '@src/Settings';

export class ChordsEffectInfo implements IEffectBarRendererInfo {
    public get effectId(): string {
        return 'chords';
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

    public shouldCreateGlyph(settings: Settings, beat: Beat): boolean {
        return beat.hasChord;
    }

    public createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new TextGlyph(0, 0, beat.chord!.name, renderer.resources.effectFont, TextAlign.Center);
    }

    public canExpand(from: Beat, to: Beat): boolean {
        return false;
    }
}
