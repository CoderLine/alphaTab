namespace AlphaTab.Audio.Synth.Synthesis
{
    /// <summary>
    /// Supported output modes by the render methods
    /// </summary>
    public enum OutputMode
    {
        /// <summary>
        /// Two channels with single left/right samples one after another
        /// </summary>
        StereoInterleaved,
        /// <summary>
        /// Two channels with all samples for the left channel first then right
        /// </summary>
        StereoUnweaved,
        /// <summary>
        /// A single channel (stereo instruments are mixed into center)
        /// </summary>
        Mono
    }
}