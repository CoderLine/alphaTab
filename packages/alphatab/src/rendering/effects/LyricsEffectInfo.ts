import type { Beat } from '@coderline/alphatab/model/Beat';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import { TextAlign } from '@coderline/alphatab/platform/ICanvas';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, type EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { LyricsGlyph } from '@coderline/alphatab/rendering/glyphs/LyricsGlyph';
import { OverlayRodPolicy } from '@coderline/alphatab/rendering/OverlayRodPolicy';

/**
 * @internal
 */
export const lyricsEffectInfo: EffectInfo = {
    effectId: 'EffectLyrics',
    notationElement: NotationElement.EffectLyrics,
    hideOnMultiTrack: false,
    sizingMode: EffectBarGlyphSizing.SingleOnBeat,
    placementCategory: EffectBandPlacementCategory.HorizontalRow,
    overlayRodPolicy: OverlayRodPolicy.Centered,
    shouldCreateGlyph: (_renderer: BarRendererBase, beat: Beat): boolean => {
        return !!beat.lyrics;
    },
    createNewGlyph: (renderer: BarRendererBase, beat: Beat): EffectGlyph => {
        return new LyricsGlyph(
            0,
            0,
            beat.lyrics!,
            renderer.resources.elementFonts.get(NotationElement.EffectLyrics)!,
            TextAlign.Center
        );
    },
    canExpand: (_from: Beat, _to: Beat): boolean => true
};
