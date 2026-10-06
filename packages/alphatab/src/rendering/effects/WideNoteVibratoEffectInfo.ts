import type { Beat } from '@coderline/alphatab/model/Beat';
import type { Note } from '@coderline/alphatab/model/Note';
import { VibratoType } from '@coderline/alphatab/model/VibratoType';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, type EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import { createNoteShouldCreateGlyph } from '@coderline/alphatab/rendering/effects/NoteEffectInfoBase';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { NoteVibratoGlyph } from '@coderline/alphatab/rendering/glyphs/NoteVibratoGlyph';

/**
 * @internal
 */
export const wideNoteVibratoEffectInfo: EffectInfo = {
    effectId: 'EffectWideNoteVibrato',
    notationElement: NotationElement.EffectWideNoteVibrato,
    hideOnMultiTrack: false,
    sizingMode: EffectBarGlyphSizing.GroupedOnBeatToEnd,
    shouldCreateGlyph: createNoteShouldCreateGlyph(
        (note: Note): boolean =>
            note.vibrato === VibratoType.Wide || (note.isTieDestination && note.tieOrigin!.vibrato === VibratoType.Wide)
    ),
    createNewGlyph: (_renderer: BarRendererBase, _beat: Beat): EffectGlyph =>
        new NoteVibratoGlyph(0, 0, VibratoType.Wide),
    canExpand: (_from: Beat, _to: Beat): boolean => true,
    placementCategory: EffectBandPlacementCategory.Span
};
