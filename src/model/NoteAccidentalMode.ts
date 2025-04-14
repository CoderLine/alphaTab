/**
 * Lists the modes how accidentals are handled for notes
 */
export enum NoteAccidentalMode {
    /**
     * Accidentals are calculated automatically.
     */
    Default = 0,
    /**
     * This will try to ensure that no accidental is shown.
     */
    ForceNone = 1,
    /**
     * This will move the note one line down and applies a Naturalize.
     */
    ForceNatural = 2,
    /**
     * This will move the note one line down and applies a Sharp.
     */
    ForceSharp = 3,
    /**
     * This will move the note to be shown 2 half-notes deeper with a double sharp symbol
     */
    ForceDoubleSharp = 4,
    /**
     * This will move the note one line up and applies a Flat.
     */
    ForceFlat = 5,
    /**
     * This will move the note two half notes up with a double flag symbol.
     */
    ForceDoubleFlat = 6
}
