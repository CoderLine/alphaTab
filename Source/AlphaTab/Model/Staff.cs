using AlphaTab.Collections;

namespace AlphaTab.Model
{
    /// <summary>
    /// This class describes a single staff within a track. There are instruments like pianos
    /// where a single track can contain multiple staffs. 
    /// </summary>
    public class Staff
    {
        /// <summary>
        /// Gets or sets the zero-based index of this staff within the track.
        /// </summary>
        public int Index { get; set; }

        /// <summary>
        /// Gets or sets the reference to the track this staff belongs to. 
        /// </summary>
        public Track Track { get; set; }

        /// <summary>
        /// Gets or sets a list of all bars contained in this staff. 
        /// </summary>
        public FastList<Bar> Bars { get; set; }

        /// <summary>
        /// Gets or sets a list of all chords defined for this staff. <see cref="Beat.ChordId"/> refers to entries in this lookup.
        /// </summary>
        public FastDictionary<string, Chord> Chords { get; set; }

        /// <summary>
        /// Gets or sets the fret on which a capo is set. s
        /// </summary>
        public int Capo { get; set; }

        /// <summary>
        /// Gets or sets the number of semitones this track should be
        /// transposed. This applies to rendering and playback.
        /// </summary>
        public int TranspositionPitch { get; set; }

        /// <summary>
        /// Gets or sets the number of semitones this track should be 
        /// transposed. This applies only to rendering. 
        /// </summary>
        public int DisplayTranspositionPitch { get; set; }

        /// <summary>
        /// Get or set the guitar tuning of the guitar. This tuning also indicates the number of strings shown in the
        /// guitar tablature. Unlike the <see cref="Note.String"/> property this array directly represents
        /// the order of the tracks shown in the tablature. The first item is the most top tablature line. 
        /// </summary>
        public int[] Tuning { get; set; }

        /// <summary>
        /// Gets or sets the name of the tuning.
        /// </summary>
        public string TuningName { get; set; }

        /// <summary>
        /// Gets a value indicating whether this staff contains string based notes.
        /// </summary>
        public bool IsStringed => Tuning.Length > 0;

        /// <summary>
        /// Gets or sets whether the tabs are shown. 
        /// </summary>
        public bool ShowTablature { get; set; }

        /// <summary>
        /// Gets or sets whether the standard notation is shown. 
        /// </summary>
        public bool ShowStandardNotation { get; set; }

        /// <summary>
        /// Gets or sets whether the staff contains percussion notation
        /// </summary>
        public bool IsPercussion { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="Staff"/> class.
        /// </summary>
        public Staff()
        {
            Bars = new FastList<Bar>();
            Tuning = new int[0];
            Chords = new FastDictionary<string, Chord>();
            ShowStandardNotation = true;
            ShowTablature = true;
        }

        internal static void CopyTo(Staff src, Staff dst)
        {
            dst.Capo = src.Capo;
            dst.Index = src.Index;
            dst.Tuning = Platform.Platform.CloneArray(src.Tuning);
            dst.TranspositionPitch = src.TranspositionPitch;
            dst.DisplayTranspositionPitch = src.DisplayTranspositionPitch;
            dst.ShowStandardNotation = src.ShowStandardNotation;
            dst.ShowTablature = src.ShowTablature;
            dst.IsPercussion = src.IsPercussion;
        }

        internal void Finish(Settings settings)
        {
            for (int i = 0, j = Bars.Count; i < j; i++)
            {
                Bars[i].Finish(settings);
            }
        }

        internal void AddChord(string chordId, Chord chord)
        {
            chord.Staff = this;
            Chords[chordId] = chord;
        }

        internal void AddBar(Bar bar)
        {
            var bars = Bars;
            bar.Staff = this;
            bar.Index = bars.Count;
            if (bars.Count > 0)
            {
                bar.PreviousBar = bars[bars.Count - 1];
                bar.PreviousBar.NextBar = bar;
            }

            bars.Add(bar);
        }
    }
}
