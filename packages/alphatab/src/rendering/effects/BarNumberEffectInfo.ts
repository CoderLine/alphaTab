import type { Beat } from '@coderline/alphatab/model/Beat';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, type EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import { BarNumberGlyph } from '@coderline/alphatab/rendering/glyphs/BarNumberGlyph';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import type { LineBarRenderer } from '@coderline/alphatab/rendering/LineBarRenderer';

/**
 * @internal
 */
export const barNumberEffectInfo: EffectInfo = {
    effectId: 'BarNumber',
    notationElement: NotationElement.BarNumber,
    hideOnMultiTrack: true,
    sizingMode: EffectBarGlyphSizing.SingleStartBar,
    shouldCreateGlyph: (renderer: BarRendererBase, beat: Beat): boolean => {
        return beat.voice.index === 0 && beat.index === 0 && (renderer as LineBarRenderer).shouldCreateBarNumber();
    },
    createNewGlyph: (_renderer: BarRendererBase, beat: Beat): EffectGlyph => {
        const masterBar = beat.voice.bar.masterBar;
        return new BarNumberGlyph(0, 0, masterBar.barNumberText);
    },
    canExpand: (_from: Beat, _to: Beat): boolean => false,
    placementCategory: EffectBandPlacementCategory.NoteAttached,
    // A bar number sits at the barline over the clef/key/time; those are fixed
    // fixtures already accounted for in the staff's vertical layout, so the
    // number is placed against content only and never shoved up by them.
    ignoresStructuralHeader: true
};
