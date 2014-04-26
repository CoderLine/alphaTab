using System.Runtime.CompilerServices;
using AlphaTab.Collections;

namespace AlphaTab.Model
{
    /// <summary>
    /// A voice represents a group of beats 
    /// that can be played during a bar. 
    /// </summary>
    public class Voice
    {
        [IntrinsicProperty]
        public int Index { get; set; }
        [IntrinsicProperty]
        public Bar Bar { get; set; }
        [IntrinsicProperty]
        public FastList<Beat> Beats { get; set; }

        [IntrinsicProperty]
        public Duration? MinDuration { get; set; }
        [IntrinsicProperty]
        public Duration? MaxDuration { get; set; }

        public bool IsEmpty
        {
            get
            {
                return Beats.Count == 0;
            }
        }

        public Voice()
        {
            Beats = new FastList<Beat>();
        }

        public void AddBeat(Beat beat)
        {
            // chaining
            beat.Voice = this;
            beat.Index = Beats.Count;
            Chain(beat);
            Beats.Add(beat);
        }

        private void Chain(Beat beat)
        {
            if (Bar == null) return;
            if (Bar.Index == 0 && beat.Index == 0)
            {
                // very first beat
                beat.PreviousBeat = null; 
            }
            else if (beat.Index == 0)
            {
                // first beat of bar
                var previousVoice = Bar.PreviousBar.Voices[Index];
                beat.PreviousBeat = previousVoice.Beats[previousVoice.Beats.Count - 1];
                beat.PreviousBeat.NextBeat = beat;
            }
            else
            {
                // other beats of bar
                beat.PreviousBeat = Beats[beat.Index - 1];
                beat.PreviousBeat.NextBeat = beat;
            }
        }

        public void AddGraceBeat(Beat beat)
        {
            if (Beats.Count == 0)
            {
                AddBeat(beat);
                return;
            }

            // remove last beat
            var lastBeat = Beats[Beats.Count - 1];
            Beats.RemoveAt(Beats.Count - 1);

            // insert grace beat
            AddBeat(beat);
            // reinsert last beat
            AddBeat(lastBeat);
        }

        public void Finish()
        {
            for (int i = 0, j = Beats.Count; i < j; i++)
            {
                var beat = Beats[i];
                Chain(beat);
                beat.Finish();
                if (MinDuration == null || MinDuration.Value > beat.Duration)
                {
                    MinDuration = beat.Duration;
                }
                if (MaxDuration == null || MaxDuration.Value < beat.Duration)
                {
                    MaxDuration = beat.Duration;
                }
            }
        }
    }
}