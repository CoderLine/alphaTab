using AlphaTab.Collections;

namespace AlphaTab.Model
{
    /// <summary>
    /// Represents a list of beats that are grouped within the same tuplet.
    /// </summary>
    public class TupletGroup
    {
        public int _totalDuration;
        private bool _isEqualLengthTuplet = true;

        /// <summary>
        /// Gets or sets the list of beats contained in this group.
        /// </summary>
        public FastList<Beat> Beats { get; set; }

        /// <summary>
        /// Gets or sets the voice this group belongs to.
        /// </summary>
        public Voice Voice { get; set; }


        /// <summary>
        /// Initializes a new instance of the <see cref="TupletGroup"/> class.
        /// </summary>
        /// <param name="voice">The voice this group belongs to.</param>
        public TupletGroup(Voice voice)
        {
            Voice = voice;
            Beats = new FastList<Beat>();
        }

        /// <summary>
        /// Gets a value indicating whether the tuplet group is fully filled.
        /// </summary>
        public bool IsFull
        {
            get;
            private set;
        }


        private const int HalfTicks = 1920;
        private const int QuarterTicks = 960;
        private const int EighthTicks = 480;
        private const int SixteenthTicks = 240;
        private const int ThirtySecondTicks = 120;
        private const int SixtyFourthTicks = 60;
        private const int OneHundredTwentyEighthTicks = 30;
        private const int TwoHundredFiftySixthTicks = 15;


        private static readonly int[] AllTicks =
        {
            HalfTicks, QuarterTicks, EighthTicks, SixteenthTicks, ThirtySecondTicks, SixtyFourthTicks,
            OneHundredTwentyEighthTicks, TwoHundredFiftySixthTicks
        };

        internal bool Check(Beat beat)
        {
            if (Beats.Count == 0)
            {
                // accept first beat
                Beats.Add(beat);
                _totalDuration += beat.PlaybackDuration;
                return true;
            }

            if (beat.GraceType != GraceType.None)
            {
                // grace notes do not break tuplet group, but also do not contribute to them.
                return true;
            }

            if (beat.Voice != Voice
                || IsFull
                || beat.TupletNumerator != Beats[0].TupletNumerator
                || beat.TupletDenominator != Beats[0].TupletDenominator)
            {
                // only same tuplets are potentially accepted
                return false;
            }

            // TBH: I do not really know how the 100% tuplet grouping of Guitar Pro might work
            // it sometimes has really strange rules where notes filling 3 quarters, are considered a full 3:2 tuplet

            // in alphaTab we have now 2 rules where we consider a tuplet full:
            // 1. if all beats have the same length, the tuplet must contain N notes of an N:M tuplet
            // 2. if we have mixed beats, we check if the current set of beats, matches a N:M tuplet
            //    by checking all potential note durations.

            // this logic is very likely not 100% correct but for most cases the tuplets
            // appeared correct.

            if (beat.PlaybackDuration != Beats[0].PlaybackDuration)
            {
                _isEqualLengthTuplet = false;
            }

            Beats.Add(beat);
            _totalDuration += beat.PlaybackDuration;

            if (_isEqualLengthTuplet)
            {
                if (Beats.Count == Beats[0].TupletNumerator)
                {
                    IsFull = true;
                }
            }
            else
            {
                var factor = Beats[0].TupletNumerator / Beats[0].TupletDenominator;
                foreach (var potentialMatch in AllTicks)
                {
                    if (_totalDuration == potentialMatch * factor)
                    {
                        IsFull = true;
                        break;
                    }
                }
            }

            return true;
        }
    }
}
