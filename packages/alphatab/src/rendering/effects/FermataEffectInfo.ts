import type { Beat } from '@coderline/alphatab/model/Beat';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, type EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { FermataGlyph } from '@coderline/alphatab/rendering/glyphs/FermataGlyph';

/**
 * @internal
 */
export const fermataEffectInfo: EffectInfo = {
    effectId: 'EffectFermata',
    notationElement: NotationElement.EffectFermata,
    hideOnMultiTrack: false,
    sizingMode: EffectBarGlyphSizing.SingleOnBeat,
    // Centered around onTimeX; needs its half-width reserved in the beat spring.
    contributesToBeatSpacing: true,
    shouldCreateGlyph: (_renderer: BarRendererBase, beat: Beat): boolean => {
        return beat.voice.index === 0 && !!beat.fermata;
    },
    createNewGlyph: (_renderer: BarRendererBase, beat: Beat): EffectGlyph => {
        return new FermataGlyph(0, 0, beat.fermata!.type);
    },
    canExpand: (_from: Beat, _to: Beat): boolean => true,
    placementCategory: EffectBandPlacementCategory.NoteAttached
};
