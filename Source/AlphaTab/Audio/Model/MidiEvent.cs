/*
 * This file is part of alphaTab.
 * Copyright © 2017, Daniel Kuschny and Contributors, All rights reserved.
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

using AlphaTab.IO;

namespace AlphaTab.Audio.Model
{
    /// <summary>
    /// A midi event is a timed midi message. 
    /// </summary>
    public class MidiEvent
    {
        public MidiTrack Track { get; set; }
        public int Tick { get; set; }
        public MidiMessage Message { get; set; }
        public MidiEvent NextEvent { get; set; }
        public MidiEvent PreviousEvent { get; set; }

        public int DeltaTicks
        {
            get
            {
                return PreviousEvent == null ? 0 : Tick - PreviousEvent.Tick;
            }
        }

        public MidiEvent(int tick, MidiMessage message)
        {
            Tick = tick;
            Message = message;
        }

        public void WriteTo(IWriteable s)
        {
            WriteVariableInt(s, DeltaTicks);
            Message.WriteTo(s);
        }

        private void WriteVariableInt(IWriteable s, int value)
        {
            var array = new byte[4];

            var n = 0;
            do
            {
                array[n++] = (byte)((value & 0x7F) & 0xFF);
                value >>= 7;
            } while (value > 0);

            while (n > 0)
            {
                n--;
                if (n > 0)
                    s.WriteByte((byte) (array[n] | 0x80));
                else
                    s.WriteByte(array[n]);
            }
        }
    }
}
