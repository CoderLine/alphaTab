import type { Beat } from '@coderline/alphatab/model/Beat';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import { TextAlign } from '@coderline/alphatab/platform/ICanvas';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, type EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import { ChordDiagramGlyph } from '@coderline/alphatab/rendering/glyphs/ChordDiagramGlyph';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { TextGlyph } from '@coderline/alphatab/rendering/glyphs/TextGlyph';

/**
 * @internal
 */
export const chordsEffectInfo: EffectInfo = {
    effectId: 'EffectChordNames',
    notationElement: NotationElement.EffectChordNames,
    hideOnMultiTrack: false,
    sizingMode: EffectBarGlyphSizing.SingleOnBeat,
    shouldCreateGlyph: (_renderer: BarRendererBase, beat: Beat): boolean => {
        return beat.hasChord;
    },
    createNewGlyph: (renderer: BarRendererBase, beat: Beat): EffectGlyph => {
        const showDiagram = beat.voice.bar.staff.track.score.stylesheet.globalDisplayChordDiagramsInScore;
        return showDiagram
            ? new ChordDiagramGlyph(0, 0, beat.chord!, NotationElement.EffectChordNames, true)
            : new TextGlyph(
                  0,
                  0,
                  beat.chord!.name,
                  renderer.resources.elementFonts.get(NotationElement.EffectChordNames)!,
                  TextAlign.Center
              );
    },
    canExpand: (_from: Beat, _to: Beat): boolean => {
        return false;
    },
    placementCategory: EffectBandPlacementCategory.SystemMarker
};
