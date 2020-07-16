/**
 * Lists the different bend styles
 */
export enum BendStyle {
    /**
     * The bends are as described by the bend points
     */
    Default,
    /**
     * The bends are gradual over the beat duration.
     */
    Gradual,
    /**
     * The bends are done fast before the next note.
     */
    Fast,
}
