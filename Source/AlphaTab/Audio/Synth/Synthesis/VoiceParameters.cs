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

using AlphaTab.Audio.Synth.Bank.Components;
using AlphaTab.Audio.Synth.Bank.Components.Generators;
using AlphaTab.Audio.Synth.Ds;
using AlphaTab.Audio.Synth.Util;
using AlphaTab.Utils;

namespace AlphaTab.Audio.Synth.Synthesis
{
    public class VoiceParameters
    {
        private float mix1;
        private float mix2;

        public int Channel { get; set; }
        public int Note { get; set; }
        public int Velocity { get; set; }
        public bool NoteOffPending { get; set; }
        public VoiceStateEnum State { get; set; }
        public int PitchOffset { get; set; }
        public float VolOffset { get; set; }
        public SampleArray BlockBuffer { get; set; }

        public UnionData[] PData { get; set; }
        public SynthParameters SynthParams { get; set; }
        public GeneratorParameters[] GeneratorParams { get; set; }
        public Envelope[] Envelopes { get; set; }
        public Filter[] Filters { get; set; }
        public Lfo[] Lfos { get; set; }

        public float CombinedVolume
        {
            get { return mix1 + mix2; }
        }

        public VoiceParameters()
        {
            BlockBuffer = new SampleArray(SynthConstants.DefaultBlockSize);
            //create default number of each component
            PData = new UnionData[SynthConstants.MaxVoiceComponents];
            GeneratorParams = new GeneratorParameters[SynthConstants.MaxVoiceComponents];
            Envelopes = new Envelope[SynthConstants.MaxVoiceComponents];
            Filters = new Filter[SynthConstants.MaxVoiceComponents];
            Lfos = new Lfo[SynthConstants.MaxVoiceComponents];
            //initialize each component
            for (int x = 0; x < SynthConstants.MaxVoiceComponents; x++)
            {
                GeneratorParams[x] = new GeneratorParameters();
                Envelopes[x] = new Envelope();
                Filters[x] = new Filter();
                Lfos[x] = new Lfo();
            }
        }

        public void Reset()
        {
            NoteOffPending = false;
            PitchOffset = 0;
            VolOffset = 0;
            for (int i = 0; i < PData.Length; i++)
            {
                PData[i] = new UnionData();
            }
            mix1 = 0;
            mix2 = 0;
        }

        public void MixMonoToMonoInterp(int startIndex, float volume)
        {
            float inc = (volume - mix1) / SynthConstants.DefaultBlockSize;
            for (int i = 0; i < BlockBuffer.Length; i++)
            {
                mix1 += inc;
                SynthParams.Synth.SampleBuffer[startIndex + i] += BlockBuffer[i] * mix1;
            }
            mix1 = volume;
        }

        public void MixMonoToStereoInterp(int startIndex, float leftVol, float rightVol)
        {
            float inc_l = (leftVol - mix1) / SynthConstants.DefaultBlockSize;
            float inc_r = (rightVol - mix2) / SynthConstants.DefaultBlockSize;
            for (int i = 0; i < BlockBuffer.Length; i++)
            {
                mix1 += inc_l;
                mix2 += inc_r;
                SynthParams.Synth.SampleBuffer[startIndex] += BlockBuffer[i] * mix1;
                SynthParams.Synth.SampleBuffer[startIndex + 1] += BlockBuffer[i] * mix2;
                startIndex += 2;
            }
            mix1 = leftVol;
            mix2 = rightVol;
        }

        public void MixStereoToStereoInterp(int startIndex, float leftVol, float rightVol)
        {
            float inc_l = (leftVol - mix1) / SynthConstants.DefaultBlockSize;
            float inc_r = (rightVol - mix2) / SynthConstants.DefaultBlockSize;
            for (int i = 0; i < BlockBuffer.Length; i++)
            {
                mix1 += inc_l;
                mix2 += inc_r;
                SynthParams.Synth.SampleBuffer[startIndex + i] += BlockBuffer[i] * mix1;
                i++;
                SynthParams.Synth.SampleBuffer[startIndex + i] += BlockBuffer[i] * mix2;
            }
            mix1 = leftVol;
            mix2 = rightVol;
        }
    }
}
