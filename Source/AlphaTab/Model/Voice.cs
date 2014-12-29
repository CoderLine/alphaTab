/*
 * This file is part of alphaTab.
 * Copyright (c) 2014, Daniel Kuschny and Contributors, All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or at your option any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */

using AlphaTab.Collections;

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
        public FastList<Beat> Beats { get; set; }

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
            Beats = new FastList<Beat>();
        }

        public static void CopyTo(Voice src, Voice dst)
        {
            dst.Index = src.Index;
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