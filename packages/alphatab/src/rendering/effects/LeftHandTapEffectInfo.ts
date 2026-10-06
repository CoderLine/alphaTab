import type { Beat } from '@coderline/alphatab/model/Beat';
import type { Note } from '@coderline/alphatab/model/Note';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, type EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import { createNoteShouldCreateGlyph } from '@coderline/alphatab/rendering/effects/NoteEffectInfoBase';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { LeftHandTapGlyph } from '@coderline/alphatab/rendering/glyphs/LeftHandTapGlyph';

/**
 * @internal
 */
export const leftHandTapEffectInfo: EffectInfo = {
    effectId: 'EffectTap',
    notationElement: NotationElement.EffectTap,
    hideOnMultiTrack: false,
    sizingMode: EffectBarGlyphSizing.SingleOnBeat,
    shouldCreateGlyph: createNoteShouldCreateGlyph((note: Note): boolean => note.isLeftHandTapped),
    createNewGlyph: (_renderer: BarRendererBase, _beat: Beat): EffectGlyph => new LeftHandTapGlyph(),
    canExpand: (_from: Beat, _to: Beat): boolean => true,
    placementCategory: EffectBandPlacementCategory.NoteAttached
};
