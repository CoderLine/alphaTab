import type { Beat } from '@coderline/alphatab/model/Beat';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, type EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import { BarTempoGlyph } from '@coderline/alphatab/rendering/glyphs/BarTempoGlyph';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';

/**
 * @internal
 */
export const tempoEffectInfo: EffectInfo = {
    effectId: 'EffectTempo',
    notationElement: NotationElement.EffectTempo,
    hideOnMultiTrack: true,
    sizingMode: EffectBarGlyphSizing.SinglePreBeat,
    shouldCreateGlyph: (_renderer: BarRendererBase, beat: Beat): boolean => {
        return (
            beat.voice.bar.staff.index === 0 &&
            beat.voice.index === 0 &&
            beat.index === 0 &&
            beat.voice.bar.masterBar.tempoAutomations.some(t => t.isVisible)
        );
    },
    createNewGlyph: (_renderer: BarRendererBase, beat: Beat): EffectGlyph => {
        return new BarTempoGlyph(beat.voice.bar.masterBar.tempoAutomations.filter(a => a.isVisible));
    },
    canExpand: (_from: Beat, _to: Beat): boolean => true,
    placementCategory: EffectBandPlacementCategory.SystemMarker
};
