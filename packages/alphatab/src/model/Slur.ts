import type { Note } from '@coderline/alphatab/model/Note';
import type { SlurSegment } from '@coderline/alphatab/model/SlurSegment';

/**
 * A slur arc spanning two notes, optionally with inner articulation
 * segments. Corresponds conceptually to a MusicXML `<slur>` element
 * plus the technique spans inside it.
 *
 * For this PR only effect slurs (hammer-pull + legato-slide chains)
 * are derived in `Note.finish()`. Phrase and legato slurs may join
 * this type in a future PR; a discriminator will be added at that
 * point.
 * @internal
 */
export class Slur {
    public originNote!: Note;
    public destinationNote!: Note;
    public segments: SlurSegment[] = [];
}
