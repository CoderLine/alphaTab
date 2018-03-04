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

using AlphaTab.Audio.Synth.IO;
using AlphaTab.Audio.Synth.Util;
using AlphaTab.IO;
using AlphaTab.Platform;

namespace AlphaTab.Audio.Synth.Sf2
{
    public class SampleHeader
    {
        public string Name { get; set; }
        public int Start { get; private set; }
        public int End { get; private set; }
        public int StartLoop { get; private set; }
        public int EndLoop { get; private set; }
        public int SampleRate { get; private set; }
        public byte RootKey { get; private set; }
        public short Tune { get; private set; }
        public ushort SampleLink { get; private set; }
        public SFSampleLink SoundFontSampleLink { get; private set; }

        public SampleHeader(IReadable input)
        {
            Name = input.Read8BitStringLength(20);
            Start = input.ReadInt32LE();
            End = input.ReadInt32LE();
            StartLoop = input.ReadInt32LE();
            EndLoop = input.ReadInt32LE();
            SampleRate = input.ReadInt32LE();
            RootKey = (byte) input.ReadByte();
            Tune = Platform.Platform.ToInt16(input.ReadByte());
            SampleLink = input.ReadUInt16LE();
            SoundFontSampleLink = (SFSampleLink) input.ReadUInt16LE();
        }
    }
}
