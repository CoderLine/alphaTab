using System.Collections.Generic;

namespace AlphaTab.Model
{
    /// <summary>
    /// A voice represents a group of beats 
    /// that can be played during a bar. 
    /// </summary>
    public class Voice
    {
        public int Index { get; set; }
        public Bar Bar { get; set; }
        public List<Beat> Beats { get; set; }

        public Duration? MinDuration { get; set; }
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
            Beats = new List<Beat>();
        }

        public void AddBeat(Beat beat)
        {
            // chaining
            if (Bar.Index == 0 && Beats.Count == 0)
            {
                beat.PreviousBeat = null; // very first beat
            }
            else if (Beats.Count == 0)
            {
                var previousVoice = Bar.PreviousBar.Voices[Index];
                beat.PreviousBeat = previousVoice.Beats[previousVoice.Beats.Count - 1];
                beat.PreviousBeat.NextBeat = beat;
            }
            else
            {
                beat.PreviousBeat = Beats[Beats.Count - 1];
                beat.PreviousBeat.NextBeat = beat;
            }
            beat.Voice = this;
            beat.Index = Beats.Count;
            Beats.Add(beat);
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
            foreach (var beat in Beats)
            {
                beat.Finish();
                if (!MinDuration.HasValue || MinDuration.Value > beat.Duration)
                {
                    MinDuration = beat.Duration;
                }
                if (!MaxDuration.HasValue || MaxDuration.Value < beat.Duration)
                {
                    MaxDuration = beat.Duration;
                }
            }
        }
    }
}