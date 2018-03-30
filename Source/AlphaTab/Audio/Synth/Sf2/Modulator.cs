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

namespace AlphaTab.Audio.Synth.Sf2
{
    public class Modulator
    {
        private ModulatorType _sourceModulationData;
        private int _destinationGenerator;
        private short _amount;
        private ModulatorType _sourceModulationAmount;
        private int _sourceTransform;

        public Modulator(IReadable input)
        {
            _sourceModulationData = new ModulatorType(input);
            _destinationGenerator = input.ReadUInt16LE();
            _amount = input.ReadInt16LE();
            _sourceModulationAmount = new ModulatorType(input);
            _sourceTransform = input.ReadUInt16LE();
        }
    }
}
