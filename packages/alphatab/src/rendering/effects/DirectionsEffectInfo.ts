import type { Beat } from '@coderline/alphatab/model/Beat';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import { DirectionsContainerGlyph } from '@coderline/alphatab/rendering/glyphs/DirectionsContainerGlyph';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import type { Settings } from '@coderline/alphatab/Settings';

/**
 * @internal
 */
export class DirectionsEffectInfo extends EffectInfo {
    public get notationElement(): NotationElement {
        return NotationElement.EffectDirections;
    }

    public get hideOnMultiTrack(): boolean {
        return true;
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
        // Each bar's directions are independent — no cross-bar chain to share a y.
        return false;
    }
    public override get placementCategory(): EffectBandPlacementCategory {
        return EffectBandPlacementCategory.SystemMarker;
    }
}
