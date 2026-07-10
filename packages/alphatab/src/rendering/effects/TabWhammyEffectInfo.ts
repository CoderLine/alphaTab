import type { Beat } from '@coderline/alphatab/model/Beat';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import type { EffectBand } from '@coderline/alphatab/rendering/EffectBand';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, type EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { TabWhammyBarGlyph } from '@coderline/alphatab/rendering/glyphs/TabWhammyBarGlyph';

// this logic below handles the vertical alignment of whammys so that the "0" value is center aligned
// within the staff
// the solution is still a bit hacky though.
const offsetSharedDataKey: string = 'tab.whammy.offset';

/**
 * @internal
 */
export const tabWhammyEffectInfo: EffectInfo = {
    effectId: 'EffectWhammyBarLine',
    notationElement: NotationElement.EffectWhammyBarLine,
    hideOnMultiTrack: false,
    sizingMode: EffectBarGlyphSizing.GroupedOnBeatToEnd,
    shouldCreateGlyph: (_renderer: BarRendererBase, beat: Beat): boolean => {
        return beat.hasWhammyBar;
    },
    createNewGlyph: (_renderer: BarRendererBase, beat: Beat): EffectGlyph => {
        return new TabWhammyBarGlyph(beat);
    },
    canExpand: (_from: Beat, to: Beat): boolean => {
        return to.hasWhammyBar;
    },
    onAlignGlyphs: (band: EffectBand): void => {
        // re-register the sizes so they are available during finalization later
        const info = band.renderer.staff!.getSharedLayoutData<[number, number]>(offsetSharedDataKey, [0, 0]);
        band.renderer.staff!.setSharedLayoutData(offsetSharedDataKey, info);
        for (const voiceGlyphs of band.glyphsByVoice) {
            for (let i = 0, n = voiceGlyphs.length; i < n; i++) {
                const tb = voiceGlyphs[i] as TabWhammyBarGlyph;
                if (tb.originalTopOffset > info[0]) {
                    info[0] = tb.originalTopOffset;
                }
                if (tb.originalBottomOffset > info[1]) {
                    info[1] = tb.originalBottomOffset;
                }
            }
        }
    },
    finalizeBand: (band: EffectBand): void => {
        const info = band.renderer.staff!.getSharedLayoutData<[number, number]>(offsetSharedDataKey, [0, 0]);
        const top = info[0];
        const bottom = info[1];
        for (const voiceGlyphs of band.glyphsByVoice) {
            for (let i = 0, n = voiceGlyphs.length; i < n; i++) {
                const tb = voiceGlyphs[i] as TabWhammyBarGlyph;
                tb.topOffset = top;
                tb.bottomOffset = bottom;
                tb.height = top + bottom;
            }
        }
        band.height = top + bottom;
    },
    placementCategory: EffectBandPlacementCategory.Span
};
