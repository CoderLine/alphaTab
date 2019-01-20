using AlphaTab.Audio;
using AlphaTab.Collections;

namespace AlphaTab.Model
{
    /// <summary>
    /// Represents a list of beats that are grouped within the same tuplet.
    /// </summary>
    public class TupletGroup
    {
        /// <summary>
        /// Gets or sets the list of beats contained in this group.
        /// </summary>
        public FastList<Beat> Beats { get; set; }
        /// <summary>
        /// Gets or sets the voice this group belongs to.
        /// </summary>
        public Voice Voice { get; set; }
        
        /// <summary>
        /// Gets the absolute midi tick start when this tuplet group starts.
        /// </summary>
        public int TupletStart { get; set; }
        /// <summary>
        /// Gets the absolute midi tick start when this tuplet group ends.
        /// </summary>
        public int TupletEnd { get; set; }

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

        private static readonly int FullThreshold = Duration.OneHundredTwentyEighth.ToTicks();
        internal bool Check(Beat beat)
        {

            if (Beats.Count == 0)
            {
                // calculate the range for which the tuplet will be valid. ("N notes sound like M")
                // via this time range check we can have also tuplets with different durations like: 
                // /-----4:2-----\  
                // 4 2 16 16 16 16 
                // - the tuplet is filled fully according to the duration and displayed accordingly
                //
                // while with a pure counting we would have
                // /--4:2--\  4:2 4:2 
                // 4 2 16 16  16  16 
                // - the first tuplet would be treated as full because there are 4 notes in it, but 
                //   duration wise it does not fill 2 quarter notes. 
                TupletStart = beat.AbsolutePlaybackStart;
                var beatDuration = beat.PlaybackDuration;
                if (beat.GraceType == GraceType.None)
                {
                    beatDuration = MidiUtils.RemoveTuplet(beatDuration, beat.TupletNumerator, beat.TupletDenominator);
                }
                TupletEnd = TupletStart + beatDuration * beat.TupletDenominator;
            }
            else if (beat.Voice != Voice || IsFull
                     || beat.TupletNumerator != Beats[0].TupletNumerator || beat.TupletDenominator != Beats[0].TupletDenominator 
                     || beat.AbsolutePlaybackStart > TupletEnd)
            {
                return false;
            }
            Beats.Add(beat);
            var beatEnd = beat.AbsolutePlaybackStart + beat.PlaybackDuration;
            if (TupletEnd < beatEnd + FullThreshold)
            {
                IsFull = true;
            }
            return true;
        }
    }
}
