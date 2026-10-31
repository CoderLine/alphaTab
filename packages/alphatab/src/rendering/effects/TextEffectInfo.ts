import type { Beat } from '@coderline/alphatab/model/Beat';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import { TextAlign } from '@coderline/alphatab/platform/ICanvas';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, type EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { TextGlyph } from '@coderline/alphatab/rendering/glyphs/TextGlyph';
import { OverlayRodPolicy } from '@coderline/alphatab/rendering/OverlayRodPolicy';

/**
 * @internal
 */
export const textEffectInfo: EffectInfo = {
    effectId: 'EffectText',
    notationElement: NotationElement.EffectText,
    hideOnMultiTrack: false,
    sizingMode: EffectBarGlyphSizing.SingleOnBeat,
    overlayRodPolicy: OverlayRodPolicy.Left,
    shouldCreateGlyph: (_renderer: BarRendererBase, beat: Beat): boolean => {
        return !!beat.text;
    },
    createNewGlyph: (renderer: BarRendererBase, beat: Beat): EffectGlyph => {
        return new TextGlyph(
            0,
            0,
            beat.text!,
            renderer.resources.elementFonts.get(NotationElement.EffectText)!,
            TextAlign.Left
        );
    },
    canExpand: (_from: Beat, _to: Beat): boolean => true,
    placementCategory: EffectBandPlacementCategory.NoteAttached
};
