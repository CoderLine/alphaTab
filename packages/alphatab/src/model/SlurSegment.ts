import type { Note } from '@coderline/alphatab/model/Note';
import type { SlurSegmentKind } from '@coderline/alphatab/model/SlurSegmentKind';

/**
 * One inner articulation span inside a {@link Slur}. Corresponds
 * conceptually to a MusicXML `<hammer-on>` / `<pull-off>` / `<slide>`
 * start-stop pair nested inside the surrounding `<slur>` element.
 * @record
 * @internal
 */
export interface SlurSegment {
    fromNote: Note;
    toNote: Note;
    kind: SlurSegmentKind;
    /**
     * Optional explicit label preserved from an external source (e.g. a
     * future importer that reads MusicXML element text content).
     * When null, the renderer derives the label from `kind` and note
     * context — H vs P by fret/realValue comparison, "sl." for slides.
     */
    text: string | null;
}
