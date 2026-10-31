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
export function createSlightNoteVibratoEffectInfo(hideOnTiedBend: boolean): EffectInfo {
    return {
        effectId: 'EffectSlightNoteVibrato',
        notationElement: NotationElement.EffectSlightNoteVibrato,
        hideOnMultiTrack: false,
        sizingMode: EffectBarGlyphSizing.GroupedOnBeatToEnd,
        // for tied bends ending in a vibrato, the vibrato is drawn by the TabBendGlyph for proper alignment
        shouldCreateGlyph: createNoteShouldCreateGlyph((note: Note): boolean => {
            let hasVibrato =
                note.vibrato === VibratoType.Slight ||
                (note.isTieDestination && note.tieOrigin!.vibrato === VibratoType.Slight);

            if (hideOnTiedBend && hasVibrato && note.isTieDestination && note.tieOrigin!.hasBend) {
                hasVibrato = false;
            }
            return hasVibrato;
        }),
        createNewGlyph: (_renderer: BarRendererBase, _beat: Beat): EffectGlyph =>
            new NoteVibratoGlyph(0, 0, VibratoType.Slight),
        canExpand: (_from: Beat, _to: Beat): boolean => true,
        placementCategory: EffectBandPlacementCategory.Span
    };
}
