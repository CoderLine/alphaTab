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

namespace AlphaTab.Audio.Synth.Bank.Components
{
    public enum EnvelopeState
    {
        Delay = 0,
        Attack = 1,
        Hold = 2,
        Decay = 3,
        Sustain = 4,
        Release = 5,
        None = 6
    }

    public class Envelope
    {
        private readonly EnvelopeStage[] _stages;
        private int _index;
        private EnvelopeStage _stage;

        public float Value { get; set; }
        public EnvelopeState CurrentStage { get; private set; }
        public float Depth { get; set; }

        public Envelope()
        {
            Value = 0;
            Depth = 0;
            _stages = new EnvelopeStage[7];
            for (int x = 0; x < _stages.Length; x++)
            {
                _stages[x] = new EnvelopeStage();
                _stages[x].Graph = Tables.EnvelopeTables(0);
            }
            _stages[3].Reverse = true;
            _stages[5].Reverse = true;
            _stages[6].Time = 100000000;

            CurrentStage = EnvelopeState.Delay;
            _stage = _stages[(int)CurrentStage];
        }

        public void QuickSetupSf2(int sampleRate, int note, short keyNumToHold, short keyNumToDecay, bool isVolumeEnvelope, EnvelopeDescriptor envelopeInfo)
        {
            Depth = envelopeInfo.Depth;
            // Delay
            _stages[0].Offset = 0;
            _stages[0].Scale = 0;
            _stages[0].Time = Math.Max(0, (int)(sampleRate * (envelopeInfo.DelayTime)));
            // Attack
            _stages[1].Offset = envelopeInfo.StartLevel;
            _stages[1].Scale = envelopeInfo.PeakLevel - envelopeInfo.StartLevel;
            _stages[1].Time = Math.Max(0, (int)(sampleRate * (envelopeInfo.AttackTime)));
            _stages[1].Graph = Tables.EnvelopeTables(envelopeInfo.AttackGraph);
            // Hold
            _stages[2].Offset = 0;
            _stages[2].Scale = envelopeInfo.PeakLevel;
            _stages[2].Time = (int) Math.Max(0, sampleRate * (envelopeInfo.HoldTime) * Math.Pow(2, ((60 - note) * keyNumToHold) / 1200.0));
            // Decay
            _stages[3].Offset = envelopeInfo.SustainLevel;
            _stages[3].Scale = envelopeInfo.PeakLevel - envelopeInfo.SustainLevel;
            if (envelopeInfo.SustainLevel == envelopeInfo.PeakLevel)
                _stages[3].Time = 0;
            else
                _stages[3].Time = Math.Max(0, (int)(sampleRate * (envelopeInfo.DecayTime) * Math.Pow(2, ((60 - note) * keyNumToDecay) / 1200.0)));
            _stages[3].Graph = Tables.EnvelopeTables(envelopeInfo.DecayGraph);
            // Sustain
            _stages[4].Offset = 0;
            _stages[4].Scale = envelopeInfo.SustainLevel;
            _stages[4].Time = (int) (sampleRate * envelopeInfo.SustainTime);
            // Release
            _stages[5].Scale = _stages[3].Time == 0 && _stages[4].Time == 0 ? envelopeInfo.PeakLevel : _stages[4].Scale;
            if (isVolumeEnvelope)
            {
                _stages[5].Offset = -100;
                _stages[5].Scale += 100;
                _stages[6].Scale = -100;
            }
            else
            {
                _stages[5].Offset = 0;
                _stages[6].Scale = 0;
            }
            _stages[5].Time = Math.Max(0, (int)(sampleRate * (envelopeInfo.ReleaseTime)));
            _stages[5].Graph = Tables.EnvelopeTables(envelopeInfo.ReleaseGraph); 

            _index = 0;
            Value = 0;
            CurrentStage = EnvelopeState.Delay;
            while (_stages[(int)CurrentStage].Time == 0)
            {
                CurrentStage++;
            }
            _stage = _stages[(int)CurrentStage];
        }

        public void Increment(int samples)
        {
            do
            {
                var neededSamples = _stage.Time - _index;
                if (neededSamples > samples)
                {
                    _index += samples;
                    samples = 0;
                }
                else
                {
                    _index = 0;
                    if (CurrentStage != EnvelopeState.None)
                    {
                        do
                        {
                            _stage = _stages[(int)++CurrentStage];
                        } while (_stage.Time == 0);
                    }
                    samples -= neededSamples;
                }
            } while (samples > 0);

            var i = (int)(_stage.Graph.Length * (_index / (double)_stage.Time));
            if (_stage.Reverse)
                Value = (1f - _stage.Graph[i]) * _stage.Scale + _stage.Offset;
            else
                Value = _stage.Graph[i] * _stage.Scale + _stage.Offset;
        }

        public void Release(double lowerLimit)
        {
            if (Value <= lowerLimit)
            {
                _index = 0;
                CurrentStage = EnvelopeState.None;
                _stage = _stages[(int)CurrentStage];
            }
            else if (CurrentStage < EnvelopeState.Release)
            {
                _index = 0;
                CurrentStage = EnvelopeState.Release;
                _stage = _stages[(int)CurrentStage];
                _stage.Scale = Value;
            }
        }

        public void ReleaseSf2VolumeEnvelope()
        {
            if (Value <= -100)
            {
                _index = 0;
                CurrentStage = EnvelopeState.None;
                _stage = _stages[(int)CurrentStage];
            }
            else if (CurrentStage < EnvelopeState.Release)
            {
                _index = 0;
                CurrentStage = EnvelopeState.Release;
                _stage = _stages[(int)CurrentStage];
                _stage.Offset = -100;
                _stage.Scale = 100 + Value;
            }
        }
    }

    public class EnvelopeStage
    {
        public int Time { get; set; }
        public SampleArray Graph { get; set; }
        public float Scale { get; set; }
        public float Offset { get; set; }
        public bool Reverse { get; set; }

        public EnvelopeStage()
        {
            Time = 0;
            Graph = null;
            Scale = 0;
            Offset = 0;
            Reverse = false;
        }
    }
}
