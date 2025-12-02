import type { Beat } from '@coderline/alphatab/model/Beat';
import { TripletFeel } from '@coderline/alphatab/model/TripletFeel';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { TripletFeelGlyph } from '@coderline/alphatab/rendering/glyphs/TripletFeelGlyph';
import { EffectBarRendererInfo } from '@coderline/alphatab/rendering/EffectBarRendererInfo';
import type { Settings } from '@coderline/alphatab/Settings';
import { NotationElement } from '@coderline/alphatab/NotationSettings';

/**
 * @internal
 */
export class TripletFeelEffectInfo extends EffectBarRendererInfo {
    public get notationElement(): NotationElement {
        return NotationElement.EffectTripletFeel;
    }

    public get hideOnMultiTrack(): boolean {
        return true;
    }

    public get canShareBand(): boolean {
        return false;
    }

    public get sizingMode(): EffectBarGlyphSizing {
        return EffectBarGlyphSizing.SinglePreBeat;
    }

    public shouldCreateGlyph(_settings: Settings, beat: Beat): boolean {
        return (
            beat.index === 0 &&
            ((beat.voice.bar.masterBar.index === 0 &&
                beat.voice.bar.masterBar.tripletFeel !== TripletFeel.NoTripletFeel) ||
                (beat.voice.bar.masterBar.index > 0 &&
                    beat.voice.bar.masterBar.tripletFeel !== beat.voice.bar.masterBar.previousMasterBar!.tripletFeel))
        );
    }

    public createNewGlyph(_renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new TripletFeelGlyph(beat.voice.bar.masterBar.tripletFeel);
    }

    public canExpand(_from: Beat, _to: Beat): boolean {
        return true;
    }
}
