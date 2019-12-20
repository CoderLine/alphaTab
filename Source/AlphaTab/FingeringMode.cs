using AlphaTab.Util;

namespace AlphaTab
{
    /// <summary>
    /// Lists all modes on how fingerings should be displayed.
    /// </summary>
    [JsonSerializable]
    public enum FingeringMode
    {
        /// <summary>
        /// Fingerings will be shown in the standard notation staff.
        /// </summary>
        ScoreDefault,

        /// <summary>
        /// Fingerings will be shown in the standard notation staff. Piano finger style is enforced, where
        /// fingers are rendered as 1-5 instead of p,i,m,a,c and T,1,2,3,4.
        /// </summary>
        ScoreForcePiano,

        /// <summary>
        /// Fingerings will be shown in a effect band above the tabs in case
        /// they have only a single note on the beat.
        /// </summary>
        SingleNoteEffectBand,

        /// <summary>
        /// Fingerings will be shown in a effect band above the tabs in case
        /// they have only a single note on the beat. Piano finger style is enforced, where
        /// fingers are rendered as 1-5 instead of p,i,m,a,c and T,1,2,3,4.
        /// </summary>
        SingleNoteEffectBandForcePiano
    }
}
