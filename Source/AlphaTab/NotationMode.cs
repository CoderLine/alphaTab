namespace AlphaTab
{
    /// <summary>
    /// Lists all modes on how alphaTab can handle the display and playback of music notation. 
    /// </summary>
    public enum NotationMode
    {
        /// <summary>
        /// Music elements will be displayed and played as in Guitar Pro. 
        /// </summary>
        GuitarPro,

        /// <summary>
        /// Music elements will be displayed and played as in traditional songbooks.
        /// Changes:
        /// 1. Bends
        ///     For bends additional grace beats are introduced. 
        ///     Bends are categorized into gradual and fast bends. 
        ///         - Gradual bends are indicated by beat text "grad" or "grad.". Bend will sound along the beat duration. 
        ///         - Fast bends are done right before the next note. If the next note is tied even on-beat of the next note.
        /// 2. Whammy Bars
        ///     Dips are shown as simple annotation over the beats
        ///     Whammy Bars are categorized into gradual and fast. 
        ///         - Gradual whammys are indicated by beat text "grad" or "grad.". Whammys will sound along the beat duration. 
        ///         - Fast whammys are done right the beat.
        /// 3. Let Ring
        ///     Tied notes with let ring are not shown in standard notation
        ///     Let ring does not cause a longer playback, duration is defined via tied notes. 
        /// </summary>
        SongBook
    }
}
