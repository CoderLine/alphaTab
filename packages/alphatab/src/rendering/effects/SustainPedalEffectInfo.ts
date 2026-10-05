import type { Beat } from '@coderline/alphatab/model/Beat';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, type EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { SustainPedalGlyph } from '@coderline/alphatab/rendering/glyphs/SustainPedalGlyph';

/**
 * @internal
 */
export const sustainPedalEffectInfo: EffectInfo = {
    effectId: 'EffectSustainPedal',
    notationElement: NotationElement.EffectSustainPedal,
    hideOnMultiTrack: false,
    sizingMode: EffectBarGlyphSizing.FullBar,
    shouldCreateGlyph: (_renderer: BarRendererBase, beat: Beat): boolean => {
        return beat.voice.index === 0 && beat.index === 0 && beat.voice.bar.sustainPedals.length > 0;
    },
    createNewGlyph: (_renderer: BarRendererBase, _beat: Beat): EffectGlyph => {
        return new SustainPedalGlyph();
    },
    canExpand: (_from: Beat, _to: Beat): boolean => true,
    placementCategory: EffectBandPlacementCategory.Span
};
