import { Beat } from '@src/model/Beat';
import { TextAlign } from '@src/platform/ICanvas';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@src/rendering/EffectBarGlyphSizing';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { TextGlyph } from '@src/rendering/glyphs/TextGlyph';
import { IEffectBarRendererInfo } from '@src/rendering/IEffectBarRendererInfo';
import { Settings } from '@src/Settings';

export class CapoEffectInfo implements IEffectBarRendererInfo {
    public get effectId(): string {
        return 'capo';
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
        return beat.index === 0 && beat.voice.bar.index === 0 && beat.voice.bar.staff.capo !== 0;
    }

    public createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new TextGlyph(
            0,
            0,
            'Capo. fret ' + beat.voice.bar.staff.capo,
            renderer.resources.effectFont,
            TextAlign.Left
        );
    }

    public canExpand(from: Beat, to: Beat): boolean {
        return false;
    }
}
