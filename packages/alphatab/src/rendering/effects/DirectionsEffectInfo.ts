import type { Beat } from '@coderline/alphatab/model/Beat';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, type EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import { DirectionsContainerGlyph } from '@coderline/alphatab/rendering/glyphs/DirectionsContainerGlyph';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';

/**
 * @internal
 */
export const directionsEffectInfo: EffectInfo = {
    effectId: 'EffectDirections',
    notationElement: NotationElement.EffectDirections,
    hideOnMultiTrack: true,
    sizingMode: EffectBarGlyphSizing.FullBar,
    shouldCreateGlyph: (_renderer: BarRendererBase, beat: Beat): boolean => {
        return (
            beat.voice.index === 0 &&
            beat.index === 0 &&
            beat.voice.bar.masterBar.directions !== null &&
            beat.voice.bar.masterBar.directions.size > 0
        );
    },
    createNewGlyph: (_renderer: BarRendererBase, beat: Beat): EffectGlyph => {
        return new DirectionsContainerGlyph(0, 0, beat.voice.bar.masterBar.directions!);
    },
    canExpand: (_from: Beat, _to: Beat): boolean => {
        // Each bar's directions are independent — no cross-bar chain to share a y.
        return false;
    },
    placementCategory: EffectBandPlacementCategory.SystemMarker
};
