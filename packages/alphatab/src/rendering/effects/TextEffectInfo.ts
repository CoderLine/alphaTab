import type { Beat } from '@coderline/alphatab/model/Beat';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import { TextAlign } from '@coderline/alphatab/platform/ICanvas';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { TextGlyph } from '@coderline/alphatab/rendering/glyphs/TextGlyph';
import { OverlayRodPolicy } from '@coderline/alphatab/rendering/OverlayRodPolicy';
import type { Settings } from '@coderline/alphatab/Settings';

/**
 * @internal
 */
export class TextEffectInfo extends EffectInfo {
    public get notationElement(): NotationElement {
        return NotationElement.EffectText;
    }

    public get hideOnMultiTrack(): boolean {
        return false;
    }

    public get sizingMode(): EffectBarGlyphSizing {
        return EffectBarGlyphSizing.SingleOnBeat;
    }

    public override get overlayRodPolicy(): OverlayRodPolicy {
        return OverlayRodPolicy.Left;
    }

    public shouldCreateGlyph(_settings: Settings, beat: Beat): boolean {
        return !!beat.text;
    }

    public createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new TextGlyph(
            0,
            0,
            beat.text!,
            renderer.resources.elementFonts.get(NotationElement.EffectText)!,
            TextAlign.Left
        );
    }

    public canExpand(_from: Beat, _to: Beat): boolean {
        return true;
    }
}
