import type { Beat } from '@coderline/alphatab/model/Beat';
import { WhammyType } from '@coderline/alphatab/model/WhammyType';
import { NotationElement, NotationMode } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, type EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { TabWhammyBarGlyph } from '@coderline/alphatab/rendering/glyphs/TabWhammyBarGlyph';

/**
 * @internal
 */
export const simpleDipWhammyBarEffectInfo: EffectInfo = {
    effectId: 'EffectWhammyBar.simpledip',
    notationElement: NotationElement.EffectWhammyBar,
    hideOnMultiTrack: false,
    sizingMode: EffectBarGlyphSizing.SingleOnBeat,
    shouldCreateGlyph: (renderer: BarRendererBase, beat: Beat): boolean => {
        return (
            renderer.settings.notation.notationMode === NotationMode.SongBook &&
            beat.hasWhammyBar &&
            beat.whammyBarType === WhammyType.Dip
        );
    },
    createNewGlyph: (_renderer: BarRendererBase, beat: Beat): EffectGlyph => {
        return new TabWhammyBarGlyph(beat);
    },
    canExpand: (_from: Beat, _to: Beat): boolean => true,
    placementCategory: EffectBandPlacementCategory.Span
};
