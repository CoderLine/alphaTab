import { Beat } from '@src/model/Beat';
import { CrescendoType } from '@src/model/CrescendoType';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@src/rendering/EffectBarGlyphSizing';
import { CrescendoGlyph } from '@src/rendering/glyphs/CrescendoGlyph';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { EffectBarRendererInfo } from '@src/rendering/EffectBarRendererInfo';
import { Settings } from '@src/Settings';
import { NotationElement } from '@src/NotationSettings';

export class CrescendoEffectInfo extends EffectBarRendererInfo {
    public get notationElement(): NotationElement {
        return NotationElement.EffectCrescendo;
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
        return beat.crescendo !== CrescendoType.None;
    }

    public createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new CrescendoGlyph(0, 0, beat.crescendo);
    }

    public canExpand(from: Beat, to: Beat): boolean {
        return from.crescendo === to.crescendo;
    }
}
