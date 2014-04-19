using System;
using System.Collections.Generic;
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
            for (int i = 0; i < Beats.Count; i++)
            {
                var beat = Beats[i];
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