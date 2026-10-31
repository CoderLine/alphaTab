import type { Beat } from '@coderline/alphatab/model/Beat';
import { VibratoType } from '@coderline/alphatab/model/VibratoType';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, type EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import { BeatVibratoGlyph } from '@coderline/alphatab/rendering/glyphs/BeatVibratoGlyph';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';

/**
 * @internal
 */
export const slightBeatVibratoEffectInfo: EffectInfo = {
    effectId: 'EffectSlightBeatVibrato',
    notationElement: NotationElement.EffectSlightBeatVibrato,
    hideOnMultiTrack: false,
    sizingMode: EffectBarGlyphSizing.GroupedOnBeatToEnd,
    shouldCreateGlyph: (_renderer: BarRendererBase, beat: Beat): boolean => {
        return beat.vibrato === VibratoType.Slight;
    },
    createNewGlyph: (_renderer: BarRendererBase, _beat: Beat): EffectGlyph => {
        return new BeatVibratoGlyph(0, 0, VibratoType.Slight);
    },
    canExpand: (_from: Beat, _to: Beat): boolean => true,
    placementCategory: EffectBandPlacementCategory.Span
};
