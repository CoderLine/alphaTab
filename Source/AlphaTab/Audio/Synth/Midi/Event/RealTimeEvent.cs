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
    public enum RealTimeTypeEnum
    {
        MidiClock = 0xF8,
        MidiTick = 0xF9,
        MidiStart = 0xFA,
        MidiContinue = 0xFC,
        MidiStop = 0xFD,
        ActiveSense = 0xFE,
        Reset = 0xFF
    }


    public class RealTimeEvent : MidiEvent
    {
        public override int Channel
        {
            get { return -1; }
        }

        public override MidiEventTypeEnum Command
        {
            get { return (MidiEventTypeEnum) (Message & 0x00000FF); }
        }

        public RealTimeEvent(int delta, byte status, byte data1, byte data2)
            : base(delta, status, data1, data2)
        {
        }
    }
}
