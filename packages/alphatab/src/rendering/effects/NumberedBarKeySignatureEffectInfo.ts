import type { Beat } from '@coderline/alphatab/model/Beat';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, type EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { NumberedKeySignatureGlyph } from '@coderline/alphatab/rendering/glyphs/NumberedKeySignatureGlyph';

/**
 * @internal
 */
export const numberedBarKeySignatureEffectInfo: EffectInfo = {
    effectId: 'EffectNumberedNotationKeySignature',
    notationElement: NotationElement.EffectNumberedNotationKeySignature,
    hideOnMultiTrack: false,
    sizingMode: EffectBarGlyphSizing.FullBar,
    shouldCreateGlyph: (_renderer: BarRendererBase, beat: Beat): boolean => {
        const bar = beat.voice.bar;
        return (
            beat.index === 0 &&
            beat.voice.index === 0 &&
            (!bar.previousBar || bar.keySignature !== bar.previousBar.keySignature)
        );
    },
    createNewGlyph: (renderer: BarRendererBase, _beat: Beat): EffectGlyph => {
        return new NumberedKeySignatureGlyph(0, 0, renderer.bar.keySignature, renderer.bar.keySignatureType);
    },
    canExpand: (_from: Beat, _to: Beat): boolean => false,
    placementCategory: EffectBandPlacementCategory.NoteAttached
};
