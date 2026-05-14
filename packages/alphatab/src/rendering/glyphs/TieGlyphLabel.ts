import type { Note } from '@coderline/alphatab/model/Note';
import type { SlurSegment } from '@coderline/alphatab/model/SlurSegment';
import { SlurSegmentKind } from '@coderline/alphatab/model/SlurSegmentKind';
import { NotationElement } from '@coderline/alphatab/NotationSettings';

/**
 * One resolved label to paint along a tie/slur arc. Built once per
 * slur glyph from the model-side {@link SlurSegment}s; consumed by
 * `TieGlyph` during layout (X/Y resolution) and paint.
 * @record
 * @internal
 */
export interface TieGlyphLabel {
    fromNote: Note;
    toNote: Note;
    text: string;
    element: NotationElement;
}

/**
 * A label whose paint position has been resolved against the current
 * layout. Stored on the glyph in a lazily-grown cache so re-layouts
 * mutate existing entries instead of allocating.
 * @record
 * @internal
 */
export interface ResolvedTieGlyphLabel {
    x: number;
    y: number;
    text: string;
    element: NotationElement;
}

/**
 * Helpers for building `TieGlyphLabel` instances from model-side
 * {@link SlurSegment}s.
 * @internal
 */
export class TieGlyphLabels {
    /**
     * Builds a `TieGlyphLabel` for one segment of a slur. The
     * `isAscending` flag selects between the H/P glyph for hammer-on
     * vs. pull-off — score side passes a comparison on `realValue`,
     * tab side passes a comparison on `fret`.
     */
    public static build(s: SlurSegment, isAscending: boolean): TieGlyphLabel {
        if (s.kind === SlurSegmentKind.LegatoSlide) {
            return {
                fromNote: s.fromNote,
                toNote: s.toNote,
                text: s.text !== null ? s.text : 'sl.',
                element: NotationElement.EffectSlideText
            };
        }
        // HammerPull
        return {
            fromNote: s.fromNote,
            toNote: s.toNote,
            text: s.text !== null ? s.text : isAscending ? 'H' : 'P',
            element: NotationElement.EffectHammerOnPullOffText
        };
    }
}
