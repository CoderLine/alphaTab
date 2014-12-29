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

        public MidiTickLookup()
        {
            Bars = new FastList<BarTickLookup>();
        }

        public Beat FindBeat(Track track, int tick)
        {
            //
            // some heuristics: try last found beat and it's next beat for lookup first

            // try last beat or next beat of last beat first
            if (_lastBeat != null && _lastBeat.NextBeat != null && _lastBeat.Voice.Bar.Track == track)
            {
                // check if tick is between _lastBeat and _lastBeat.nextBeat (still _lastBeat)
                if (tick >= _lastBeat.Start && tick < _lastBeat.NextBeat.Start)
                {
                    return _lastBeat;
                }

                // we need a upper-next beat to check the nextbeat range 
                if (_lastBeat.NextBeat.NextBeat != null && tick >= _lastBeat.NextBeat.Start && tick < _lastBeat.NextBeat.NextBeat.Start)
                {
                    _lastBeat = _lastBeat.NextBeat;
                    return _lastBeat;
                }
            }

            //
            // Global Search

            // binary search within lookup
            var lookup = FindBar(tick);
            if (lookup == null) return null;

            var masterBar = lookup.Bar;
            var bar = track.Bars[masterBar.Index];

            // remap tick to initial bar start
            tick = (tick - lookup.Start + masterBar.Start);

            // linear search beat within beats
            Beat beat = null;
            for (int i = 0, j = bar.Voices[0].Beats.Count; i < j; i++)
            {
                var b = bar.Voices[0].Beats[i];
                // we search for the first beat which 
                // starts after the tick. 
                if (beat == null || b.Start <= tick)
                {
                    beat = b;
                }
                else
                {
                    break;
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
    }
}
