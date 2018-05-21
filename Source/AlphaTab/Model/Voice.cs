/*
 * This file is part of alphaTab.
 * Copyright © 2018, Daniel Kuschny and Contributors, All rights reserved.
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

using System;
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

        public bool IsEmpty
        {
            get; set;
          
        }

        public Voice()
        {
            Beats = new FastList<Beat>();
            IsEmpty = true;
        }

        public static void CopyTo(Voice src, Voice dst)
        {
            dst.Index = src.Index;
            dst.IsEmpty = src.IsEmpty;
        }

        public void InsertBeat(Beat after, Beat newBeat)
        {
            newBeat.NextBeat = after.NextBeat;
            if (newBeat.NextBeat != null)
            {
                newBeat.NextBeat.PreviousBeat = newBeat;
            }
            newBeat.PreviousBeat = after;
            newBeat.Voice = this;
            after.NextBeat = newBeat;
            Beats.InsertAt(after.Index + 1, newBeat);
        }


        public void AddBeat(Beat beat)
        {
            beat.Voice = this;
            beat.Index = Beats.Count;
            Beats.Add(beat);
            if (!beat.IsEmpty)
            {
                IsEmpty = false;
            }
        }

        private void Chain(Beat beat)
        {
            if (Bar == null) return;

            if (beat.Index < Beats.Count - 1)
            {
                beat.NextBeat = Beats[beat.Index + 1];
                beat.NextBeat.PreviousBeat = beat;
            }
            else if (beat.Index == beat.Voice.Beats.Count - 1 && beat.Voice.Bar.NextBar != null)
            {
                var nextVoice = Bar.NextBar.Voices[Index];
                if (nextVoice.Beats.Count > 0)
                {
                    beat.NextBeat = nextVoice.Beats[0];
                    beat.NextBeat.PreviousBeat = beat;
                }
                else
                {
                    beat.NextBeat.PreviousBeat = beat;
                }
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

            IsEmpty = false;
        }

        public void Finish(Settings settings)
        {
            for (var index = 0; index < Beats.Count; index++)
            {
                var beat = Beats[index];
                beat.Index = index;
                Chain(beat);
            }
            for (var index = 0; index < Beats.Count; index++)
            {
                var beat = Beats[index];
                beat.Index = index;
                beat.Finish(settings);
            }
        }
    }
}