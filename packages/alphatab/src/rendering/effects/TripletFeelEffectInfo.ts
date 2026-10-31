import type { Beat } from '@coderline/alphatab/model/Beat';
import { TripletFeel } from '@coderline/alphatab/model/TripletFeel';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, type EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { TripletFeelGlyph } from '@coderline/alphatab/rendering/glyphs/TripletFeelGlyph';

/**
 * @internal
 */
export const tripletFeelEffectInfo: EffectInfo = {
    effectId: 'EffectTripletFeel',
    notationElement: NotationElement.EffectTripletFeel,
    hideOnMultiTrack: true,
    sizingMode: EffectBarGlyphSizing.SinglePreBeat,
    shouldCreateGlyph: (_renderer: BarRendererBase, beat: Beat): boolean => {
        const masterBar = beat.voice.bar.masterBar;
        const isFirstBeat = beat.voice.bar.staff.index === 0 && beat.voice.index === 0 && beat.index === 0;
        return (
            isFirstBeat &&
            ((masterBar.index === 0 && masterBar.tripletFeel !== TripletFeel.NoTripletFeel) ||
                (masterBar.index > 0 && masterBar.tripletFeel !== masterBar.previousMasterBar!.tripletFeel))
        );
    },
    createNewGlyph: (_renderer: BarRendererBase, beat: Beat): EffectGlyph => {
        return new TripletFeelGlyph(beat.voice.bar.masterBar.tripletFeel);
    },
    canExpand: (_from: Beat, _to: Beat): boolean => true,
    placementCategory: EffectBandPlacementCategory.SystemMarker
};
