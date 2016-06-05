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

using System;
using AlphaTab.Collections;
using AlphaTab.Model;

namespace AlphaTab.Audio.Model
{
    public class BarTickLookup
    {
        public int Start { get; set; }
        public int End { get; set; }
        public MasterBar Bar { get; set; }
    }

    public class MidiTickLookup
    {
        private Beat _lastBeat;

        public FastList<BarTickLookup> Bars { get; set; }
        public FastDictionary<int, BarTickLookup> BarLookup { get; set; }

        public MidiTickLookup()
        {
            Bars = new FastList<BarTickLookup>();
            BarLookup = new FastDictionary<int, BarTickLookup>();
        }

        public Beat FindBeat(Track[] tracks, int tick)
        {
            //
            // Global Search

            // binary search within lookup
            var lookup = FindBar(tick);
            if (lookup == null) return null;

            var masterBar = lookup.Bar;

            // look in all staves for a beat that could match
            Beat beat = null;

            for (int t = 0; t < tracks.Length; t++)
            {
                var track = tracks[t];
                for (int s = 0; s < track.Staves.Count; s++)
                {
                    var bar = track.Staves[s].Bars[masterBar.Index];

                    // remap tick to initial bar start
                    tick = (tick - lookup.Start + masterBar.Start);

                    // linear search beat within beats
                    // also look in all voices
                    for (int v = 0; v < bar.Voices.Count; v++)
                    {
                        Beat voiceBeat = null;
                        for (int i = 0, j = bar.Voices[v].Beats.Count; i < j; i++)
                        {
                            var b = bar.Voices[v].Beats[i];

                            var start = b.AbsoluteStart;
                            var end = b.NextBeat != null ? b.NextBeat.AbsoluteStart : start + b.CalculateDuration();

                            // we search for the first beat which 
                            // starts after the tick. 
                            if (start <= tick && tick <= end)
                            {
                                voiceBeat = b;
                                break;
                            }
                        }

                        if (beat == null || (voiceBeat != null && voiceBeat.AbsoluteStart > beat.AbsoluteStart && !voiceBeat.IsEmpty))
                        {
                            beat = voiceBeat;
                        }
                    }
                }
            }

            _lastBeat = beat;


            return _lastBeat;
        }

        private BarTickLookup FindBar(int tick)
        {
            var bottom = 0;
            var top = Bars.Count - 1;

            while (bottom <= top)
            {
                var middle = (top + bottom) / 2;
                var bar = Bars[middle];

                // found?
                if (tick >= bar.Start && tick <= bar.End)
                {
                    return bar;
                }
                // search in lower half 
                if (tick < bar.Start)
                {
                    top = middle - 1;
                }
                // search in upper half
                else
                {
                    bottom = middle + 1;
                }
            }

            return null;
        }

        public int GetMasterBarStart(MasterBar bar)
        {
            if (!BarLookup.ContainsKey(bar.Index))
            {
                return 0;
            }
            return BarLookup[bar.Index].Start;
        }

        public void AddBar(BarTickLookup bar)
        {
            Bars.Add(bar);
            if (!BarLookup.ContainsKey(bar.Bar.Index))
            {
                BarLookup[bar.Bar.Index] = bar;
            }
        }
    }
}
