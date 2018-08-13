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
using AlphaTab.Audio.Synth.Ds;
using AlphaTab.Audio.Synth.Util;

namespace AlphaTab.Audio.Synth.Bank.Components.Generators
{
    enum Interpolation
    {
        None = 0,
        Linear = 1,
        Cosine = 2,
        CubicSpline = 3,
        Sinc = 4
    }

    class SampleGenerator : Generator
    {
        public PcmData Samples { get; set; }

        public SampleGenerator()
            : base(new GeneratorDescriptor())
        {
        }

        public override float GetValue(double phase)
        {
            return Samples[(int)(phase)];
        }

        public void DiscardValues(GeneratorParameters generatorParams, int samples, double increment)
        {
            int proccessed = 0;
            do
            {
                int samplesAvailable = (int)Math.Ceiling((generatorParams.CurrentEnd - generatorParams.Phase) / increment);
                if (samplesAvailable > samples - proccessed)
                {
                    InterpolateSilent(generatorParams, increment, proccessed, samples);
                    return; //proccessed = blockBuffer.Length;
                }
                else
                {
                    int endProccessed = proccessed + samplesAvailable;
                    InterpolateSilent(generatorParams, increment, proccessed, endProccessed);
                    proccessed = endProccessed;
                    switch (generatorParams.CurrentState)
                    {
                        case GeneratorState.PreLoop:
                            generatorParams.CurrentStart = LoopStartPhase;
                            generatorParams.CurrentEnd = LoopEndPhase;
                            generatorParams.CurrentState = GeneratorState.Loop;
                            break;
                        case GeneratorState.Loop:
                            generatorParams.Phase += generatorParams.CurrentStart - generatorParams.CurrentEnd;
                            break;
                        case GeneratorState.PostLoop:
                            generatorParams.CurrentState = GeneratorState.Finished;
                            break;
                    }
                }
            }
            while (proccessed < samples);
        }

        public override void GetValues(GeneratorParameters generatorParams, SampleArray blockBuffer, double increment)
        {
            int proccessed = 0;
            do
            {
                int samplesAvailable = (int)Math.Ceiling((generatorParams.CurrentEnd - generatorParams.Phase) / increment);
                if (samplesAvailable > blockBuffer.Length - proccessed)
                {
                    Interpolate(generatorParams, blockBuffer, increment, proccessed, blockBuffer.Length);
                    return; //proccessed = blockBuffer.Length;
                }
                else
                {
                    int endProccessed = proccessed + samplesAvailable;
                    Interpolate(generatorParams, blockBuffer, increment, proccessed, endProccessed);
                    proccessed = endProccessed;
                    switch (generatorParams.CurrentState)
                    {
                        case GeneratorState.PreLoop:
                            generatorParams.CurrentStart = LoopStartPhase;
                            generatorParams.CurrentEnd = LoopEndPhase;
                            generatorParams.CurrentState = GeneratorState.Loop;
                            break;
                        case GeneratorState.Loop:
                            generatorParams.Phase += generatorParams.CurrentStart - generatorParams.CurrentEnd;
                            break;
                        case GeneratorState.PostLoop:
                            generatorParams.CurrentState = GeneratorState.Finished;
                            while (proccessed < blockBuffer.Length)
                                blockBuffer[proccessed++] = 0f;
                            break;
                    }
                }
            }
            while (proccessed < blockBuffer.Length);
        }


        private void InterpolateSilent(GeneratorParameters generatorParams, double increment, int start, int end)
        {
            double _end = generatorParams.CurrentState == GeneratorState.Loop
                ? this.LoopEndPhase - 1
                : this.EndPhase - 1;

            // TODO: can be directly calculated
            while (start < end && generatorParams.Phase < _end) //do this until we reach an edge case or fill the buffer
            {
                generatorParams.Phase += increment;
                start++;
            }

            while (start < end) //edge case, if in loop wrap to loop start else use duplicate sample
            {
                generatorParams.Phase += increment;
                start++;
            }
        }

        private void Interpolate(GeneratorParameters generatorParams, SampleArray blockBuffer, double increment, int start, int end)
        {
            switch (SynthConstants.InterpolationMode)
            {
                case Interpolation.Linear:
                    #region Linear
                    {
                        double _end = generatorParams.CurrentState == GeneratorState.Loop ? this.LoopEndPhase - 1 : this.EndPhase - 1;
                        int index;
                        float s1, s2, mu;
                        while (start < end && generatorParams.Phase < _end)//do this until we reach an edge case or fill the buffer
                        {
                            index = (int)generatorParams.Phase;
                            s1 = Samples[index];
                            s2 = Samples[index + 1];
                            mu = (float)(generatorParams.Phase - index);
                            blockBuffer[start++] = s1 + mu * (s2 - s1);
                            generatorParams.Phase += increment;
                        }
                        while (start < end)//edge case, if in loop wrap to loop start else use duplicate sample
                        {
                            index = (int)generatorParams.Phase;
                            s1 = Samples[index];
                            if (generatorParams.CurrentState == GeneratorState.Loop)
                                s2 = Samples[(int)generatorParams.CurrentStart];
                            else
                                s2 = s1;
                            mu = (float)(generatorParams.Phase - index);
                            blockBuffer[start++] = s1 + mu * (s2 - s1);
                            generatorParams.Phase += increment;
                        }
                    }
                    #endregion
                    break;
                case Interpolation.Cosine:
                    #region Cosine
                    {
                        double _end = generatorParams.CurrentState == GeneratorState.Loop ? this.LoopEndPhase - 1 : this.EndPhase - 1;
                        int index;
                        float s1, s2, mu;
                        while (start < end && generatorParams.Phase < _end)//do this until we reach an edge case or fill the buffer
                        {
                            index = (int)generatorParams.Phase;
                            s1 = Samples[index];
                            s2 = Samples[index + 1];
                            mu = (1f - (float)Math.Cos((generatorParams.Phase - index) * Math.PI)) * 0.5f;
                            blockBuffer[start++] = s1 * (1f - mu) + s2 * mu;
                            generatorParams.Phase += increment;
                        }
                        while (start < end)//edge case, if in loop wrap to loop start else use duplicate sample
                        {
                            index = (int)generatorParams.Phase;
                            s1 = Samples[index];
                            if (generatorParams.CurrentState == GeneratorState.Loop)
                                s2 = Samples[(int)generatorParams.CurrentStart];
                            else
                                s2 = s1;
                            mu = (1f - (float)Math.Cos((generatorParams.Phase - index) * Math.PI)) * 0.5f;
                            blockBuffer[start++] = s1 * (1f - mu) + s2 * mu;
                            generatorParams.Phase += increment;
                        }
                    }
                    #endregion
                    break;
                case Interpolation.CubicSpline:
                    #region CubicSpline
                    {
                        double _end = generatorParams.CurrentState == GeneratorState.Loop ? this.LoopStartPhase + 1 : this.StartPhase + 1;
                        int index;
                        float s0, s1, s2, s3, mu;
                        while (start < end && generatorParams.Phase < _end)//edge case, wrap to endpoint or duplicate sample
                        {
                            index = (int)generatorParams.Phase;
                            if (generatorParams.CurrentState == GeneratorState.Loop)
                                s0 = Samples[(int)generatorParams.CurrentEnd - 1];
                            else
                                s0 = Samples[index];
                            s1 = Samples[index];
                            s2 = Samples[index + 1];
                            s3 = Samples[index + 2];
                            mu = (float)(generatorParams.Phase - index);
                            blockBuffer[start++] = ((-0.5f * s0 + 1.5f * s1 - 1.5f * s2 + 0.5f * s3) * mu * mu * mu + (s0 - 2.5f * s1 + 2f * s2 - 0.5f * s3) * mu * mu + (-0.5f * s0 + 0.5f * s2) * mu + (s1));
                            generatorParams.Phase += increment;
                        }
                        _end = generatorParams.CurrentState == GeneratorState.Loop ? this.LoopEndPhase - 2 : this.EndPhase - 2;
                        while (start < end && generatorParams.Phase < _end)
                        {
                            index = (int)generatorParams.Phase;
                            s0 = Samples[index - 1];
                            s1 = Samples[index];
                            s2 = Samples[index + 1];
                            s3 = Samples[index + 2];
                            mu = (float)(generatorParams.Phase - index);
                            blockBuffer[start++] = ((-0.5f * s0 + 1.5f * s1 - 1.5f * s2 + 0.5f * s3) * mu * mu * mu + (s0 - 2.5f * s1 + 2f * s2 - 0.5f * s3) * mu * mu + (-0.5f * s0 + 0.5f * s2) * mu + (s1));
                            generatorParams.Phase += increment;
                        }
                        _end += 1;
                        while (start < end)//edge case, wrap to startpoint or duplicate sample
                        {
                            index = (int)generatorParams.Phase;
                            s0 = Samples[index - 1];
                            s1 = Samples[index];
                            if (generatorParams.Phase < _end)
                            {
                                s2 = Samples[index + 1];
                                if (generatorParams.CurrentState == GeneratorState.Loop)
                                    s3 = Samples[(int)generatorParams.CurrentStart];
                                else
                                    s3 = s2;
                            }
                            else
                            {
                                if (generatorParams.CurrentState == GeneratorState.Loop)
                                {
                                    s2 = Samples[(int)generatorParams.CurrentStart];
                                    s3 = Samples[(int)generatorParams.CurrentStart + 1];
                                }
                                else
                                {
                                    s2 = s1;
                                    s3 = s1;
                                }
                            }
                            mu = (float)(generatorParams.Phase - index);
                            blockBuffer[start++] = ((-0.5f * s0 + 1.5f * s1 - 1.5f * s2 + 0.5f * s3) * mu * mu * mu + (s0 - 2.5f * s1 + 2f * s2 - 0.5f * s3) * mu * mu + (-0.5f * s0 + 0.5f * s2) * mu + (s1));
                            generatorParams.Phase += increment;
                        }
                    }
                    #endregion
                    break;
                default:
                    #region None
                    {
                        while (start < end)
                        {
                            blockBuffer[start++] = Samples[(int)generatorParams.Phase];
                            generatorParams.Phase += increment;
                        }
                    }
                    #endregion
                    break;
            }
        }
    }
}
