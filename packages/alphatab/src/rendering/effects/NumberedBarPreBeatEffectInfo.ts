import type { Beat } from '@coderline/alphatab/model/Beat';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { NumberedKeySignatureGlyph } from '@coderline/alphatab/rendering/glyphs/NumberedKeySignatureGlyph';
import type { Settings } from '@coderline/alphatab/Settings';

/**
 * @internal
 */
export class NumberedBarKeySignatureEffectInfo extends EffectInfo {
    public get notationElement(): NotationElement {
        return NotationElement.EffectNumberedNotationKeySignature;
    }

    public get hideOnMultiTrack(): boolean {
        return false;
    }

    public get canShareBand(): boolean {
        return true;
    }

    public get sizingMode(): EffectBarGlyphSizing {
        return EffectBarGlyphSizing.FullBar;
    }

    public shouldCreateGlyph(_settings: Settings, beat: Beat): boolean {
        const bar = beat.voice.bar;
        return !bar.previousBar || bar.keySignature !== bar.previousBar.keySignature;
    }

    public createNewGlyph(renderer: BarRendererBase, _beat: Beat): EffectGlyph {
        return new NumberedKeySignatureGlyph(0, 0, renderer.bar.keySignature, renderer.bar.keySignatureType);
    }

    public canExpand(_from: Beat, _to: Beat): boolean {
        return false;
    }
}
