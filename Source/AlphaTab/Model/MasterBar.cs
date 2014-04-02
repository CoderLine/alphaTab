using AlphaTab.Audio;

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

        public byte AlternateEndings { get; set; }
        public MasterBar NextMasterBar { get; set; }
        public MasterBar PreviousMasterBar { get; set; }
        public int Index { get; set; }
        public int KeySignature { get; set; }
        public bool IsDoubleBar { get; set; }

        public bool IsRepeatStart { get; set; }
        public bool IsRepeatEnd { get { return RepeatCount > 0; } }
        public int RepeatCount { get; set; }
        public RepeatGroup RepeatGroup { get; set; }

        public int TimeSignatureNumerator { get; set; }
        public int TimeSignatureDenominator { get; set; }

        public TripletFeel TripletFeel { get; set; }

        public Section Section { get; set; }
        public bool IsSectionStart { get { return Section != null; } }

        public Automation TempoAutomation { get; set; }
        public Automation VolumeAutomation { get; set; }

        public Score Score { get; set; }

        /// <summary>
        /// The timeline position of the voice within the whole score. (unit: midi ticks)
        /// </summary>
        public int Start { get; set; }

        public MasterBar()
        {
            TimeSignatureDenominator = 4;
            TimeSignatureNumerator = 4;
            TripletFeel = TripletFeel.NoTripletFeel;
        }
        /// <summary>
        /// Calculates the time spent in this bar. (unit: midi ticks)
        /// </summary>
        /// <returns></returns>
        public int CalculateDuration()
        {
            return TimeSignatureNumerator * MidiUtils.ValueToTicks(TimeSignatureDenominator);
        }
    }
}