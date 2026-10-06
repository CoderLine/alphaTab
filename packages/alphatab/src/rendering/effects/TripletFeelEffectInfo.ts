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
        return (
            beat.index === 0 &&
            ((beat.voice.bar.masterBar.index === 0 &&
                beat.voice.bar.masterBar.tripletFeel !== TripletFeel.NoTripletFeel) ||
                (beat.voice.bar.masterBar.index > 0 &&
                    beat.voice.bar.masterBar.tripletFeel !== beat.voice.bar.masterBar.previousMasterBar!.tripletFeel))
        );
    },
    createNewGlyph: (_renderer: BarRendererBase, beat: Beat): EffectGlyph => {
        return new TripletFeelGlyph(beat.voice.bar.masterBar.tripletFeel);
    },
    canExpand: (_from: Beat, _to: Beat): boolean => true,
    placementCategory: EffectBandPlacementCategory.SystemMarker
};
