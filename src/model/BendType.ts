/**
 * Lists all types of bends
 */
export enum BendType {
    /**
     * No bend at all
     */
    None,
    /**
     * Individual points define the bends in a flexible manner.
     * This system was mainly used in Guitar Pro 3-5
     */
    Custom,
    /**
     * Simple Bend from an unbended string to a higher note.
     */
    Bend,
    /**
     * Release of a bend that was started on an earlier note.
     */
    Release,
    /**
     * A bend that starts from an unbended string,
     * and also releases the bend after some time.
     */
    BendRelease,
    /**
     * Holds a bend that was started on an earlier note
     */
    Hold,
    /**
     * A bend that is already started before the note is played then it is held until the end.
     */
    Prebend,
    /**
     * A bend that is already started before the note is played and
     * bends even further, then it is held until the end.
     */
    PrebendBend,
    /**
     * A bend that is already started before the note is played and
     * then releases the bend to a lower note where it is held until the end.
     */
    PrebendRelease
}
