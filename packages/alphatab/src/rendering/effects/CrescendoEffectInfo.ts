import type { Beat } from '@coderline/alphatab/model/Beat';
import { CrescendoType } from '@coderline/alphatab/model/CrescendoType';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, type EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import { CrescendoGlyph } from '@coderline/alphatab/rendering/glyphs/CrescendoGlyph';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';

/**
 * @internal
 */
export const crescendoEffectInfo: EffectInfo = {
    effectId: 'EffectCrescendo',
    notationElement: NotationElement.EffectCrescendo,
    hideOnMultiTrack: false,
    sizingMode: EffectBarGlyphSizing.GroupedOnBeatToEnd,
    shouldCreateGlyph: (_renderer: BarRendererBase, beat: Beat): boolean => {
        return beat.crescendo !== CrescendoType.None;
    },
    createNewGlyph: (_renderer: BarRendererBase, beat: Beat): EffectGlyph => {
        return new CrescendoGlyph(0, 0, beat.crescendo);
    },
    canExpand: (from: Beat, to: Beat): boolean => {
        return from.crescendo === to.crescendo;
    },
    placementCategory: EffectBandPlacementCategory.Span
}
