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

using AlphaTab.IO;

namespace AlphaTab.Audio.Synth.Midi.Event
{
    public class SystemExclusiveEvent : SystemCommonEvent
    {
        public byte[] Data { get; private set; }


        public int ManufacturerId
        {
            get
            {
                return Message >> 8;
            }
        }

        public SystemExclusiveEvent(int delta, byte status, short id, byte[] data)
            : base(delta, status, (byte)(id & 0x00FF), (byte)(id >> 8))
        {
            Data = data;
        }

        public override void WriteTo(ByteBuffer s)
        {
            s.WriteByte(0xF0);
            var l = Data.Length + 2;
            s.WriteByte((byte)ManufacturerId);
            var b = new[]{
                (byte)((l >> 24) & 0xFF), (byte)((l >> 16) & 0xFF),
                (byte)((l >> 8) & 0xFF), (byte)((l >> 0) & 0xFF)
            };
            s.Write(b, 0, b.Length);
            s.WriteByte(0xF7);
        }
    }
}
