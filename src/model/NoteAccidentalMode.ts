/**
 * Lists the modes how accidentals are handled for notes
 */
export enum NoteAccidentalMode {
    /**
     * Accidentals are calculated automatically.
     */
    Default,
    /**
     * If the default behavior calculates a Sharp, use flat instead (and vice versa).
     */
    SwapAccidentals,
    /**
     * This will move the note one line down and applies a Naturalize.
     */
    ForceNatural,
    /**
     * This will move the note one line down and applies a Sharp.
     */
    ForceSharp,
    /**
     * This will move the note one line up and applies a Flat.
     */
    ForceFlat
}
