import type { Beat } from '@coderline/alphatab/model/Beat';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, type EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import { AlternateEndingsGlyph } from '@coderline/alphatab/rendering/glyphs/AlternateEndingsGlyph';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';

/**
 * @internal
 */
export const alternateEndingsEffectInfo: EffectInfo = {
    effectId: 'EffectAlternateEndings',
    notationElement: NotationElement.EffectAlternateEndings,
    hideOnMultiTrack: true,
    sizingMode:EffectBarGlyphSizing.FullBar,
    shouldCreateGlyph: (_renderer: BarRendererBase, beat: Beat): boolean => {
        return beat.voice.index === 0 && beat.index === 0 && beat.voice.bar.masterBar.alternateEndings !== 0;
    },
    createNewGlyph: (_renderer: BarRendererBase, beat: Beat): EffectGlyph => {
        const masterBar = beat.voice.bar.masterBar;
        const openLine =
            masterBar.previousMasterBar === null ||
            masterBar.alternateEndings !== masterBar.previousMasterBar!.alternateEndings;
        let closeLine =
            masterBar.isRepeatEnd ||
            masterBar.nextMasterBar === null ||
            masterBar.alternateEndings !== masterBar.nextMasterBar!.alternateEndings;

        if (!masterBar.repeatGroup.closings.some(c => c.index >= masterBar.index)) {
            closeLine = false;
        }

        const indent =
            masterBar.previousMasterBar !== null &&
            masterBar.alternateEndings !== masterBar.previousMasterBar!.alternateEndings &&
            masterBar.previousMasterBar!.alternateEndings > 0;

        return new AlternateEndingsGlyph(0, 0, masterBar.alternateEndings, openLine, closeLine, indent);
    },
    canExpand: (_from: Beat, _to: Beat): boolean => {
        return true;
    },
    // Voltas share one baseline across the system (Gould Ch.11).
    placementCategory: EffectBandPlacementCategory.HorizontalRow
}
