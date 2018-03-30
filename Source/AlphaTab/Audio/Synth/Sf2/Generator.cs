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

using AlphaTab.Audio.Synth.Util;
using AlphaTab.IO;
using AlphaTab.Platform;

namespace AlphaTab.Audio.Synth.Sf2
{
    public class Generator
    {
        private ushort _rawAmount;

        public GeneratorEnum GeneratorType { get; set; }

        public short AmountInt16
        {
            get { return Platform.Platform.ToInt16(_rawAmount); }
            set { _rawAmount = Platform.Platform.ToUInt16(value); }
        }

        public short LowByteAmount
        {
            get { return Platform.Platform.ToUInt8(_rawAmount & 0x00FF); }
            set { _rawAmount = Platform.Platform.ToUInt16((_rawAmount & 0xFF00) + Platform.Platform.ToUInt8(value)); }
        }

        public short HighByteAmount
        {
            get { return Platform.Platform.ToUInt8((_rawAmount & 0xFF00) >> 8); }
            set { _rawAmount = Platform.Platform.ToUInt16((_rawAmount & 0x00FF) + (Platform.Platform.ToUInt8(value) << 8)); }
        }

        public Generator(IReadable input)
        {
            GeneratorType = (GeneratorEnum)input.ReadUInt16LE();
            _rawAmount = input.ReadUInt16LE();
        }
    }
}
