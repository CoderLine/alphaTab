import type { Beat } from '@coderline/alphatab/model/Beat';
import { HarmonicType } from '@coderline/alphatab/model/HarmonicType';
import type { Note } from '@coderline/alphatab/model/Note';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, type EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import { createNoteShouldCreateGlyph } from '@coderline/alphatab/rendering/effects/NoteEffectInfoBase';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { LineRangedGlyph } from '@coderline/alphatab/rendering/glyphs/LineRangedGlyph';

/**
 * @internal
 */
export function harmonicToString(type: HarmonicType): string {
    switch (type) {
        case HarmonicType.Natural:
            return 'N.H.';
        case HarmonicType.Artificial:
            return 'A.H.';
        case HarmonicType.Pinch:
            return 'P.H.';
        case HarmonicType.Tap:
            return 'T.H.';
        case HarmonicType.Semi:
            return 'S.H.';
        case HarmonicType.Feedback:
            return 'Fdbk.';
    }
    return '';
}

function harmonicEffectId(harmonicType: HarmonicType): string {
    switch (harmonicType) {
        case HarmonicType.None:
            return 'harmonics-none';
        case HarmonicType.Natural:
            return 'harmonics-natural';
        case HarmonicType.Artificial:
            return 'harmonics-artificial';
        case HarmonicType.Pinch:
            return 'harmonics-pinch';
        case HarmonicType.Tap:
            return 'harmonics-tap';
        case HarmonicType.Semi:
            return 'harmonics-semi';
        case HarmonicType.Feedback:
            return 'harmonics-feedback';
        default:
            return '';
    }
}

/**
 * @internal
 */
export function createHarmonicsEffectInfo(harmonicType: HarmonicType): EffectInfo {
    return {
        effectId: harmonicEffectId(harmonicType),
        notationElement: NotationElement.EffectHarmonics,
        hideOnMultiTrack: false,
        sizingMode: EffectBarGlyphSizing.GroupedOnBeat,
        shouldCreateGlyph: createNoteShouldCreateGlyph(
            (note: Note): boolean => note.isHarmonic && note.harmonicType === harmonicType
        ),
        createNewGlyph: (_renderer: BarRendererBase, _beat: Beat): EffectGlyph =>
            new LineRangedGlyph(harmonicToString(harmonicType), NotationElement.EffectHarmonics),
        canExpand: (_from: Beat, _to: Beat): boolean => true,
        placementCategory: EffectBandPlacementCategory.NoteAttached
    };
}
