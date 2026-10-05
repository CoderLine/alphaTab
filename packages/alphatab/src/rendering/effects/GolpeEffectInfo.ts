import type { Beat } from '@coderline/alphatab/model/Beat';
import { GolpeType } from '@coderline/alphatab/model/GolpeType';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, type EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { GuitarGolpeGlyph } from '@coderline/alphatab/rendering/glyphs/GuitarGolpeGlyph';

/**
 * @internal
 */
export function createGolpeEffectInfo(type: GolpeType): EffectInfo {
    return {
        effectId: `EffectGolpe.${GolpeType[type]}`,
        notationElement: NotationElement.EffectGolpe,
        hideOnMultiTrack: false,
        sizingMode: EffectBarGlyphSizing.SingleOnBeat,
        shouldCreateGlyph: (_renderer: BarRendererBase, beat: Beat): boolean => {
            return beat.golpe === type;
        },
        createNewGlyph: (_renderer: BarRendererBase, _beat: Beat): EffectGlyph => {
            return new GuitarGolpeGlyph(0, 0, true);
        },
        canExpand: (_from: Beat, _to: Beat): boolean => false,
        placementCategory: EffectBandPlacementCategory.NoteAttached
    };
}
