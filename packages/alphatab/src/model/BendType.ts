/**
 * Lists all types of bends
 */
export enum BendType {
    /**
     * No bend at all
     */
    None = 0,
    /**
     * Individual points define the bends in a flexible manner.
     * This system was mainly used in Guitar Pro 3-5
     */
    Custom = 1,
    /**
     * Simple Bend from an unbended string to a higher note.
     */
    Bend = 2,
    /**
     * Release of a bend that was started on an earlier note.
     */
    Release = 3,
    /**
     * A bend that starts from an unbended string,
     * and also releases the bend after some time.
     */
    BendRelease = 4,
    /**
     * Holds a bend that was started on an earlier note
     */
    Hold = 5,
    /**
     * A bend that is already started before the note is played then it is held until the end.
     */
    Prebend = 6,
    /**
     * A bend that is already started before the note is played and
     * bends even further, then it is held until the end.
     */
    PrebendBend = 7,
    /**
     * A bend that is already started before the note is played and
     * then releases the bend to a lower note where it is held until the end.
     */
    PrebendRelease = 8
}
