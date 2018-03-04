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

using System;
using AlphaTab.Audio.Synth.Bank.Descriptors;
using AlphaTab.Audio.Synth.Util;

namespace AlphaTab.Audio.Synth.Bank.Components.Generators
{
    public class SineGenerator : Generator
    {
        public SineGenerator(GeneratorDescriptor description)
            : base(description)
        {
            if (EndPhase < 0)
                EndPhase = SynthConstants.TwoPi;
            if (StartPhase < 0)
                StartPhase = 0;
            if (LoopEndPhase < 0)
                LoopEndPhase = EndPhase;
            if (LoopStartPhase < 0)
                LoopStartPhase = StartPhase;
            if (Period < 0)
                Period = SynthConstants.TwoPi;
            if (RootKey < 0)
                RootKey = 69;
            Frequency = 440;
        }

        public override float GetValue(double phase)
        {
            return (float)Math.Sin(phase);
        }
    }
}
