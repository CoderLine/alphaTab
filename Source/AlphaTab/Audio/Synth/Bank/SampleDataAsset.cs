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
using AlphaTab.Audio.Synth.Sf2;

namespace AlphaTab.Audio.Synth.Bank
{
    public class SampleDataAsset
    {
        public string Name { get; set; }
        public int Channels { get; set; }
        public int SampleRate { get; set; }
        public short RootKey { get; set; }
        public short Tune { get; set; }
        public float Start { get; set; }
        public float End { get; set; }
        public float LoopStart { get; set; }
        public float LoopEnd { get; set; }
        public PcmData SampleData { get; set; }

        public SampleDataAsset(SampleHeader sample, SoundFontSampleData sampleData)
        {
            Channels = 1;

            Name = sample.Name;
            SampleRate = sample.SampleRate;
            RootKey = sample.RootKey;
            Tune = sample.Tune;
            Start = sample.Start;
            End = sample.End;
            LoopStart = sample.StartLoop;
            LoopEnd = sample.EndLoop;
            if ((sample.SoundFontSampleLink & SFSampleLink.OggVobis) != 0)
            {
                throw new Exception("Ogg Vobis encoded soundfonts not supported");
            }
            else
            {
                SampleData = PcmData.Create(sampleData.BitsPerSample, sampleData.SampleData, true);
            }
        }
    }
}
