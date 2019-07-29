using System;
using AlphaTab.Audio.Synth.Bank.Components;
using AlphaTab.Audio.Synth.Bank.Components.Generators;
using AlphaTab.Audio.Synth.Bank.Descriptors;
using AlphaTab.Audio.Synth.Sf2;
using AlphaTab.Audio.Synth.Synthesis;
using AlphaTab.Audio.Synth.Util;

namespace AlphaTab.Audio.Synth.Bank.Patch
{
    internal class Sf2Patch : Patch
    {
        // private int iniFilterFc;
        // private double filterQ;
        private float _initialAttn;

        private short _keyOverride;

        // private short velOverride;
        private short _keynumToModEnvHold;
        private short _keynumToModEnvDecay;
        private short _keynumToVolEnvHold;
        private short _keynumToVolEnvDecay;
        private PanComponent _pan;
        private short _modLfoToPitch;
        private short _vibLfoToPitch;
        private short _modEnvToPitch;
        private short _modLfoToFilterFc;
        private short _modEnvToFilterFc;
        private float _modLfoToVolume;
        private SampleGenerator _gen;
        private EnvelopeDescriptor _modEnv;
        private EnvelopeDescriptor _velEnv;
        private LfoDescriptor _modLFO;
        private LfoDescriptor _vibLFO;
        private FilterDescriptor _fltr;

        public Sf2Patch(string name)
            : base(name)
        {
        }

        public override bool Start(VoiceParameters voiceparams)
        {
            var note = _keyOverride > -1 ? _keyOverride : voiceparams.Note;
            // int vel = velOverride > -1 ? velOverride : voiceparams.Velocity;
            //setup generator
            voiceparams.GeneratorParams[0].QuickSetup(_gen);
            //setup envelopes
            voiceparams.Envelopes[0].QuickSetupSf2(voiceparams.SynthParams.Synth.SampleRate,
                note,
                _keynumToModEnvHold,
                _keynumToModEnvDecay,
                false,
                _modEnv);
            voiceparams.Envelopes[1].QuickSetupSf2(voiceparams.SynthParams.Synth.SampleRate,
                note,
                _keynumToVolEnvHold,
                _keynumToVolEnvDecay,
                true,
                _velEnv);
            //setup filter
            //voiceparams.pData[0].int1 = iniFilterFc - (int)(2400 * CalculateModulator(SourceTypeEnum.Linear, TransformEnum.Linear, DirectionEnum.MaxToMin, PolarityEnum.Unipolar, voiceparams.velocity, 0, 127));
            //if (iniFilterFc >= 13500 && fltr.Resonance <= 1)
            voiceparams.Filters[0].Disable();
            //else
            //    voiceparams.filters[0].QuickSetup(voiceparams.synthParams.synth.SampleRate, note, 1f, fltr);
            //setup lfos
            voiceparams.Lfos[0].QuickSetup(voiceparams.SynthParams.Synth.SampleRate, _modLFO);
            voiceparams.Lfos[1].QuickSetup(voiceparams.SynthParams.Synth.SampleRate, _vibLFO);
            //calculate initial pitch
            voiceparams.PitchOffset = (note - _gen.RootKey) * _gen.KeyTrack + _gen.Tune;
            voiceparams.PitchOffset += (int)(100.0 * (voiceparams.SynthParams.MasterCoarseTune +
                                                      (voiceparams.SynthParams.MasterFineTune.Combined - 8192.0) /
                                                      8192.0));
            //calculate initial volume
            voiceparams.VolOffset = _initialAttn;
            voiceparams.VolOffset -= 96.0f * (float)CalculateModulator(SourceTypeEnum.Concave,
                                         TransformEnum.Linear,
                                         DirectionEnum.MaxToMin,
                                         PolarityEnum.Unipolar,
                                         voiceparams.Velocity,
                                         0,
                                         127);
            voiceparams.VolOffset -= 96.0f * (float)CalculateModulator(SourceTypeEnum.Concave,
                                         TransformEnum.Linear,
                                         DirectionEnum.MaxToMin,
                                         PolarityEnum.Unipolar,
                                         voiceparams.SynthParams.Volume.Coarse,
                                         0,
                                         127);
            //check if we have finished before we have begun
            return voiceparams.GeneratorParams[0].CurrentState != GeneratorState.Finished &&
                   voiceparams.Envelopes[1].CurrentStage != EnvelopeState.None;
        }

        public override void Stop(VoiceParameters voiceparams)
        {
            _gen.Release(voiceparams.GeneratorParams[0]);
            if (_gen.LoopMode != LoopMode.OneShot)
            {
                voiceparams.Envelopes[0].Release(SynthConstants.DenormLimit);
                voiceparams.Envelopes[1].ReleaseSf2VolumeEnvelope();
            }
        }

        public override void Process(
            VoiceParameters voiceparams,
            int startIndex,
            int endIndex,
            bool isMuted,
            bool isSilentProcess)
        {
            //--Base pitch calculation
            var basePitchFrequency = SynthHelper.CentsToPitch(voiceparams.SynthParams.CurrentPitch) * _gen.Frequency;
            var pitchWithBend = basePitchFrequency * SynthHelper.CentsToPitch(voiceparams.PitchOffset);
            var basePitch = pitchWithBend / voiceparams.SynthParams.Synth.SampleRate;

            var baseVolume = voiceparams.SynthParams.Synth.MasterVolume * voiceparams.SynthParams.CurrentVolume *
                             SynthConstants.DefaultMixGain * voiceparams.SynthParams.MixVolume;

            if (isSilentProcess)
            {
                voiceparams.State = VoiceStateEnum.Stopped;
            }
            else
            {
                //--Main Loop
                for (var x = startIndex;
                    x < endIndex;
                    x += SynthConstants.DefaultBlockSize * SynthConstants.AudioChannels)
                {
                    voiceparams.Envelopes[0].Increment(SynthConstants.DefaultBlockSize);
                    voiceparams.Envelopes[1].Increment(SynthConstants.DefaultBlockSize);
                    voiceparams.Lfos[0].Increment(SynthConstants.DefaultBlockSize);
                    voiceparams.Lfos[1].Increment(SynthConstants.DefaultBlockSize);

                    //--Calculate pitch and get next block of samples
                    _gen.GetValues(voiceparams.GeneratorParams[0],
                        voiceparams.BlockBuffer,
                        basePitch *
                        SynthHelper.CentsToPitch((int)(voiceparams.Envelopes[0].Value * _modEnvToPitch +
                                                       voiceparams.Lfos[0].Value * _modLfoToPitch +
                                                       voiceparams.Lfos[1].Value * _vibLfoToPitch)));
                    //--Filter
                    if (voiceparams.Filters[0].Enabled)
                    {
                        var centsFc = voiceparams.PData[0].Int1 + voiceparams.Lfos[0].Value * _modLfoToFilterFc +
                                      voiceparams.Envelopes[0].Value * _modEnvToFilterFc;
                        if (centsFc > 13500)
                        {
                            centsFc = 13500;
                        }

                        voiceparams.Filters[0].CutOff = SynthHelper.KeyToFrequency(centsFc / 100.0, 69);
                        if (voiceparams.Filters[0].CoeffNeedsUpdating)
                        {
                            voiceparams.Filters[0].ApplyFilterInterp(voiceparams.BlockBuffer,
                                voiceparams.SynthParams.Synth.SampleRate);
                        }
                        else
                        {
                            voiceparams.Filters[0].ApplyFilter(voiceparams.BlockBuffer);
                        }
                    }

                    //--Volume calculation
                    var volume =
                        (float)SynthHelper.DBtoLinear(voiceparams.VolOffset + voiceparams.Envelopes[1].Value +
                                                      voiceparams.Lfos[0].Value * _modLfoToVolume) * baseVolume;

                    // only mix if needed
                    if (!isMuted)
                    {
                        //--Mix block based on number of channels
                        voiceparams.MixMonoToStereoInterp(x,
                            volume * _pan.Left * voiceparams.SynthParams.CurrentPan.Left,
                            volume * _pan.Right * voiceparams.SynthParams.CurrentPan.Right);
                    }

                    //--Check and end early if necessary
                    if ((voiceparams.Envelopes[1].CurrentStage > EnvelopeState.Hold &&
                         volume <= SynthConstants.NonAudible) ||
                        voiceparams.GeneratorParams[0].CurrentState == GeneratorState.Finished)
                    {
                        voiceparams.State = VoiceStateEnum.Stopped;
                        return;
                    }
                }
            }
        }


        public void Load(Sf2Region region, AssetManager assets)
        {
            ExclusiveGroup = region.Generators[(int)GeneratorEnum.ExclusiveClass];
            ExclusiveGroupTarget = ExclusiveGroup;

            // iniFilterFc = region.Generators[(int)GeneratorEnum.InitialFilterCutoffFrequency];
            // filterQ = SynthHelper.DBtoLinear(region.Generators[(int)GeneratorEnum.InitialFilterQ] / 10.0);
            _initialAttn = -region.Generators[(int)GeneratorEnum.InitialAttenuation] / 10f;
            _keyOverride = region.Generators[(int)GeneratorEnum.KeyNumber];
            // velOverride = region.Generators[(int)GeneratorEnum.Velocity];
            _keynumToModEnvHold = region.Generators[(int)GeneratorEnum.KeyNumberToModulationEnvelopeHold];
            _keynumToModEnvDecay = region.Generators[(int)GeneratorEnum.KeyNumberToModulationEnvelopeDecay];
            _keynumToVolEnvHold = region.Generators[(int)GeneratorEnum.KeyNumberToVolumeEnvelopeHold];
            _keynumToVolEnvDecay = region.Generators[(int)GeneratorEnum.KeyNumberToVolumeEnvelopeDecay];
            _pan = new PanComponent();
            _pan.SetValue(region.Generators[(int)GeneratorEnum.Pan] / 500f, PanFormulaEnum.Neg3dBCenter);
            _modLfoToPitch = region.Generators[(int)GeneratorEnum.ModulationLFOToPitch];
            _vibLfoToPitch = region.Generators[(int)GeneratorEnum.VibratoLFOToPitch];
            _modEnvToPitch = region.Generators[(int)GeneratorEnum.ModulationEnvelopeToPitch];
            _modLfoToFilterFc = region.Generators[(int)GeneratorEnum.ModulationLFOToFilterCutoffFrequency];
            _modEnvToFilterFc = region.Generators[(int)GeneratorEnum.ModulationEnvelopeToFilterCutoffFrequency];
            _modLfoToVolume = region.Generators[(int)GeneratorEnum.ModulationLFOToVolume] / 10f;

            LoadGen(region, assets);
            LoadEnvelopes(region);
            LoadLfos(region);
            LoadFilter(region);
        }

        private void LoadGen(Sf2Region region, AssetManager assets)
        {
            var sda = assets.SampleAssets[region.Generators[(int)GeneratorEnum.SampleId]];
            _gen = new SampleGenerator();
            _gen.EndPhase = sda.End + region.Generators[(int)GeneratorEnum.EndAddressOffset] +
                            32768 * region.Generators[(int)GeneratorEnum.EndAddressCoarseOffset];
            _gen.Frequency = sda.SampleRate;
            _gen.KeyTrack = region.Generators[(int)GeneratorEnum.ScaleTuning];
            _gen.LoopEndPhase = sda.LoopEnd + region.Generators[(int)GeneratorEnum.EndLoopAddressOffset] +
                                32768 * region.Generators[(int)GeneratorEnum.EndLoopAddressCoarseOffset];
            switch (region.Generators[(int)GeneratorEnum.SampleModes] & 0x3)
            {
                case 0x0:
                case 0x2:
                    _gen.LoopMode = LoopMode.NoLoop;
                    break;
                case 0x1:
                    _gen.LoopMode = LoopMode.Continuous;
                    break;
                case 0x3:
                    _gen.LoopMode = LoopMode.LoopUntilNoteOff;
                    break;
            }

            _gen.LoopStartPhase = sda.LoopStart + region.Generators[(int)GeneratorEnum.StartLoopAddressOffset] +
                                  32768 * region.Generators[(int)GeneratorEnum.StartLoopAddressCoarseOffset];
            _gen.Offset = 0;
            _gen.Period = 1.0;
            if (region.Generators[(int)GeneratorEnum.OverridingRootKey] > -1)
            {
                _gen.RootKey = region.Generators[(int)GeneratorEnum.OverridingRootKey];
            }
            else
            {
                _gen.RootKey = sda.RootKey;
            }

            _gen.StartPhase = sda.Start + region.Generators[(int)GeneratorEnum.StartAddressOffset] +
                              32768 * region.Generators[(int)GeneratorEnum.StartAddressCoarseOffset];
            _gen.Tune = (short)(sda.Tune + region.Generators[(int)GeneratorEnum.FineTune] +
                                100 * region.Generators[(int)GeneratorEnum.CoarseTune]);
            _gen.VelocityTrack = 0;
            ((SampleGenerator)_gen).Samples = sda.SampleData;
        }

        private void LoadEnvelopes(Sf2Region region)
        {
            //
            //mod env
            _modEnv = new EnvelopeDescriptor();
            _modEnv.AttackTime =
                (float)Math.Pow(2, region.Generators[(int)GeneratorEnum.AttackModulationEnvelope] / 1200.0);
            _modEnv.AttackGraph = 3;
            _modEnv.DecayTime =
                (float)Math.Pow(2, region.Generators[(int)GeneratorEnum.DecayModulationEnvelope] / 1200.0);
            _modEnv.DelayTime =
                (float)Math.Pow(2, region.Generators[(int)GeneratorEnum.DelayModulationEnvelope] / 1200.0);
            _modEnv.HoldTime =
                (float)Math.Pow(2, region.Generators[(int)GeneratorEnum.HoldModulationEnvelope] / 1200.0);
            _modEnv.PeakLevel = 1;
            _modEnv.ReleaseTime =
                (float)Math.Pow(2, region.Generators[(int)GeneratorEnum.ReleaseModulationEnvelope] / 1200.0);
            _modEnv.StartLevel = 0;
            _modEnv.SustainLevel =
                1f - SynthHelper.ClampS(region.Generators[(int)GeneratorEnum.SustainModulationEnvelope],
                    (short)0,
                    (short)1000) / 1000f;
            //checks
            if (_modEnv.AttackTime < 0.001f)
            {
                _modEnv.AttackTime = 0.001f;
            }
            else if (_modEnv.AttackTime > 100f)
            {
                _modEnv.AttackTime = 100f;
            }

            if (_modEnv.DecayTime < 0.001f)
            {
                _modEnv.DecayTime = 0;
            }
            else if (_modEnv.DecayTime > 100f)
            {
                _modEnv.DecayTime = 100f;
            }

            if (_modEnv.DelayTime < 0.001f)
            {
                _modEnv.DelayTime = 0;
            }
            else if (_modEnv.DelayTime > 20f)
            {
                _modEnv.DelayTime = 20f;
            }

            if (_modEnv.HoldTime < 0.001f)
            {
                _modEnv.HoldTime = 0;
            }
            else if (_modEnv.HoldTime > 20f)
            {
                _modEnv.HoldTime = 20f;
            }

            if (_modEnv.ReleaseTime < 0.001f)
            {
                _modEnv.ReleaseTime = 0.001f;
            }
            else if (_modEnv.ReleaseTime > 100f)
            {
                _modEnv.ReleaseTime = 100f;
            }

            //
            // volume env
            _velEnv = new EnvelopeDescriptor();
            _velEnv.AttackTime =
                (float)Math.Pow(2, region.Generators[(int)GeneratorEnum.AttackVolumeEnvelope] / 1200.0);
            _velEnv.AttackGraph = 3;
            _velEnv.DecayTime = (float)Math.Pow(2, region.Generators[(int)GeneratorEnum.DecayVolumeEnvelope] / 1200.0);
            _velEnv.DelayTime = (float)Math.Pow(2, region.Generators[(int)GeneratorEnum.DelayVolumeEnvelope] / 1200.0);
            _velEnv.HoldTime = (float)Math.Pow(2, region.Generators[(int)GeneratorEnum.HoldVolumeEnvelope] / 1200.0);
            _velEnv.PeakLevel = 0;
            _velEnv.ReleaseTime =
                (float)Math.Pow(2, region.Generators[(int)GeneratorEnum.ReleaseVolumeEnvelope] / 1200.0);
            _velEnv.StartLevel = -100;
            _velEnv.SustainLevel = SynthHelper.ClampS(region.Generators[(int)GeneratorEnum.SustainVolumeEnvelope],
                                       (short)0,
                                       (short)1000) / -10f;
            // checks
            if (_velEnv.AttackTime < 0.001f)
            {
                _velEnv.AttackTime = 0.001f;
            }
            else if (_velEnv.AttackTime > 100f)
            {
                _velEnv.AttackTime = 100f;
            }

            if (_velEnv.DecayTime < 0.001f)
            {
                _velEnv.DecayTime = 0;
            }
            else if (_velEnv.DecayTime > 100f)
            {
                _velEnv.DecayTime = 100f;
            }

            if (_velEnv.DelayTime < 0.001f)
            {
                _velEnv.DelayTime = 0;
            }
            else if (_velEnv.DelayTime > 20f)
            {
                _velEnv.DelayTime = 20f;
            }

            if (_velEnv.HoldTime < 0.001f)
            {
                _velEnv.HoldTime = 0;
            }
            else if (_velEnv.HoldTime > 20f)
            {
                _velEnv.HoldTime = 20f;
            }

            if (_velEnv.ReleaseTime < 0.001f)
            {
                _velEnv.ReleaseTime = 0.001f;
            }
            else if (_velEnv.ReleaseTime > 100f)
            {
                _velEnv.ReleaseTime = 100f;
            }
        }

        private void LoadLfos(Sf2Region region)
        {
            _modLFO = new LfoDescriptor();
            _modLFO.DelayTime = (float)Math.Pow(2, region.Generators[(int)GeneratorEnum.DelayModulationLFO] / 1200.0);
            _modLFO.Frequency =
                (float)(Math.Pow(2, region.Generators[(int)GeneratorEnum.FrequencyModulationLFO] / 1200.0) * 8.176);
            _modLFO.Generator = DefaultGenerators.DefaultSine;
            _vibLFO = new LfoDescriptor();
            _vibLFO.DelayTime = (float)Math.Pow(2, region.Generators[(int)GeneratorEnum.DelayVibratoLFO] / 1200.0);
            _vibLFO.Frequency =
                (float)(Math.Pow(2, region.Generators[(int)GeneratorEnum.FrequencyVibratoLFO] / 1200.0) * 8.176);
            _vibLFO.Generator = DefaultGenerators.DefaultSine;
        }

        private void LoadFilter(Sf2Region region)
        {
            _fltr = new FilterDescriptor();
            _fltr.FilterMethod = FilterType.BiquadLowpass;
            _fltr.CutOff =
                (float)SynthHelper.KeyToFrequency(region.Generators[(int)GeneratorEnum.InitialFilterCutoffFrequency] /
                                                  100.0,
                    69);
            _fltr.Resonance =
                (float)SynthHelper.DBtoLinear(region.Generators[(int)GeneratorEnum.InitialFilterQ] / 10.0);
        }

        private static double CalculateModulator(
            SourceTypeEnum s,
            TransformEnum t,
            DirectionEnum d,
            PolarityEnum p,
            int value,
            int min,
            int max)
        {
            double output = 0;
            int i;
            value = value - min;
            max = max - min;
            if (d == DirectionEnum.MaxToMin)
            {
                value = max - value;
            }

            switch (s)
            {
                case SourceTypeEnum.Linear:
                    output = value / max;
                    break;
                case SourceTypeEnum.Concave:
                    i = 127 - value;
                    output = -(20.0 / 96.0) * Math.Log10((i * i) / (double)(max * max));
                    break;
                case SourceTypeEnum.Convex:
                    i = value;
                    output = 1 + (20.0 / 96.0) * Math.Log10((i * i) / (double)(max * max));
                    break;
                case SourceTypeEnum.Switch:
                    if (value <= (max / 2))
                    {
                        output = 0;
                    }
                    else
                    {
                        output = 1;
                    }

                    break;
            }

            if (p == PolarityEnum.Bipolar)
            {
                output = (output * 2) - 1;
            }

            if (t == TransformEnum.AbsoluteValue)
            {
                output = Math.Abs(output);
            }

            return output;
        }
    }
}
