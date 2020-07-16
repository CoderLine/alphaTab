/**
 * Lists all types of whammy bars
 */
export enum WhammyType {
    /**
     * No whammy at all
     */
    None,
    /**
     * Individual points define the whammy in a flexible manner.
     * This system was mainly used in Guitar Pro 3-5
     */
    Custom,
    /**
     * Simple dive to a lower or higher note.
     */
    Dive,
    /**
     * A dive to a lower or higher note and releasing it back to normal.
     */
    Dip,
    /**
     * Continue to hold the whammy at the position from a previous whammy.
     */
    Hold,
    /**
     * Dive to a lower or higher note before playing it.
     */
    Predive,
    /**
     * Dive to a lower or higher note before playing it, then change to another
     * note.
     */
    PrediveDive
}
