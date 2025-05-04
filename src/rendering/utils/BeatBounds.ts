import type { Beat } from '@src/model/Beat';
import type { Note } from '@src/model/Note';
import type { BarBounds } from '@src/rendering/utils/BarBounds';
import type { Bounds } from '@src/rendering/utils/Bounds';
import type { NoteBounds } from '@src/rendering/utils/NoteBounds';

/**
 * Represents the bounds of a single beat.
 */
export class BeatBounds {
    /**
     * Gets or sets the reference to the parent {@link BarBounds}.
     */
    public barBounds!: BarBounds;

    /**
     * Gets or sets the bounds covering all visually visible elements spanning this beat.
     */
    public visualBounds!: Bounds;

    /**
     * Gets or sets x-position where the timely center of the notes for this beat is.
     * This is where the cursor should be at the time when this beat is played.
     */
    public onNotesX: number = 0;

    /**
     * Gets or sets the actual bounds of the elements in this beat including whitespace areas.
     */
    public realBounds!: Bounds;

    /**
     * Gets or sets the beat related to this bounds.
     */
    public beat!: Beat;

    /**
     * Gets or sets the individual note positions of this beat (if {@link CoreSettings.includeNoteBounds} was set to true).
     */
    public notes: NoteBounds[] | null = null;

    /**
     * Adds a new note to this bounds.
     * @param bounds The note bounds to add.
     */
    public addNote(bounds: NoteBounds): void {
        if (!this.notes) {
            this.notes = [];
        }
        bounds.beatBounds = this;
        this.notes.push(bounds);
    }

    /**
     * Tries to find a note at the given position.
     * @param x The X-position of the note to find.
     * @param y The Y-position of the note to find.
     * @returns The note at the given position or null if no note was found, or the note lookup was not enabled before rendering.
     */
    public findNoteAtPos(x: number, y: number): Note | null {
        const notes = this.notes;
        if (!notes) {
            return null;
        }
        // TODO: can be likely optimized
        // a beat is mostly vertically aligned, we could sort the note bounds by Y
        // and then do a binary search on the Y-axis.
        for (const note of notes) {
            const bottom: number = note.noteHeadBounds.y + note.noteHeadBounds.h;
            const right: number = note.noteHeadBounds.x + note.noteHeadBounds.w;
            if (note.noteHeadBounds.x <= x && note.noteHeadBounds.y <= y && x <= right && y <= bottom) {
                return note.note;
            }
        }
        return null;
    }

    /**
     * Finishes the lookup object and optimizes itself for fast access.
     */
    public finish(scale: number = 1) {
        this.realBounds.scaleWith(scale);
        this.visualBounds.scaleWith(scale);
        this.onNotesX *= scale;

        if (this.notes) {
            for (const n of this.notes!) {
                n.finish(scale);
            }
        }
    }
}
