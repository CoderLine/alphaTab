import type { Beat } from '@coderline/alphatab/model/Beat';
import { LyricsPlacement } from '@coderline/alphatab/model/RenderStylesheet';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import { TextAlign } from '@coderline/alphatab/platform/ICanvas';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, type EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { LyricsGlyph } from '@coderline/alphatab/rendering/glyphs/LyricsGlyph';
import { OverlayRodPolicy } from '@coderline/alphatab/rendering/OverlayRodPolicy';

/**
 * Creates the lyrics effect for one side of the staff. Glyphs are created only on the
 * cascade-primary staff (standard notation, else the next shown one) and only for the
 * `lyricsPlacement` of the score stylesheet.
 * @internal
 */
function createLyricsEffectInfo(placement: LyricsPlacement): EffectInfo {
    return {
        effectId: placement === LyricsPlacement.Above ? 'EffectLyricsAbove' : 'EffectLyrics',
        notationElement: NotationElement.EffectLyrics,
        hideOnMultiTrack: false,
        sizingMode: EffectBarGlyphSizing.SingleOnBeat,
        placementCategory: EffectBandPlacementCategory.HorizontalRow,
        overlayRodPolicy: OverlayRodPolicy.Centered,
        shouldCreateGlyph: (renderer: BarRendererBase, beat: Beat): boolean => {
            return (
                !!beat.lyrics &&
                beat.voice.bar.staff.track.score.stylesheet.lyricsPlacement === placement &&
                renderer.staff!.isCascadePrimary
            );
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
}

/**
 * @internal
 */
export const lyricsAboveEffectInfo: EffectInfo = createLyricsEffectInfo(LyricsPlacement.Above);

/**
 * @internal
 */
export const lyricsBelowEffectInfo: EffectInfo = createLyricsEffectInfo(LyricsPlacement.Below);
