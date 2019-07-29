namespace AlphaTab.Model
{
    /// <summary>
    /// Lists all types of bends
    /// </summary>
    public enum BendType
    {
        /// <summary>
        /// No bend at all
        /// </summary>
        None,

        /// <summary>
        /// Individual points define the bends in a flexible manner.
        /// This system was mainly used in Guitar Pro 3-5
        /// </summary>
        Custom,

        /// <summary>
        /// Simple Bend from an unbended string to a higher note.
        /// </summary>
        Bend,

        /// <summary>
        /// Release of a bend that was started on an earlier note.
        /// </summary>
        Release,

        /// <summary>
        /// A bend that starts from an unbended string,
        /// and also releases the bend after some time.
        /// </summary>
        BendRelease,

        /// <summary>
        /// Holds a bend that was started on an earlier note
        /// </summary>
        Hold,

        /// <summary>
        /// A bend that is already started before the note is played then it is held until the end.
        /// </summary>
        Prebend,

        /// <summary>
        /// A bend that is already started before the note is played and
        /// bends even further, then it is held until the end.
        /// </summary>
        PrebendBend,

        /// <summary>
        /// A bend that is already started before the note is played and
        /// then releases the bend to a lower note where it is held until the end.
        /// </summary>
        PrebendRelease
    }
}
