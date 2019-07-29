namespace AlphaTab
{
    /// <summary>
    /// Lists all modes on how fingerings should be displayed.
    /// </summary>
    public enum FingeringMode
    {
        /// <summary>
        /// Fingerings will be shown in the standard notation staff. 
        /// </summary>
        Score,
        /// <summary>
        /// Fingerings will be shown in a effect band above the tabs in case
        /// they have only a single note on the beat.
        /// </summary>
        SingleNoteEffectBand
    }
}