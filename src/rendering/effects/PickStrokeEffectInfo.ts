import { Beat } from '@src/model/Beat';
import { PickStroke } from '@src/model/PickStroke';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@src/rendering/EffectBarGlyphSizing';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { PickStrokeGlyph } from '@src/rendering/glyphs/PickStrokeGlyph';
import { IEffectBarRendererInfo } from '@src/rendering/IEffectBarRendererInfo';
import { Settings } from '@src/Settings';

export class PickStrokeEffectInfo implements IEffectBarRendererInfo {
    public get effectId(): string {
        return 'pick-stroke';
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
        return beat.pickStroke !== PickStroke.None;
    }

    public createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new PickStrokeGlyph(0, 0, beat.pickStroke);
    }

    public canExpand(from: Beat, to: Beat): boolean {
        return true;
    }
}
