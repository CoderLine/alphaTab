namespace AlphaTab
{
    /// <summary>
    /// This object defines the details on how to generate the vibrato effects. 
    /// </summary>
    public class VibratoPlaybackSettings
    {
        /// <summary>
        /// Gets or sets the wavelength of the note-wide vibrato in midi ticks. 
        /// </summary>
        public int NoteWideLength { get; set; }
        /// <summary>
        /// Gets or sets the amplitude for the note-wide vibrato in semitones. 
        /// </summary>
        public int NoteWideAmplitude { get; set; }

        /// <summary>
        /// Gets or sets the wavelength of the note-slight vibrato in midi ticks. 
        /// </summary>
        public int NoteSlightLength { get; set; }
        /// <summary>
        /// Gets or sets the amplitude for the note-slight vibrato in semitones. 
        /// </summary>
        public int NoteSlightAmplitude { get; set; }

        /// <summary>
        /// Gets or sets the wavelength of the beat-wide vibrato in midi ticks. 
        /// </summary>
        public int BeatWideLength { get; set; }
        /// <summary>
        /// Gets or sets the amplitude for the beat-wide vibrato in semitones. 
        /// </summary>
        public int BeatWideAmplitude { get; set; }

        /// <summary>
        /// Gets or sets the wavelength of the beat-slight vibrato in midi ticks. 
        /// </summary>
        public int BeatSlightLength { get; set; }
        /// <summary>
        /// Gets or sets the amplitude for the beat-slight vibrato in semitones. 
        /// </summary>
        public int BeatSlightAmplitude { get; set; }
    }
}