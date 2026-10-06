import type { Beat } from '@coderline/alphatab/model/Beat';
import { FadeType } from '@coderline/alphatab/model/FadeType';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, type EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { FadeGlyph } from '@coderline/alphatab/rendering/glyphs/FadeGlyph';

/**
 * @internal
 */
export const fadeEffectInfo: EffectInfo = {
    effectId: 'EffectFadeIn',
    notationElement: NotationElement.EffectFadeIn,
    hideOnMultiTrack: false,
    sizingMode: EffectBarGlyphSizing.SingleOnBeat,
    shouldCreateGlyph: (_renderer: BarRendererBase, beat: Beat): boolean => {
        return beat.fade !== FadeType.None;
    },
    createNewGlyph: (_renderer: BarRendererBase, beat: Beat): EffectGlyph => {
        return new FadeGlyph(beat.fade);
    },
    canExpand: (_from: Beat, _to: Beat): boolean => true,
    placementCategory: EffectBandPlacementCategory.Span
};
