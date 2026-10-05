import type { Beat } from '@coderline/alphatab/model/Beat';
import type { Note } from '@coderline/alphatab/model/Note';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, type EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import { createNoteShouldCreateGlyph } from '@coderline/alphatab/rendering/effects/NoteEffectInfoBase';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { TrillGlyph } from '@coderline/alphatab/rendering/glyphs/TrillGlyph';

/**
 * @internal
 */
export const trillEffectInfo: EffectInfo = {
    effectId: 'EffectTrill',
    notationElement: NotationElement.EffectTrill,
    hideOnMultiTrack: false,
    sizingMode: EffectBarGlyphSizing.GroupedOnBeatToEnd,
    shouldCreateGlyph: createNoteShouldCreateGlyph((note: Note): boolean => note.isTrill),
    createNewGlyph: (_renderer: BarRendererBase, _beat: Beat): EffectGlyph => new TrillGlyph(0, 0),
    canExpand: (_from: Beat, _to: Beat): boolean => true,
    placementCategory: EffectBandPlacementCategory.Span
};
