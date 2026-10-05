import type { Beat } from '@coderline/alphatab/model/Beat';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import { TextAlign } from '@coderline/alphatab/platform/ICanvas';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, type EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { TextGlyph } from '@coderline/alphatab/rendering/glyphs/TextGlyph';

/**
 * @internal
 */
export const capoEffectInfo: EffectInfo = {
    effectId: 'EffectCapo',
    notationElement: NotationElement.EffectCapo,
    hideOnMultiTrack: false,
    sizingMode: EffectBarGlyphSizing.SingleOnBeat,
    shouldCreateGlyph: (_renderer: BarRendererBase, beat: Beat): boolean => {
        return beat.index === 0 && beat.voice.bar.index === 0 && beat.voice.bar.staff.capo !== 0;
    },
    createNewGlyph: (renderer: BarRendererBase, beat: Beat): EffectGlyph => {
        return new TextGlyph(
            0,
            0,
            `Capo. fret ${beat.voice.bar.staff.capo}`,
            renderer.resources.elementFonts.get(NotationElement.EffectCapo)!,
            TextAlign.Left
        );
    },
    canExpand: (_from: Beat, _to: Beat): boolean => {
        return false;
    },
    placementCategory: EffectBandPlacementCategory.NoteAttached
};
