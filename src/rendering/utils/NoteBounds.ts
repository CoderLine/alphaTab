import { Note } from '@src/model/Note';
import { Bounds } from '@src/rendering/utils/Bounds';
import { BeatBounds } from './BeatBounds';

/**
 * Represents the bounds of a single note
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
}
