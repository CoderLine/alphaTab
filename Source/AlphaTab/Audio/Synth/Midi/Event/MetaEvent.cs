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
namespace AlphaTab.Audio.Synth.Midi.Event
{
    public enum MetaEventTypeEnum
    {
        SequenceNumber = 0x00,
        TextEvent = 0x01,
        CopyrightNotice = 0x02,
        SequenceOrTrackName = 0x03,
        InstrumentName = 0x04,
        LyricText = 0x05,
        MarkerText = 0x06,
        CuePoint = 0x07,
        PatchName = 0x08,
        PortName = 0x09,
        MidiChannel = 0x20,
        MidiPort = 0x21,
        EndOfTrack = 0x2F,
        Tempo = 0x51,
        SmpteOffset = 0x54,
        TimeSignature = 0x58,
        KeySignature = 0x59,
        SequencerSpecific = 0x7F
    }

    public abstract class MetaEvent : MidiEvent
    {
        public override int Channel
        {
            get { return -1; }
        }

        public override MidiEventTypeEnum Command
        {
            get { return (MidiEventTypeEnum) (Message & 0x00000FF); }
        }

        public int MetaStatus
        {
            get { return Data1; }
        }

        protected MetaEvent(int delta, byte status, byte data1, byte data2)
            : base(delta, status, data1, data2)
        {
        }
    }
}
