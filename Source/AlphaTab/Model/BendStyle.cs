namespace AlphaTab.Model
{
    /// <summary>
    /// Lists the different bend styles
    /// </summary>
    public enum BendStyle
    {
        /// <summary>
        /// The bends are as described by the bend points 
        /// </summary>
        Default,
        /// <summary>
        /// The bends are gradual over the beat duration. 
        /// </summary>
        Gradual,
        /// <summary>
        /// The bends are done fast before the next note. 
        /// </summary>
        Fast
    }
}