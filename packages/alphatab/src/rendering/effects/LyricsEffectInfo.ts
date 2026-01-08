import type { Beat } from '@coderline/alphatab/model/Beat';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import { TextAlign } from '@coderline/alphatab/platform/ICanvas';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { LyricsGlyph } from '@coderline/alphatab/rendering/glyphs/LyricsGlyph';
import type { Settings } from '@coderline/alphatab/Settings';

/**
 * @internal
 */
export class LyricsEffectInfo extends EffectInfo {
    public get notationElement(): NotationElement {
        return NotationElement.EffectLyrics;
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

    public shouldCreateGlyph(_settings: Settings, beat: Beat): boolean {
        return !!beat.lyrics;
    }

    public createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new LyricsGlyph(
            0,
            0,
            beat.lyrics!,
            renderer.resources.elementFonts.get(NotationElement.EffectLyrics)!,
            TextAlign.Center
        );
    }

    public canExpand(_from: Beat, _to: Beat): boolean {
        return true;
    }
}
