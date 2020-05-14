import { Beat } from '@src/model/Beat';
import { TripletFeel } from '@src/model/TripletFeel';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@src/rendering/EffectBarGlyphSizing';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { TripletFeelGlyph } from '@src/rendering/glyphs/TripletFeelGlyph';
import { EffectBarRendererInfo } from '@src/rendering/EffectBarRendererInfo';
import { Settings } from '@src/Settings';
import { NotationElement } from '@src/NotationSettings';

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

    public shouldCreateGlyph(settings: Settings, beat: Beat): boolean {
        return (
            beat.index === 0 &&
            ((beat.voice.bar.masterBar.index === 0 &&
                beat.voice.bar.masterBar.tripletFeel !== TripletFeel.NoTripletFeel) ||
                (beat.voice.bar.masterBar.index > 0 &&
                    beat.voice.bar.masterBar.tripletFeel !== beat.voice.bar.masterBar.previousMasterBar!.tripletFeel))
        );
    }

    public createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new TripletFeelGlyph(beat.voice.bar.masterBar.tripletFeel);
    }

    public canExpand(from: Beat, to: Beat): boolean {
        return true;
    }
}
