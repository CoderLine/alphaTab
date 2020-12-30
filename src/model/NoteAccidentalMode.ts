/**
 * Lists the modes how accidentals are handled for notes
 */
export enum NoteAccidentalMode {
    /**
     * Accidentals are calculated automatically.
     */
    Default,
    /**
     * This will try to ensure that no accidental is shown.
     */
    ForceNone,
    /**
     * This will move the note one line down and applies a Naturalize.
     */
    ForceNatural,
    /**
     * This will move the note one line down and applies a Sharp.
     */
    ForceSharp,
    /**
     * This will move the note to be shown 2 half-notes deeper with a double sharp symbol
     */
    ForceDoubleSharp,
    /**
     * This will move the note one line up and applies a Flat.
     */
    ForceFlat,
    /**
     * This will move the note two half notes up with a double flag symbol.
     */
    ForceDoubleFlat,
}
