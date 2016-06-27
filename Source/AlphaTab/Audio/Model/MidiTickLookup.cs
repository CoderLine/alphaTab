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
using AlphaTab.Platform;

namespace AlphaTab.Audio.Model
{
    public class BeatTickLookup
    {
        public int Start { get; set; }
        public int End { get; set; }
        public Beat Beat { get; set; }
    }

    public class MasterBarTickLookup
    {
        public int Start { get; set; }
        public int End { get; set; }
        public MasterBar MasterBar { get; set; }
        public FastDictionary<int, FastList<BeatTickLookup>> BeatsPerTrack { get; set; }

        public MasterBarTickLookup()
        {
            BeatsPerTrack = new FastDictionary<int, FastList<BeatTickLookup>>();
        }

        public void Finish()
        {
            foreach (var track in BeatsPerTrack)
            {
                BeatsPerTrack[track].Sort((a, b) => a.Start - b.Start);
            }
        }

        public void AddBeat(BeatTickLookup beat)
        {
            var track = beat.Beat.Voice.Bar.Staff.Track.Index;
            if (!BeatsPerTrack.ContainsKey(track))
            {
                BeatsPerTrack[track] = new FastList<BeatTickLookup>();
            }
            BeatsPerTrack[track].Add(beat);
        }
    }

    public class MidiTickLookup
    {
        public FastDictionary<int, MasterBarTickLookup> MasterBarLookup { get; private set; }
        public FastList<MasterBarTickLookup> MasterBars { get; private set; }

        public MidiTickLookup()
        {
            MasterBars = new FastList<MasterBarTickLookup>();
            MasterBarLookup = new FastDictionary<int, MasterBarTickLookup>();
        }

        public void Finish()
        {
            for (int i = 0; i < MasterBars.Count; i++)
            {
                MasterBars[i].Finish();
            }
        }

        public Beat FindBeat(Track[] tracks, int tick)
        {
            // get all beats within the masterbar
            var masterBar = FindMasterBar(tick);
            if (masterBar == null)
            {
                return null;
            }

            BeatTickLookup beat = null;
            for (int t = 0; t < tracks.Length; t++)
            {
                var beats = masterBar.BeatsPerTrack[tracks[t].Index];
                if (beats != null)
                {
                    for (int b = 0; b < beats.Count; b++)
                    {
                        // is the current beat played on the given tick?
                        var currentBeat = beats[b];
                        if (currentBeat.Start <= tick && tick < currentBeat.End)
                        {
                            // take the latest played beat we can find. (most right)
                            if (beat == null || (beat.Start < currentBeat.Start))
                            {
                                beat = beats[b];
                            }
                        }
                        // if we are already past the tick, we can stop searching
                        else if (currentBeat.End > tick)
                        {
                            break;
                        }
                    }
                }
            }

            if (beat == null)
            {
                return null;
            }

            return beat.Beat;
        }

        private MasterBarTickLookup FindMasterBar(int tick)
        {
            var bars = MasterBars;
            var bottom = 0;
            var top = bars.Count - 1;

            while (bottom <= top)
            {
                var middle = (top + bottom) / 2;
                var bar = bars[middle];

                // found?
                if (tick >= bar.Start && tick < bar.End)
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
            if (!MasterBarLookup.ContainsKey(bar.Index))
            {
                return 0;
            }
            return MasterBarLookup[bar.Index].Start;
        }

        public void AddMasterBar(MasterBarTickLookup masterBar)
        {
            MasterBars.Add(masterBar);
            _currentMasterBar = masterBar;
            if (!MasterBarLookup.ContainsKey(masterBar.MasterBar.Index))
            {
                MasterBarLookup[masterBar.MasterBar.Index] = masterBar;
            }
        }

        private MasterBarTickLookup _currentMasterBar;

        public void AddBeat(BeatTickLookup beat)
        {
            _currentMasterBar.AddBeat(beat);
        }
    }
}
