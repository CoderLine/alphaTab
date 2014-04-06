using System.Runtime.CompilerServices;
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

        [IntrinsicProperty]
        public byte AlternateEndings { get; set; }
        [IntrinsicProperty]
        public MasterBar NextMasterBar { get; set; }
        [IntrinsicProperty]
        public MasterBar PreviousMasterBar { get; set; }
        [IntrinsicProperty]
        public int Index { get; set; }
        [IntrinsicProperty]
        public int KeySignature { get; set; }
        [IntrinsicProperty]
        public bool IsDoubleBar { get; set; }

        [IntrinsicProperty]
        public bool IsRepeatStart { get; set; }
        public bool IsRepeatEnd { get { return RepeatCount > 0; } }
        [IntrinsicProperty]
        public int RepeatCount { get; set; }
        [IntrinsicProperty]
        public RepeatGroup RepeatGroup { get; set; }

        [IntrinsicProperty]
        public int TimeSignatureNumerator { get; set; }
        [IntrinsicProperty]
        public int TimeSignatureDenominator { get; set; }

        [IntrinsicProperty]
        public TripletFeel TripletFeel { get; set; }

        [IntrinsicProperty]
        public Section Section { get; set; }
        public bool IsSectionStart { get { return Section != null; } }

        [IntrinsicProperty]
        public Automation TempoAutomation { get; set; }
        [IntrinsicProperty]
        public Automation VolumeAutomation { get; set; }

        [IntrinsicProperty]
        public Score Score { get; set; }

        /// <summary>
        /// The timeline position of the voice within the whole score. (unit: midi ticks)
        /// </summary>
        [IntrinsicProperty]
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