/**
 * Defines all possible accidentals for notes.
 */
export enum AccidentalType {
    /**
     * No accidental
     */
    None = 0,
    /**
     * Naturalize
     */
    Natural = 1,
    /**
     * Sharp
     */
    Sharp = 2,
    /**
     * Flat
     */
    Flat = 3,
    /**
     * Natural for smear bends
     */
    NaturalQuarterNoteUp = 4,
    /**
     * Sharp for smear bends
     */
    SharpQuarterNoteUp = 5,
    /**
     * Flat for smear bends
     */
    FlatQuarterNoteUp = 6,
    /**
     * Double Sharp, indicated by an 'x'
     */
    DoubleSharp = 7,
    /**
     * Double Flat, indicated by 'bb'
     */
    DoubleFlat = 8
}
