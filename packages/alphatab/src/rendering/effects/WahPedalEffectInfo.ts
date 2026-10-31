import type { Beat } from '@coderline/alphatab/model/Beat';
import { WahPedal } from '@coderline/alphatab/model/WahPedal';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, type EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { WahPedalGlyph } from '@coderline/alphatab/rendering/glyphs/WahPedalGlyph';

/**
 * @internal
 */
export const wahPedalEffectInfo: EffectInfo = {
    effectId: 'EffectWahPedal',
    notationElement: NotationElement.EffectWahPedal,
    hideOnMultiTrack: false,
    sizingMode: EffectBarGlyphSizing.SingleOnBeat,
    shouldCreateGlyph: (_renderer: BarRendererBase, beat: Beat): boolean => {
        return beat.wahPedal !== WahPedal.None;
    },
    createNewGlyph: (_renderer: BarRendererBase, beat: Beat): EffectGlyph => {
        return new WahPedalGlyph(beat.wahPedal);
    },
    canExpand: (_from: Beat, _to: Beat): boolean => false,
    placementCategory: EffectBandPlacementCategory.Span
};
