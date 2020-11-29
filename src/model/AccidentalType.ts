/**
 * Defines all possible accidentals for notes.
 */
export enum AccidentalType {
    /**
     * No accidental
     */
    None,
    /**
     * Naturalize
     */
    Natural,
    /**
     * Sharp
     */
    Sharp,
    /**
     * Flat
     */
    Flat,
    /**
     * Natural for smear bends
     */
    NaturalQuarterNoteUp,
    /**
     * Sharp for smear bends
     */
    SharpQuarterNoteUp,
    /**
     * Flat for smear bends
     */
    FlatQuarterNoteUp,
    /**
     * Double Sharp, indicated by an 'x'
     */
    DoubleSharp,
    /**
     * Double Flat, indicated by 'bb'
     */
    DoubleFlat
}
