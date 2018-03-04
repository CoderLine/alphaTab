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

using AlphaTab.Audio.Synth.Bank.Components.Generators;

namespace AlphaTab.Audio.Synth.Bank.Descriptors
{
    public enum Waveform
    {
        Sine = 0,
        Square = 1,
        Saw = 2,
        Triangle = 3,
        SampleData = 4,
        WhiteNoise = 5
    }

    public class GeneratorDescriptor
    {
        public LoopMode LoopMethod { get; set; }
        public Waveform SamplerType { get; set; }
        public string AssetName { get; set; }
        public double EndPhase { get; set; }
        public double StartPhase { get; set; }
        public double LoopEndPhase { get; set; }
        public double LoopStartPhase { get; set; }
        public double Offset { get; set; }
        public double Period { get; set; }
        public short RootKey { get; set; }
        public short KeyTrack { get; set; }
        public short VelTrack { get; set; }
        public short Tune { get; set; }

        public GeneratorDescriptor()
        {
            LoopMethod = LoopMode.NoLoop;
            SamplerType = Waveform.Sine;
            AssetName = "null";
            EndPhase = -1;
            StartPhase = -1;
            LoopEndPhase = -1;
            LoopStartPhase = -1;
            Offset = 0;
            Period = -1;
            RootKey = -1;
            KeyTrack = 100;
            VelTrack = 0;
            Tune = 0;
        }
    }
}
