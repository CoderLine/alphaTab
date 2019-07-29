namespace AlphaTab.Model
{
    /// <summary>
    /// Lists all types of whammy bars
    /// </summary>
    public enum WhammyType
    {
        /// <summary>
        /// No whammy at all
        /// </summary>
        None,

        /// <summary>
        /// Individual points define the whammy in a flexible manner. 
        /// This system was mainly used in Guitar Pro 3-5
        /// </summary>
        Custom,

        /// <summary>
        /// Simple dive to a lower or higher note.
        /// </summary>
        Dive,

        /// <summary>
        /// A dive to a lower or higher note and releasing it back to normal. 
        /// </summary>
        Dip,

        /// <summary>
        /// Continue to hold the whammy at the position from a previous whammy. 
        /// </summary>
        Hold,

        /// <summary>
        /// Dive to a lower or higher note before playing it. 
        /// </summary>
        Predive,

        /// <summary>
        /// Dive to a lower or higher note before playing it, then change to another
        /// note. 
        /// </summary>
        PrediveDive
    }
}
