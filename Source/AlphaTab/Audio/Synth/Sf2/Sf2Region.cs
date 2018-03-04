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
namespace AlphaTab.Audio.Synth.Sf2
{
    public class Sf2Region
    {
        public short[] Generators { get; set; }

        public Sf2Region()
        {
            Generators = new short[61];
        }

        public void ApplyDefaultValues()
        {
            Generators[(int)GeneratorEnum.StartAddressOffset] = 0;
            Generators[(int)GeneratorEnum.EndAddressOffset] = 0;
            Generators[(int)GeneratorEnum.StartLoopAddressOffset] = 0;
            Generators[(int)GeneratorEnum.EndLoopAddressOffset] = 0;
            Generators[(int)GeneratorEnum.StartAddressCoarseOffset] = 0;
            Generators[(int)GeneratorEnum.ModulationLFOToPitch] = 0;
            Generators[(int)GeneratorEnum.VibratoLFOToPitch] = 0;
            Generators[(int)GeneratorEnum.ModulationEnvelopeToPitch] = 0;
            Generators[(int)GeneratorEnum.InitialFilterCutoffFrequency] = 13500;
            Generators[(int)GeneratorEnum.InitialFilterQ] = 0;
            Generators[(int)GeneratorEnum.ModulationLFOToFilterCutoffFrequency] = 0;
            Generators[(int)GeneratorEnum.ModulationEnvelopeToFilterCutoffFrequency] = 0;
            Generators[(int)GeneratorEnum.EndAddressCoarseOffset] = 0;
            Generators[(int)GeneratorEnum.ModulationLFOToVolume] = 0;
            Generators[(int)GeneratorEnum.ChorusEffectsSend] = 0;
            Generators[(int)GeneratorEnum.ReverbEffectsSend] = 0;
            Generators[(int)GeneratorEnum.Pan] = 0;
            Generators[(int)GeneratorEnum.DelayModulationLFO] = -12000;
            Generators[(int)GeneratorEnum.FrequencyModulationLFO] = 0;
            Generators[(int)GeneratorEnum.DelayVibratoLFO] = -12000;
            Generators[(int)GeneratorEnum.FrequencyVibratoLFO] = 0;
            Generators[(int)GeneratorEnum.DelayModulationEnvelope] = -12000;
            Generators[(int)GeneratorEnum.AttackModulationEnvelope] = -12000;
            Generators[(int)GeneratorEnum.HoldModulationEnvelope] = -12000;
            Generators[(int)GeneratorEnum.DecayModulationEnvelope] = -12000;
            Generators[(int)GeneratorEnum.SustainModulationEnvelope] = 0;
            Generators[(int)GeneratorEnum.ReleaseModulationEnvelope] = -12000;
            Generators[(int)GeneratorEnum.KeyNumberToModulationEnvelopeHold] = 0;
            Generators[(int)GeneratorEnum.KeyNumberToModulationEnvelopeDecay] = 0;
            Generators[(int)GeneratorEnum.DelayVolumeEnvelope] = -12000;
            Generators[(int)GeneratorEnum.AttackVolumeEnvelope] = -12000;
            Generators[(int)GeneratorEnum.HoldVolumeEnvelope] = -12000;
            Generators[(int)GeneratorEnum.DecayVolumeEnvelope] = -12000;
            Generators[(int)GeneratorEnum.SustainVolumeEnvelope] = 0;
            Generators[(int)GeneratorEnum.ReleaseVolumeEnvelope] = -12000;
            Generators[(int)GeneratorEnum.KeyNumberToVolumeEnvelopeHold] = 0;
            Generators[(int)GeneratorEnum.KeyNumberToVolumeEnvelopeDecay] = 0;
            Generators[(int)GeneratorEnum.KeyRange] = 0x7F00;
            Generators[(int)GeneratorEnum.VelocityRange] = 0x7F00;
            Generators[(int)GeneratorEnum.StartLoopAddressCoarseOffset] = 0;
            Generators[(int)GeneratorEnum.KeyNumber] = -1;
            Generators[(int)GeneratorEnum.Velocity] = -1;
            Generators[(int)GeneratorEnum.InitialAttenuation] = 0;
            Generators[(int)GeneratorEnum.EndLoopAddressCoarseOffset] = 0;
            Generators[(int)GeneratorEnum.CoarseTune] = 0;
            Generators[(int)GeneratorEnum.FineTune] = 0;
            Generators[(int)GeneratorEnum.SampleModes] = 0;
            Generators[(int)GeneratorEnum.ScaleTuning] = 100;
            Generators[(int)GeneratorEnum.ExclusiveClass] = 0;
            Generators[(int)GeneratorEnum.OverridingRootKey] = -1;
        }
    }
}
