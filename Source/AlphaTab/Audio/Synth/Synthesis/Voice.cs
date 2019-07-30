namespace AlphaTab.Audio.Synth.Synthesis
{
    internal partial class Voice
    {
        /// <summary>
        /// The lower this block size is the more accurate the effects are.
        /// Increasing the value significantly lowers the CPU usage of the voice rendering.
        /// If LFO affects the low-pass filter it can be hearable even as low as 8.
        /// </summary>
        private const int RenderEffectSampleBLock = 64;

        public int PlayingPreset { get; set; }
        public int PlayingKey { get; set; }
        public int PlayingChannel { get; set; }

        public Region Region { get; set; }

        public double PitchInputTimecents { get; set; }
        public double PitchOutputFactor { get; set; }
        public double SourceSamplePosition { get; set; }

        public float NoteGainDb { get; set; }
        public float PanFactorLeft { get; set; }
        public float PanFactorRight { get; set; }

        public uint PlayIndex { get; set; }
        public uint LoopStart { get; set; }
        public uint LoopEnd { get; set; }

        public VoiceEnvelope AmpEnv { get; set; }
        public VoiceEnvelope ModEnv { get; set; }

        public VoiceLowPass LowPass { get; set; }
        public VoiceLfo ModLfo { get; set; }
        public VoiceLfo VibLfo { get; set; }

        public float MixVolume { get; set; }
        public bool Mute { get; set; }

        public Voice()
        {
            AmpEnv = new VoiceEnvelope();
            ModEnv = new VoiceEnvelope();
            LowPass = new VoiceLowPass();
            ModLfo = new VoiceLfo();
            VibLfo = new VoiceLfo();
        }

        public void CalcPitchRatio(float pitchShift, float outSampleRate)
        {
            var note = PlayingKey + Region.Transpose + Region.Tune / 100.0;
            var adjustedPitch = Region.PitchKeyCenter + (note - Region.PitchKeyCenter) * (Region.PitchKeyTrack / 100.0);
            if (pitchShift != 0) adjustedPitch += pitchShift;
            PitchInputTimecents = adjustedPitch * 100.0;
            PitchOutputFactor = Region.SampleRate / (Utils.Timecents2Secs(Region.PitchKeyCenter * 100.0) * outSampleRate);
        }

        public void End(float outSampleRate)
        {
            AmpEnv.NextSegment(VoiceEnvelopeSegment.Sustain, outSampleRate);
            ModEnv.NextSegment(VoiceEnvelopeSegment.Sustain, outSampleRate);
            if (Region.LoopMode == LoopMode.Sustain)
            {
                // Continue playing, but stop looping.
                LoopEnd = LoopStart;
            }
        }

        public void EndQuick(float outSampleRate)
        {
            AmpEnv.Parameters.Release = 0.0f;
            AmpEnv.NextSegment(VoiceEnvelopeSegment.Sustain, outSampleRate);
            ModEnv.Parameters.Release = 0.0f;
            ModEnv.NextSegment(VoiceEnvelopeSegment.Sustain, outSampleRate);
        }

        public void Render(TinySoundFont f, float[] outputBuffer, int offset, int numSamples, bool isMuted)
        {
            // https://github.com/FluidSynth/fluidsynth/blob/5fe56b32b27c9aa52932eee5fdabe57dc54b6115/src/rvoice/fluid_rvoice.c#L304
            var region = Region;
            var input = f.FontSamples;
            var outL = 0;
            var outR = f.OutputMode == OutputMode.StereoUnweaved ? numSamples : -1;

            // Cache some values, to give them at least some chance of ending up in registers.
            var updateModEnv = (region.ModEnvToPitch != 0 || region.ModEnvToFilterFc != 0);
            var updateModLFO = (ModLfo.Delta > 0 && (region.ModLfoToPitch != 0 || region.ModLfoToFilterFc != 0 || region.ModLfoToVolume != 0));
            var updateVibLFO = (VibLfo.Delta > 0 && (region.VibLfoToPitch != 0));
            var isLooping = (LoopStart < LoopEnd);
            int tmpLoopStart = (int)LoopStart, tmpLoopEnd = (int)LoopEnd;
            double tmpSampleEndDbl = (double)region.End, tmpLoopEndDbl = (double)tmpLoopEnd + 1.0;
            var tmpSourceSamplePosition = SourceSamplePosition;

            var tmpLowpass = new VoiceLowPass(LowPass);

            var dynamicLowpass = (region.ModLfoToFilterFc != 0 || region.ModEnvToFilterFc != 0);
            float tmpSampleRate, tmpInitialFilterFc, tmpModLfoToFilterFc, tmpModEnvToFilterFc;

            var dynamicPitchRatio = (region.ModLfoToPitch != 0 || region.ModEnvToPitch != 0 || region.VibLfoToPitch != 0);
            double pitchRatio;
            float tmpModLfoToPitch, tmpVibLfoToPitch, tmpModEnvToPitch;

            var dynamicGain = (region.ModLfoToVolume != 0);
            float noteGain = 0, tmpModLfoToVolume;

            if (dynamicLowpass)
            {
                tmpSampleRate = f.OutSampleRate;
                tmpInitialFilterFc = (float)region.InitialFilterFc;
                tmpModLfoToFilterFc = (float)region.ModLfoToFilterFc;
                tmpModEnvToFilterFc = (float)region.ModEnvToFilterFc;
            }
            else
            {
                tmpSampleRate = 0;
                tmpInitialFilterFc = 0;
                tmpModLfoToFilterFc = 0;
                tmpModEnvToFilterFc = 0;
            }

            if (dynamicPitchRatio)
            {
                pitchRatio = 0;
                tmpModLfoToPitch = (float)region.ModLfoToPitch;
                tmpVibLfoToPitch = (float)region.VibLfoToPitch;
                tmpModEnvToPitch = (float)region.ModEnvToPitch;
            }
            else
            {
                pitchRatio = Utils.Timecents2Secs(PitchInputTimecents) * PitchOutputFactor;
                tmpModLfoToPitch = 0;
                tmpVibLfoToPitch = 0;
                tmpModEnvToPitch = 0;
            }

            if (dynamicGain)
            {
                tmpModLfoToVolume = (float)region.ModLfoToVolume * 0.1f;
            }
            else
            {
                noteGain = Utils.DecibelsToGain(NoteGainDb);
                tmpModLfoToVolume = 0;
            }

            while (numSamples > 0)
            {
                float gainMono, gainLeft, gainRight;
                var blockSamples = (numSamples > RenderEffectSampleBLock ? RenderEffectSampleBLock : numSamples);
                numSamples -= blockSamples;

                if (dynamicLowpass)
                {
                    var fres = tmpInitialFilterFc + ModLfo.Level * tmpModLfoToFilterFc + ModEnv.Level * tmpModEnvToFilterFc;
                    tmpLowpass.Active = (fres <= 13500.0f);
                    if (tmpLowpass.Active)
                    {
                        tmpLowpass.Setup(Utils.Cents2Hertz(fres) / tmpSampleRate);
                    }
                }

                if (dynamicPitchRatio)
                    pitchRatio = Utils.Timecents2Secs(PitchInputTimecents + (ModLfo.Level * tmpModLfoToPitch + VibLfo.Level * tmpVibLfoToPitch + ModEnv.Level * tmpModEnvToPitch)) * PitchOutputFactor;

                if (dynamicGain)
                    noteGain = Utils.DecibelsToGain(NoteGainDb + (ModLfo.Level * tmpModLfoToVolume));

                gainMono = noteGain * AmpEnv.Level;

                if (isMuted)
                {
                    gainMono = 0;
                }

                // Update EG.
                AmpEnv.Process(blockSamples, f.OutSampleRate);
                if (updateModEnv)
                {
                    ModEnv.Process(blockSamples, f.OutSampleRate);
                }

                // Update LFOs.
                if (updateModLFO)
                {
                    ModLfo.Process(blockSamples);
                }

                if (updateVibLFO)
                {
                    VibLfo.Process(blockSamples);
                }

                switch (f.OutputMode)
                {
                    case OutputMode.StereoInterleaved:
                        gainLeft = gainMono * PanFactorLeft;
                        gainRight = gainMono * PanFactorRight;
                        while (blockSamples-- > 0 && tmpSourceSamplePosition < tmpSampleEndDbl)
                        {
                            var pos = (int)tmpSourceSamplePosition;
                            var nextPos = (pos >= tmpLoopEnd && isLooping ? tmpLoopStart : pos + 1);

                            // Simple linear interpolation.

                            // TODO: check for interpolation mode on voice
                            // https://github.com/FluidSynth/fluidsynth/blob/5fe56b32b27c9aa52932eee5fdabe57dc54b6115/src/rvoice/fluid_rvoice.c#L434
                            float alpha = (float)(tmpSourceSamplePosition - pos), val = (input[pos] * (1.0f - alpha) + input[nextPos] * alpha);

                            // Low-pass filter.
                            if (tmpLowpass.Active) val = tmpLowpass.Process(val);

                            outputBuffer[offset + (outL++)] += val * gainLeft;
                            outputBuffer[offset + (outL++)] += val * gainRight;

                            // Next sample.
                            tmpSourceSamplePosition += pitchRatio;
                            if (tmpSourceSamplePosition >= tmpLoopEndDbl && isLooping) tmpSourceSamplePosition -= (tmpLoopEnd - tmpLoopStart + 1.0);
                        }
                        break;
                    case OutputMode.StereoUnweaved:
                        gainLeft = gainMono * PanFactorLeft;
                        gainRight = gainMono * PanFactorRight;
                        while (blockSamples-- > 0 && tmpSourceSamplePosition < tmpSampleEndDbl)
                        {
                            var pos = (int)tmpSourceSamplePosition;
                            var nextPos = (int)(pos >= tmpLoopEnd && isLooping ? tmpLoopStart : pos + 1);

                            // Simple linear interpolation.
                            float alpha = (float)(tmpSourceSamplePosition - pos), val = (input[pos] * (1.0f - alpha) + input[nextPos] * alpha);

                            // Low-pass filter.
                            if (tmpLowpass.Active) val = tmpLowpass.Process(val);

                            outputBuffer[offset + (outL++)] += val * gainLeft;
                            outputBuffer[offset + (outR++)] += val * gainRight;

                            // Next sample.
                            tmpSourceSamplePosition += pitchRatio;
                            if (tmpSourceSamplePosition >= tmpLoopEndDbl && isLooping) tmpSourceSamplePosition -= (tmpLoopEnd - tmpLoopStart + 1.0);
                        }
                        break;
                    case OutputMode.Mono:
                        while (blockSamples-- > 0 && tmpSourceSamplePosition < tmpSampleEndDbl)
                        {
                            int pos = (int)tmpSourceSamplePosition;
                            int nextPos = (pos >= tmpLoopEnd && isLooping ? tmpLoopStart : pos + 1);

                            // Simple linear interpolation.
                            float alpha = (float)(tmpSourceSamplePosition - pos), val = (input[pos] * (1.0f - alpha) + input[nextPos] * alpha);

                            // Low-pass filter.
                            if (tmpLowpass.Active) val = tmpLowpass.Process(val);

                            outputBuffer[offset + (outL++)] = val * gainMono;

                            // Next sample.
                            tmpSourceSamplePosition += pitchRatio;
                            if (tmpSourceSamplePosition >= tmpLoopEndDbl && isLooping) tmpSourceSamplePosition -= (tmpLoopEnd - tmpLoopStart + 1.0);
                        }
                        break;
                }

                if (tmpSourceSamplePosition >= tmpSampleEndDbl || AmpEnv.Segment == VoiceEnvelopeSegment.Done)
                {
                    Kill();
                    return;
                }
            }

            SourceSamplePosition = tmpSourceSamplePosition;
            if (tmpLowpass.Active || dynamicLowpass)
            {
                LowPass = tmpLowpass;
            }
        }

        public void Kill()
        {
            PlayingPreset = -1;
        }
    }
}
