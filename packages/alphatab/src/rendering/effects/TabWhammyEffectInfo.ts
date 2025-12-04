import type { Beat } from '@coderline/alphatab/model/Beat';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import type { EffectBand } from '@coderline/alphatab/rendering/EffectBand';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { TabWhammyBarGlyph } from '@coderline/alphatab/rendering/glyphs/TabWhammyBarGlyph';
import type { Settings } from '@coderline/alphatab/Settings';

/**
 * @internal
 */
export class TabWhammyEffectInfo extends EffectInfo {
    public get notationElement(): NotationElement {
        return NotationElement.EffectWhammyBarLine;
    }

    public get hideOnMultiTrack(): boolean {
        return false;
    }

    public get canShareBand(): boolean {
        return false;
    }

    public get sizingMode(): EffectBarGlyphSizing {
        return EffectBarGlyphSizing.GroupedOnBeatToEnd;
    }

    public shouldCreateGlyph(_settings: Settings, beat: Beat): boolean {
        return beat.hasWhammyBar;
    }

    public createNewGlyph(_renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new TabWhammyBarGlyph(beat);
    }

    public canExpand(_from: Beat, to: Beat): boolean {
        return to.hasWhammyBar;
    }

    public override finalizeBand(band: EffectBand): void {
        let top = 0;
        let bottom = 0;
        for (const g of band.iterateGlyphs()) {
            const tb = g as TabWhammyBarGlyph;
            if (tb.topOffset > top) {
                top = tb.topOffset;
            }
            if (tb.bottomOffset > bottom) {
                bottom = tb.bottomOffset;
            }
        }

        for (const g of band.iterateGlyphs()) {
            const tb = g as TabWhammyBarGlyph;
            tb.topOffset = top;
            tb.bottomOffset = bottom;
            tb.height = top + bottom;
        }
        band.slot!.shared.height = top + bottom;
    }
}
