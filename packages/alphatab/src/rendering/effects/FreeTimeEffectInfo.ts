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
export const freeTimeEffectInfo: EffectInfo = {
    effectId: 'EffectText',
    notationElement: NotationElement.EffectText,
    hideOnMultiTrack: false,
    overlayRodPolicy: OverlayRodPolicy.Left,
    sizingMode: EffectBarGlyphSizing.SinglePreBeat,
    shouldCreateGlyph: (_renderer: BarRendererBase, beat: Beat): boolean => {
        const masterBar = beat.voice.bar.masterBar;
        const isFirstBeat = beat.voice.bar.staff.index === 0 && beat.voice.index === 0 && beat.index === 0;
        return (
            isFirstBeat &&
            masterBar.isFreeTime &&
            (masterBar.index === 0 || masterBar.isFreeTime !== masterBar.previousMasterBar!.isFreeTime)
        );
    },
    createNewGlyph: (renderer: BarRendererBase, _beat: Beat): EffectGlyph => {
        return new TextGlyph(
            0,
            0,
            'Free time',
            renderer.resources.elementFonts.get(NotationElement.EffectFreeTime)!,
            TextAlign.Left
        );
    },
    canExpand: (_from: Beat, _to: Beat): boolean => true,
    placementCategory: EffectBandPlacementCategory.SystemMarker
};
