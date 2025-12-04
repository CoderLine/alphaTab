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

    // this logic below handles the vertical alignment of whammys so that the "0" value is center aligned
    // within the staff
    // the solution is still a bit hacky though.
    public static readonly offsetSharedDataKey: string = 'tab.whammy.offset';

    public override onAlignGlyphs(band: EffectBand): void {
        // re-register the sizes so they are available during finalization later
        const info = band.renderer.staff.getSharedLayoutData<[number, number]>(
            TabWhammyEffectInfo.offsetSharedDataKey,
            [0, 0]
        );
        band.renderer.staff.setSharedLayoutData(TabWhammyEffectInfo.offsetSharedDataKey, info);
        for (const g of band.iterateAllGlyphs()) {
            const tb = g as TabWhammyBarGlyph;
            if (tb.originalTopOffset > info[0]) {
                info[0] = tb.originalTopOffset;
            }
            if (tb.originalBottomOffset > info[1]) {
                info[1] = tb.originalBottomOffset;
            }
        }
    }

    public override finalizeBand(band: EffectBand): void {
        const info = band.renderer.staff.getSharedLayoutData<[number, number]>(
            TabWhammyEffectInfo.offsetSharedDataKey,
            [0, 0]
        );
        const top = info[0];
        const bottom = info[1];
        for (const g of band.iterateAllGlyphs()) {
            const tb = g as TabWhammyBarGlyph;
            tb.topOffset = top;
            tb.bottomOffset = bottom;
            tb.height = top + bottom;
        }
        band.slot!.shared.height = top + bottom;
        band.height = top + bottom;
        band.originalHeight = top + bottom;
    }
}
