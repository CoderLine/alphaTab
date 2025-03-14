import { Beat } from '@src/model/Beat';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@src/rendering/EffectBarGlyphSizing';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { EffectBarRendererInfo } from '@src/rendering/EffectBarRendererInfo';
import { Settings } from '@src/Settings';
import { NotationElement } from '@src/NotationSettings';
import { DirectionsContainerGlyph } from '../glyphs/DirectionsContainerGlyph';

export class DirectionsEffectInfo extends EffectBarRendererInfo {
    public get notationElement(): NotationElement {
        return NotationElement.EffectDirections;
    }

    public get hideOnMultiTrack(): boolean {
        return true;
    }

    public get canShareBand(): boolean {
        return false;
    }

    public get sizingMode(): EffectBarGlyphSizing {
        return EffectBarGlyphSizing.FullBar;
    }

    public shouldCreateGlyph(settings: Settings, beat: Beat): boolean {
        return (
            beat.voice.index === 0 &&
            beat.index === 0 &&
            beat.voice.bar.masterBar.directions !== null &&
            beat.voice.bar.masterBar.directions.size > 0
        );
    }

    public createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new DirectionsContainerGlyph(0, 0, beat.voice.bar.masterBar.directions!);
    }

    public canExpand(from: Beat, to: Beat): boolean {
        return true;
    }
}
