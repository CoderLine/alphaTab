import type { Note } from '@coderline/alphatab/model/Note';
import type { Bounds } from '@coderline/alphatab/rendering/utils/Bounds';
import type { BeatBounds } from '@coderline/alphatab/rendering/utils/BeatBounds';

/**
 * Represents the bounds of a single note
 * @public
 */
export class NoteBounds {
    /**
     * Gets or sets the reference to the beat boudns this note relates to.
     */
    public beatBounds!: BeatBounds;

    /**
     * Gets or sets the bounds of the individual note head.
     */
    public noteHeadBounds!: Bounds;

    /**
     * Gets or sets the note related to this instance.
     */
    public note!: Note;

    /**
     * Finishes the lookup object and optimizes itself for fast access.
     */
    public finish(scale: number = 1) {
        this.noteHeadBounds.scaleWith(scale);
    }
}
