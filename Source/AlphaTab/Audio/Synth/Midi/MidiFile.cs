/*
 * This file is part of alphaSynth.
 * Copyright (c) 2014, T3866, PerryCodes, Daniel Kuschny and Contributors, All rights reserved.
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

using AlphaTab.Audio.Synth.Midi.Event;
using AlphaTab.Collections;

namespace AlphaTab.Audio.Synth.Midi
{
    public class MidiFile
    {
        public int Division { get; set; }
        public MidiTrackFormat TrackFormat { get; set; }
        public MidiTimeFormat TimingStandard { get; set; }
        public FastList<MidiEvent> Events { get; private set; }

        public MidiFile()
        {
            Division = MidiUtils.QuarterTime;
            TrackFormat = MidiTrackFormat.SingleTrack;
            TimingStandard = MidiTimeFormat.TicksPerBeat;
            Events = new FastList<MidiEvent>();
        }

        public void AddEvent(MidiEvent e)
        {
            if (Events.Count == 0)
            {
                Events.Add(e);
            }
            else
            {
                var insertPos = Events.Count;
                while (insertPos > 0)
                {
                    var prevItem = Events[insertPos - 1];
                    if (prevItem.Tick > e.Tick)
                    {
                        insertPos--;
                    }
                    else
                    {
                        break;
                    }
                }

                Events.InsertAt(insertPos, e);
            }
        }
    }

    public enum MidiTrackFormat
    {
        SingleTrack = 0,
        MultiTrack = 1,
        MultiSong = 2
    }

    public enum MidiTimeFormat
    {
        TicksPerBeat = 0,
        FramesPerSecond = 1
    }
}
