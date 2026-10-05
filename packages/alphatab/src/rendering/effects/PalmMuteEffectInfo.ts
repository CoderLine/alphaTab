import type { Beat } from '@coderline/alphatab/model/Beat';
import type { Note } from '@coderline/alphatab/model/Note';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, type EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import { createNoteShouldCreateGlyph } from '@coderline/alphatab/rendering/effects/NoteEffectInfoBase';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { LineRangedGlyph } from '@coderline/alphatab/rendering/glyphs/LineRangedGlyph';

/**
 * @internal
 */
export const palmMuteEffectInfo: EffectInfo = {
    effectId: 'EffectPalmMute',
    notationElement: NotationElement.EffectPalmMute,
    hideOnMultiTrack: false,
    sizingMode: EffectBarGlyphSizing.GroupedOnBeat,
    shouldCreateGlyph: createNoteShouldCreateGlyph((note: Note): boolean => note.isPalmMute),
    createNewGlyph: (_renderer: BarRendererBase, _beat: Beat): EffectGlyph =>
        new LineRangedGlyph('P.M.', NotationElement.EffectPalmMute),
    canExpand: (_from: Beat, _to: Beat): boolean => true,
    placementCategory: EffectBandPlacementCategory.Span
};
