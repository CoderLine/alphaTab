import type { Beat } from '@coderline/alphatab/model/Beat';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import { TextAlign } from '@coderline/alphatab/platform/ICanvas';
import type { RenderingResources } from '@coderline/alphatab/RenderingResources';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { TextGlyph } from '@coderline/alphatab/rendering/glyphs/TextGlyph';
import type { Settings } from '@coderline/alphatab/Settings';

/**
 * @internal
 */
export class TapEffectInfo extends EffectInfo {
    public get notationElement(): NotationElement {
        return NotationElement.EffectTap;
    }

    public get hideOnMultiTrack(): boolean {
        return false;
    }

    public get sizingMode(): EffectBarGlyphSizing {
        return EffectBarGlyphSizing.SingleOnBeat;
    }

    public shouldCreateGlyph(_settings: Settings, beat: Beat): boolean {
        return beat.slap || beat.pop || beat.tap;
    }

    public createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph {
        const res: RenderingResources = renderer.resources;
        if (beat.slap) {
            return new TextGlyph(0, 0, 'S', res.elementFonts.get(NotationElement.EffectTap)!, TextAlign.Center);
        }
        if (beat.pop) {
            return new TextGlyph(0, 0, 'P', res.elementFonts.get(NotationElement.EffectTap)!, TextAlign.Center);
        }
        return new TextGlyph(0, 0, 'T', res.elementFonts.get(NotationElement.EffectTap)!, TextAlign.Center);
    }

    public canExpand(_from: Beat, _to: Beat): boolean {
        return true;
    }
}
