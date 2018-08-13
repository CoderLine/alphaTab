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
using AlphaTab.Audio.Synth.Bank.Descriptors;

namespace AlphaTab.Audio.Synth.Bank.Components
{
    enum LfoState
    {
        Delay = 0,
        Sustain = 1
    }

    class Lfo
    {
        private double _phase;
        private double _increment;
        private int _delayTime;
        private Generators.Generator _generator;

        public float Frequency { get; private set; }
        public LfoState CurrentState { get; private set; }
        public double Value { get; set; }
        public double Depth { get; set; }

        public Lfo()
        {
            CurrentState = LfoState.Delay;
            _generator = DefaultGenerators.DefaultSine;
            _delayTime = 0;
            _increment = 0;
            _phase = 0;
            Frequency = 0;
            CurrentState = 0;
            Value = 0;
            Depth = 0;
        }

        public void QuickSetup(int sampleRate, LfoDescriptor lfoInfo)
        {
            _generator = lfoInfo.Generator;
            _delayTime = (int)(sampleRate * lfoInfo.DelayTime);
            Frequency = lfoInfo.Frequency;
            _increment = _generator.Period * Frequency / sampleRate;
            Depth = lfoInfo.Depth;
            Reset();
        }

        public void Increment(int amount)
        {
            if (CurrentState == LfoState.Delay)
            {
                _phase -= amount;
                while (_phase <= 0.0)
                {
                    _phase = _generator.LoopStartPhase + _increment * -_phase;
                    Value = _generator.GetValue(_phase);
                    CurrentState = LfoState.Sustain;
                }
            }
            else
            {
                _phase += _increment * amount;
                while (_phase >= _generator.LoopEndPhase)
                {
                    _phase = _generator.LoopStartPhase + (_phase - _generator.LoopEndPhase) % (_generator.LoopEndPhase - _generator.LoopStartPhase);
                }
                Value = _generator.GetValue(_phase);
            }
        }

        public void Reset()
        {
            Value = 0;
            if (_delayTime > 0)
            {
                _phase = _delayTime;
                CurrentState = LfoState.Delay;
            }
            else
            {
                _phase = 0.0f;
                CurrentState = LfoState.Sustain;
            }
        }
    }
}
