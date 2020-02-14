namespace AlphaTab.Model
{
    /// <summary>
    /// This public enum lists all different types of finger slide-ins on a string.
    /// </summary>
    public enum SlideInType
    {
        /// <summary>
        /// No slide.
        /// </summary>
        None,

        /// <summary>
        /// Slide into the note from below on the same string.
        /// </summary>
        IntoFromBelow,

        /// <summary>
        /// Slide into the note from above on the same string.
        /// </summary>
        IntoFromAbove
    }

    /// <summary>
    /// This public enum lists all different types of finger slide-outs on a string.
    /// </summary>
    public enum SlideOutType
    {
        /// <summary>
        /// No slide.
        /// </summary>
        None,

        /// <summary>
        /// Shift slide to next note on same string
        /// </summary>
        Shift,

        /// <summary>
        /// Legato slide to next note on same string.
        /// </summary>
        Legato,

        /// <summary>
        /// Slide out from the note from upwards on the same string.
        /// </summary>
        OutUp,

        /// <summary>
        /// Slide out from the note from downwards on the same string.
        /// </summary>
        OutDown,

        /// <summary>
        /// Pickslide down on this note
        /// </summary>
        PickSlideDown,

        /// <summary>
        /// Pickslide up on this note
        /// </summary>
        PickSlideUp
    }
}
