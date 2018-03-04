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

namespace AlphaTab.Audio.Synth.Midi
{
    public class MidiTrack
    {
        public byte[] Instruments { get; private set; }
        public byte[] DrumInstruments { get; private set; }
        public byte[] ActiveChannels { get; private set; }
        public MidiEvent[] MidiEvents { get; private set; }

        public int NoteOnCount { get; set; }
        public int EndTime { get; set; }

        public MidiTrack(byte[] instPrograms, byte[] drumPrograms, byte[] activeChannels, MidiEvent[] midiEvents)
        {
            Instruments = instPrograms;
            DrumInstruments = drumPrograms;
            ActiveChannels = activeChannels;
            MidiEvents = midiEvents;

            NoteOnCount = 0;
            EndTime = 0;
        }
    }
}
