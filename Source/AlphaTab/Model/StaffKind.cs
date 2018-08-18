namespace AlphaTab.Model
{
    /// <summary>
    /// Represents the different kinds of staffs.
    /// </summary>
    public enum StaffKind
    {
        /// <summary>
        /// The staff should be shown as guitar tablature. 
        /// </summary>
        Tablature,
        /// <summary>
        /// The staff should be shown as normal music notation without tabs. 
        /// </summary>
        Score,
        /// <summary>
        /// The staff should be shown as percussion tabs. 
        /// </summary>
        Percussion,
        /// <summary>
        /// The staff should be shown as mixed tab/music notaiton
        /// </summary>
        Mixed
    }
}