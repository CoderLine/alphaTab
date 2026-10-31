import type { Beat } from '@coderline/alphatab/model/Beat';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, type EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import { BeatTimerGlyph } from '@coderline/alphatab/rendering/glyphs/BeatTimerGlyph';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';

/**
 * @internal
 */
export const beatTimerEffectInfo: EffectInfo = {
    effectId: 'EffectBeatTimer',
    notationElement: NotationElement.EffectBeatTimer,
    hideOnMultiTrack: true,
    sizingMode: EffectBarGlyphSizing.SingleOnBeat,
    shouldCreateGlyph: (_renderer: BarRendererBase, beat: Beat): boolean => {
        return beat.showTimer;
    },

    createNewGlyph: (_renderer: BarRendererBase, beat: Beat): EffectGlyph => {
        return new BeatTimerGlyph(beat.timer ?? 0);
    },
    canExpand: (_from: Beat, _to: Beat): boolean => {
        return true;
    },
    placementCategory: EffectBandPlacementCategory.SystemMarker
};
