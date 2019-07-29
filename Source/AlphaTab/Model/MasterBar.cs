using AlphaTab.Audio;
using AlphaTab.Collections;

namespace AlphaTab.Model
{
    /// <summary>
    /// The MasterBar stores information about a bar which affects
    /// all tracks.
    /// </summary>
    public class MasterBar
    {
        /// <summary>
        /// The maximum alternate endings.  (1 byte with 8 bitflags)
        /// </summary>
        public const int MaxAlternateEndings = 8;

        /// <summary>
        /// Gets or sets the bitflag for the alternate endings. Each bit defines for which repeat counts
        /// the bar is played.
        /// </summary>
        public byte AlternateEndings { get; set; }

        /// <summary>
        /// Gets or sets the next masterbar in the song. 
        /// </summary>
        public MasterBar NextMasterBar { get; set; }

        /// <summary>
        /// Gets or sets the next masterbar in the song. 
        /// </summary>
        public MasterBar PreviousMasterBar { get; set; }

        /// <summary>
        /// Gets the zero based index of the masterbar. 
        /// </summary>
        public int Index { get; set; }

        /// <summary>
        /// Gets or sets the key signature used on all bars.
        /// </summary>
        public KeySignature KeySignature { get; set; }

        /// <summary>
        /// Gets or sets the type of key signature (major/minor)
        /// </summary>
        public KeySignatureType KeySignatureType { get; set; }

        /// <summary>
        /// Gets or sets whether a double bar is shown for this masterbar. 
        /// </summary>
        public bool IsDoubleBar { get; set; }

        /// <summary>
        /// Gets or sets whether a repeat section starts on this masterbar. 
        /// </summary>
        public bool IsRepeatStart { get; set; }

        /// <summary>
        /// Gets or sets whether a repeat section ends on this masterbar. 
        /// </summary>
        public bool IsRepeatEnd => RepeatCount > 0;

        /// <summary>
        /// Gets or sets the number of repeats for the current repeat section. 
        /// </summary>
        public int RepeatCount { get; set; }

        /// <summary>
        /// Gets or sets the repeat group this bar belongs to. 
        /// </summary>
        public RepeatGroup RepeatGroup { get; set; }

        /// <summary>
        /// Gets or sets the time signature numerator.
        /// </summary>
        public int TimeSignatureNumerator { get; set; }

        /// <summary>
        /// Gets or sets the time signature denominiator. 
        /// </summary>
        public int TimeSignatureDenominator { get; set; }

        /// <summary>
        /// Gets or sets whether this is bar has a common time signature. 
        /// </summary>
        public bool TimeSignatureCommon { get; set; }

        /// <summary>
        /// Gets or sets the triplet feel that is valid for this bar. 
        /// </summary>
        public TripletFeel TripletFeel { get; set; }

        /// <summary>
        /// Gets or sets the new section information for this bar. 
        /// </summary>
        public Section Section { get; set; }

        /// <summary>
        /// Gets a value indicating whether a new section starts on this bar. 
        /// </summary>
        public bool IsSectionStart => Section != null;

        /// <summary>
        /// Gets or sets the tempo automation for this bar. 
        /// </summary>
        public Automation TempoAutomation { get; set; }

        /// <summary>
        /// Gets or sets the reference to the score this song belongs to. 
        /// </summary>
        public Score Score { get; set; }

        /// <summary>
        /// Gets or sets the fermatas for this bar. The key is the offset of the fermata in midi ticks. 
        /// </summary>
        public FastDictionary<int, Fermata> Fermata { get; set; }

        /// <summary>
        /// The timeline position of the voice within the whole score. (unit: midi ticks)
        /// </summary>
        public int Start { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether the master bar is an anacrusis (aka. pickup bar)
        /// </summary>
        public bool IsAnacrusis { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="MasterBar"/> class.
        /// </summary>
        public MasterBar()
        {
            TimeSignatureDenominator = 4;
            TimeSignatureNumerator = 4;
            TripletFeel = TripletFeel.NoTripletFeel;
            KeySignatureType = KeySignatureType.Major;
            TimeSignatureCommon = false;
            Fermata = new FastDictionary<int, Fermata>();
        }

        internal static void CopyTo(MasterBar src, MasterBar dst)
        {
            dst.IsAnacrusis = src.IsAnacrusis;
            dst.AlternateEndings = src.AlternateEndings;
            dst.Index = src.Index;
            dst.KeySignature = src.KeySignature;
            dst.KeySignatureType = src.KeySignatureType;
            dst.IsDoubleBar = src.IsDoubleBar;
            dst.IsRepeatStart = src.IsRepeatStart;
            dst.RepeatCount = src.RepeatCount;
            dst.TimeSignatureNumerator = src.TimeSignatureNumerator;
            dst.TimeSignatureDenominator = src.TimeSignatureDenominator;
            dst.TimeSignatureCommon = src.TimeSignatureCommon;
            dst.TripletFeel = src.TripletFeel;
            dst.Start = src.Start;
        }

        /// <summary>
        /// Calculates the time spent in this bar. (unit: midi ticks)
        /// </summary>
        /// <returns></returns>
        public int CalculateDuration()
        {
            if (IsAnacrusis)
            {
                var duration = 0;
                foreach (var track in Score.Tracks)
                {
                    foreach (var staff in track.Staves)
                    {
                        var barDuration = staff.Bars[0].CalculateDuration();
                        if (barDuration > duration)
                        {
                            duration = barDuration;
                        }
                    }
                }

                return duration;
            }

            return TimeSignatureNumerator * MidiUtils.ValueToTicks(TimeSignatureDenominator);
        }

        /// <summary>
        /// Adds a fermata to the masterbar. 
        /// </summary>
        /// <param name="offset">The offset of the fermata within the bar in midi ticks. </param>
        /// <param name="fermata">The fermata.</param>
        internal void AddFermata(int offset, Fermata fermata)
        {
            Fermata[offset] = fermata;
        }

        /// <summary>
        /// Gets the fermata for a given beat. 
        /// </summary>
        /// <param name="beat">The beat to get the fermata for.</param>
        /// <returns></returns>
        internal Fermata GetFermata(Beat beat)
        {
            if (Fermata.ContainsKey(beat.PlaybackStart))
            {
                return Fermata[beat.PlaybackStart];
            }

            return null;
        }
    }
}
