import { Beat } from '@src/model/Beat';
import { TextAlign } from '@src/platform/ICanvas';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@src/rendering/EffectBarGlyphSizing';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { TextGlyph } from '@src/rendering/glyphs/TextGlyph';
import { EffectBarRendererInfo } from '@src/rendering/EffectBarRendererInfo';
import { RenderingResources } from '@src/RenderingResources';
import { Settings } from '@src/Settings';
import { NotationElement } from '@src/NotationSettings';

export class TapEffectInfo extends EffectBarRendererInfo {
    public get notationElement(): NotationElement {
        return NotationElement.EffectTap;
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
        return beat.slap || beat.pop || beat.tap;
    }

    public createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph {
        let res: RenderingResources = renderer.resources;
        if (beat.slap) {
            return new TextGlyph(0, 0, 'S', res.effectFont, TextAlign.Left);
        }
        if (beat.pop) {
            return new TextGlyph(0, 0, 'P', res.effectFont, TextAlign.Left);
        }
        return new TextGlyph(0, 0, 'T', res.effectFont, TextAlign.Left);
    }

    public canExpand(from: Beat, to: Beat): boolean {
        return true;
    }
}
