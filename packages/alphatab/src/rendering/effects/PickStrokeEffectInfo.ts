import type { Beat } from '@coderline/alphatab/model/Beat';
import { PickStroke } from '@coderline/alphatab/model/PickStroke';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, type EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { PickStrokeGlyph } from '@coderline/alphatab/rendering/glyphs/PickStrokeGlyph';

/**
 * @internal
 */
export const pickStrokeEffectInfo: EffectInfo = {
    effectId: 'EffectPickStroke',
    notationElement: NotationElement.EffectPickStroke,
    hideOnMultiTrack: false,
    sizingMode: EffectBarGlyphSizing.SingleOnBeat,
    shouldCreateGlyph: (_renderer: BarRendererBase, beat: Beat): boolean => {
        return beat.pickStroke !== PickStroke.None;
    },
    createNewGlyph: (_renderer: BarRendererBase, beat: Beat): EffectGlyph => {
        return new PickStrokeGlyph(0, 0, beat.pickStroke);
    },
    canExpand: (_from: Beat, _to: Beat): boolean => true,
    placementCategory: EffectBandPlacementCategory.NoteAttached
};
