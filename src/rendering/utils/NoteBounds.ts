import { Note } from '@src/model/Note';
import { Bounds } from '@src/rendering/utils/Bounds';

/**
 * Represents the bounds of a single note
 */
export class NoteBounds {
    /**
     * Gets or sets the bounds of the individual note head.
     */
    public noteHeadBounds!: Bounds;

    /**
     * Gets or sets the note related to this instance.
     */
    public note!: Note;
}
