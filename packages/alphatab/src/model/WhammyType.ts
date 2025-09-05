/**
 * Lists all types of whammy bars
 */
export enum WhammyType {
    /**
     * No whammy at all
     */
    None = 0,
    /**
     * Individual points define the whammy in a flexible manner.
     * This system was mainly used in Guitar Pro 3-5
     */
    Custom = 1,
    /**
     * Simple dive to a lower or higher note.
     */
    Dive = 2,
    /**
     * A dive to a lower or higher note and releasing it back to normal.
     */
    Dip = 3,
    /**
     * Continue to hold the whammy at the position from a previous whammy.
     */
    Hold = 4,
    /**
     * Dive to a lower or higher note before playing it.
     */
    Predive = 5,
    /**
     * Dive to a lower or higher note before playing it, then change to another
     * note.
     */
    PrediveDive = 6
}
