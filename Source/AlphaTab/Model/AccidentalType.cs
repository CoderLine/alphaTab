namespace AlphaTab.Model
{
    /// <summary>
    /// Defines all possible accidentals for notes.
    /// </summary>
    public enum AccidentalType
    {
        /// <summary>
        /// No accidental
        /// </summary>
        None,
        /// <summary>
        /// Naturalize 
        /// </summary>
        Natural,
        /// <summary>
        /// Sharp
        /// </summary>
        Sharp,
        /// <summary>
        /// Flat
        /// </summary>
        Flat,
        /// <summary>
        /// Natural for smear bends
        /// </summary>
        NaturalQuarterNoteUp,
        /// <summary>
        /// Sharp for smear bends
        /// </summary>
        SharpQuarterNoteUp,
        /// <summary>
        /// Flat for smear bends
        /// </summary>
        FlatQuarterNoteUp
    }
}