import type { Beat } from '@coderline/alphatab/model/Beat';
import { NoteOrnament } from '@coderline/alphatab/model/NoteOrnament';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, type EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { NoteOrnamentGlyph } from '@coderline/alphatab/rendering/glyphs/NoteOrnamentGlyph';

/**
 * @internal
 */
export const noteOrnamentEffectInfo: EffectInfo = {
    effectId: 'EffectNoteOrnament',
    notationElement: NotationElement.EffectNoteOrnament,
    hideOnMultiTrack: false,
    sizingMode: EffectBarGlyphSizing.SingleOnBeat,
    contributesToBeatSpacing: true,
    shouldCreateGlyph: (_renderer: BarRendererBase, beat: Beat): boolean => {
        return beat.notes.some(n => n.ornament !== NoteOrnament.None);
    },
    createNewGlyph: (_renderer: BarRendererBase, beat: Beat): EffectGlyph => {
        return new NoteOrnamentGlyph(beat.notes.find(n => n.ornament !== NoteOrnament.None)!.ornament);
    },
    canExpand: (_from: Beat, _to: Beat): boolean => false,
    placementCategory: EffectBandPlacementCategory.NoteAttached
};
