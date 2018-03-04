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
    public class ModulatorType
    {
        private ushort _controllerSource;

        public PolarityEnum Polarity { get; set; }
        public DirectionEnum Direction { get; set; }
        public int SourceType { get; set; }
        public bool IsMidiContinuousController { get; private set; }

        public ModulatorType(IReadable input)
        {
            var raw = input.ReadUInt16LE();

            Polarity = (raw & 0x0200) == 0x0200 ? PolarityEnum.Bipolar : PolarityEnum.Unipolar;
            Direction = (raw & 0x0100) == 0x0100 ? DirectionEnum.MaxToMin : DirectionEnum.MinToMax;

            IsMidiContinuousController = ((raw & 0x0080) == 0x0080);
            SourceType = ((raw & (0xFC00)) >> 10);
            _controllerSource = Platform.Platform.ToUInt16((raw & 0x007F));
        }
    }
}
