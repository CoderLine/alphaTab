import type { Beat } from '@coderline/alphatab/model/Beat';
import { Fingers } from '@coderline/alphatab/model/Fingers';
import type { Note } from '@coderline/alphatab/model/Note';
import { FingeringMode, NotationElement } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, type EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { FingeringGroupGlyph } from '@coderline/alphatab/rendering/glyphs/FingeringGroupGlyph';
import { MusicFontGlyph } from '@coderline/alphatab/rendering/glyphs/MusicFontGlyph';

/**
 * @internal
 */
export const fingeringEffectInfo: EffectInfo = {
    effectId: 'EffectFingering',
    notationElement: NotationElement.EffectFingering,
    hideOnMultiTrack: false,
    sizingMode: EffectBarGlyphSizing.SingleOnBeat,
    shouldCreateGlyph: (renderer: BarRendererBase, beat: Beat): boolean => {
        const settings = renderer.settings;
        if (
            beat.voice.index !== 0 ||
            beat.isRest ||
            (settings.notation.fingeringMode !== FingeringMode.SingleNoteEffectBand &&
                settings.notation.fingeringMode !== FingeringMode.SingleNoteEffectBandForcePiano)
        ) {
            return false;
        }
        if (beat.notes.length !== 1) {
            return false;
        }
        return beat.notes[0].isFingering;
    },
    createNewGlyph: (renderer: BarRendererBase, beat: Beat): EffectGlyph => {
        let finger: Fingers = Fingers.Unknown;
        let isLeft: boolean = false;
        const note: Note = beat.notes[0];
        if (note.leftHandFinger !== Fingers.Unknown) {
            finger = note.leftHandFinger;
            isLeft = true;
        } else if (note.rightHandFinger !== Fingers.Unknown) {
            finger = note.rightHandFinger;
        }
        const s = FingeringGroupGlyph.fingerToMusicFontSymbol(renderer.settings, beat, finger, isLeft);
        const g = new MusicFontGlyph(0, 0, 1, s);
        g.center = true;
        g.renderer = renderer;
        g.doLayout();
        g.offsetY = renderer.smuflMetrics.glyphTop.get(g.symbol)!;
        return g;
    },
    canExpand: (_from: Beat, _to: Beat): boolean => true,
    placementCategory: EffectBandPlacementCategory.NoteAttached
};
