import type { Beat } from '@coderline/alphatab/model/Beat';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { EffectBarRendererInfo } from '@coderline/alphatab/rendering/EffectBarRendererInfo';
import type { Settings } from '@coderline/alphatab/Settings';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import { DirectionsContainerGlyph } from '@coderline/alphatab/rendering/glyphs/DirectionsContainerGlyph';

/**
 * @internal
 */
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

    public shouldCreateGlyph(_settings: Settings, beat: Beat): boolean {
        return (
            beat.voice.index === 0 &&
            beat.index === 0 &&
            beat.voice.bar.masterBar.directions !== null &&
            beat.voice.bar.masterBar.directions.size > 0
        );
    }

    public createNewGlyph(_renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new DirectionsContainerGlyph(0, 0, beat.voice.bar.masterBar.directions!);
    }

    public canExpand(_from: Beat, _to: Beat): boolean {
        return true;
    }
}
