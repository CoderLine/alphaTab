import type { Beat } from '@coderline/alphatab/model/Beat';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, type EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { LineRangedGlyph } from '@coderline/alphatab/rendering/glyphs/LineRangedGlyph';

/**
 * @internal
 */
export const letRingEffectInfo: EffectInfo = {
    effectId: 'EffectLetRing',
    notationElement: NotationElement.EffectLetRing,
    hideOnMultiTrack: false,
    sizingMode: EffectBarGlyphSizing.GroupedOnBeat,
    shouldCreateGlyph: (_renderer: BarRendererBase, beat: Beat): boolean => {
        return beat.isLetRing;
    },
    createNewGlyph: (_renderer: BarRendererBase, _beat: Beat): EffectGlyph => {
        return new LineRangedGlyph('LetRing', NotationElement.EffectLetRing);
    },
    canExpand: (_from: Beat, _to: Beat): boolean => true,
    placementCategory: EffectBandPlacementCategory.Span
};
