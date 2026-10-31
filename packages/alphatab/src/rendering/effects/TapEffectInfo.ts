import type { Beat } from '@coderline/alphatab/model/Beat';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import { TextAlign } from '@coderline/alphatab/platform/ICanvas';
import type { RenderingResources } from '@coderline/alphatab/RenderingResources';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, type EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { TextGlyph } from '@coderline/alphatab/rendering/glyphs/TextGlyph';

/**
 * @internal
 */
export const tapEffectInfo: EffectInfo = {
    effectId: 'EffectTap',
    notationElement: NotationElement.EffectTap,
    hideOnMultiTrack: false,
    sizingMode: EffectBarGlyphSizing.SingleOnBeat,
    shouldCreateGlyph: (_renderer: BarRendererBase, beat: Beat): boolean => {
        return beat.slap || beat.pop || beat.tap;
    },
    createNewGlyph: (renderer: BarRendererBase, beat: Beat): EffectGlyph => {
        const res: RenderingResources = renderer.resources;
        if (beat.slap) {
            return new TextGlyph(0, 0, 'S', res.elementFonts.get(NotationElement.EffectTap)!, TextAlign.Center);
        }
        if (beat.pop) {
            return new TextGlyph(0, 0, 'P', res.elementFonts.get(NotationElement.EffectTap)!, TextAlign.Center);
        }
        return new TextGlyph(0, 0, 'T', res.elementFonts.get(NotationElement.EffectTap)!, TextAlign.Center);
    },
    canExpand: (_from: Beat, _to: Beat): boolean => true,
    placementCategory: EffectBandPlacementCategory.NoteAttached
};
