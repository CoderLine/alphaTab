import type { Beat } from '@coderline/alphatab/model/Beat';
import { Ottavia } from '@coderline/alphatab/model/Ottavia';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, type EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { OttavaGlyph } from '@coderline/alphatab/rendering/glyphs/OttavaGlyph';

/**
 * @internal
 */
export function createOttaviaEffectInfo(aboveStaff: boolean): EffectInfo {
    return {
        effectId: `ottavia-${aboveStaff ? 'above' : 'below'}`,
        notationElement: NotationElement.EffectOttavia,
        hideOnMultiTrack: false,
        sizingMode: EffectBarGlyphSizing.GroupedOnBeat,
        shouldCreateGlyph: (_renderer: BarRendererBase, beat: Beat): boolean => {
            switch (beat.ottava) {
                case Ottavia._15ma:
                    return aboveStaff;
                case Ottavia._8va:
                    return aboveStaff;
                case Ottavia._8vb:
                    return !aboveStaff;
                case Ottavia._15mb:
                    return !aboveStaff;
            }
            return false;
        },
        createNewGlyph: (_renderer: BarRendererBase, beat: Beat): EffectGlyph => {
            return new OttavaGlyph(beat.ottava, aboveStaff);
        },
        canExpand: (from: Beat, to: Beat): boolean => {
            return from.ottava === to.ottava;
        },
        placementCategory: EffectBandPlacementCategory.Span
    };
}
