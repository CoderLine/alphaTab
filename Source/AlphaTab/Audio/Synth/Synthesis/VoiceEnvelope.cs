// The SoundFont loading and Audio Synthesis is based on TinySoundFont, licensed under MIT,
// developed by Bernhard Schelling (https://github.com/schellingb/TinySoundFont)

// C# port for alphaTab: (C) 2019 by Daniel Kuschny
// Licensed under: MPL-2.0

/*
 * LICENSE (MIT)
 *
 * Copyright (C) 2017, 2018 Bernhard Schelling
 * Based on SFZero, Copyright (C) 2012 Steve Folta (https://github.com/stevefolta/SFZero)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons
 * to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
using System;
using AlphaTab.Audio.Synth.Util;

namespace AlphaTab.Audio.Synth.Synthesis
{
    internal class VoiceEnvelope
    {
        private const float FastReleaseTime = 0.01f;
        public float Level { get; set; }
        public float Slope { get; set; }

        public int SamplesUntilNextSegment { get; set; }

        public VoiceEnvelopeSegment Segment { get; set; }
        public short MidiVelocity { get; set; }

        public Envelope Parameters { get; set; }

        public bool SegmentIsExponential { get; set; }
        public bool IsAmpEnv { get; set; }

        public void NextSegment(VoiceEnvelopeSegment activeSegment, float outSampleRate)
        {
            while (true) // if segment is handled, method will return
            {
                switch (activeSegment)
                {
                    case VoiceEnvelopeSegment.None:
                        SamplesUntilNextSegment = (int)(Parameters.Delay * outSampleRate);
                        if (SamplesUntilNextSegment > 0)
                        {
                            Segment = VoiceEnvelopeSegment.Delay;
                            SegmentIsExponential = false;
                            Level = 0.0f;
                            Slope = 0.0f;
                            return;
                        }
                        activeSegment = VoiceEnvelopeSegment.Delay;
                        break;

                    case VoiceEnvelopeSegment.Delay:
                        SamplesUntilNextSegment = (int)(Parameters.Attack * outSampleRate);
                        if (SamplesUntilNextSegment > 0)
                        {
                            if (!this.IsAmpEnv)
                            {
                                //mod env attack duration scales with velocity (velocity of 1 is full duration, max velocity is 0.125 times duration)
                                SamplesUntilNextSegment =
                                    (int)(Parameters.Attack * ((145 - this.MidiVelocity) / 144.0f) * outSampleRate);
                            }

                            Segment = VoiceEnvelopeSegment.Attack;
                            SegmentIsExponential = false;
                            Level = 0.0f;
                            Slope = 1.0f / SamplesUntilNextSegment;
                            return;
                        }

                        activeSegment = VoiceEnvelopeSegment.Attack;
                        break;

                    case VoiceEnvelopeSegment.Attack:
                        SamplesUntilNextSegment = (int)(Parameters.Hold * outSampleRate);
                        if (SamplesUntilNextSegment > 0)
                        {
                            Segment = VoiceEnvelopeSegment.Hold;
                            SegmentIsExponential = false;
                            Level = 1.0f;
                            Slope = 0.0f;
                            return;
                        }

                        activeSegment = VoiceEnvelopeSegment.Hold;
                        break;

                    case VoiceEnvelopeSegment.Hold:
                        SamplesUntilNextSegment = (int)(Parameters.Decay * outSampleRate);
                        if (SamplesUntilNextSegment > 0)
                        {
                            Segment = VoiceEnvelopeSegment.Decay;
                            Level = 1.0f;
                            if (this.IsAmpEnv)
                            {
                                // I don't truly understand this; just following what LinuxSampler does.
                                var mysterySlope = (float)(-9.226 / SamplesUntilNextSegment);
                                Slope = (float)Math.Exp(mysterySlope);
                                SegmentIsExponential = true;
                                if (Parameters.Sustain > 0.0f)
                                {
                                    // Again, this is following LinuxSampler's example, which is similar to
                                    // SF2-style decay, where "decay" specifies the time it would take to
                                    // get to zero, not to the sustain level.  The SFZ spec is not that
                                    // specific about what "decay" means, so perhaps it's really supposed
                                    // to specify the time to reach the sustain level.
                                    SamplesUntilNextSegment = (int)(Math.Log(Parameters.Sustain) / mysterySlope);
                                }
                            }
                            else
                            {
                                Slope = (float)(-1.0 / SamplesUntilNextSegment);
                                SamplesUntilNextSegment =
                                    (int)(Parameters.Decay * (1.0f - Parameters.Sustain) * outSampleRate);
                                SegmentIsExponential = false;
                            }

                            return;
                        }

                        activeSegment = VoiceEnvelopeSegment.Decay;
                        break;

                    case VoiceEnvelopeSegment.Decay:
                        Segment = VoiceEnvelopeSegment.Sustain;
                        Level = Parameters.Sustain;
                        Slope = 0.0f;
                        SamplesUntilNextSegment = 0x7FFFFFFF;
                        SegmentIsExponential = false;
                        return;
                    case VoiceEnvelopeSegment.Sustain:
                        Segment = VoiceEnvelopeSegment.Release;
                        SamplesUntilNextSegment =
                            (int)((Parameters.Release <= 0 ? FastReleaseTime : Parameters.Release) * outSampleRate);
                        if (this.IsAmpEnv)
                        {
                            // I don't truly understand this; just following what LinuxSampler does.
                            var mysterySlope = (float)(-9.226 / SamplesUntilNextSegment);
                            Slope = (float)Math.Exp(mysterySlope);
                            SegmentIsExponential = true;
                        }
                        else
                        {
                            Slope = -Level / SamplesUntilNextSegment;
                            SegmentIsExponential = false;
                        }

                        return;
                    case VoiceEnvelopeSegment.Release:
                    default:
                        Segment = VoiceEnvelopeSegment.Done;
                        SegmentIsExponential = false;
                        Level = Slope = 0.0f;
                        SamplesUntilNextSegment = 0x7FFFFFF;
                        return;
                }
            }
        }

        public void Setup(
            Envelope newParameters,
            int midiNoteNumber,
            int midiVelocity,
            bool isAmpEnv,
            float outSampleRate)
        {
            Parameters = new Envelope(newParameters);
            if (Parameters.KeynumToHold > 0)
            {
                Parameters.Hold += Parameters.KeynumToHold * (60.0f - midiNoteNumber);
                Parameters.Hold = Parameters.Hold < -10000.0f ? 0.0f : SynthHelper.Timecents2Secs(Parameters.Hold);
            }

            if (Parameters.KeynumToDecay > 0)
            {
                Parameters.Decay += Parameters.KeynumToDecay * (60.0f - midiNoteNumber);
                Parameters.Decay = Parameters.Decay < -10000.0f ? 0.0f : SynthHelper.Timecents2Secs(Parameters.Decay);
            }

            MidiVelocity = (short)midiVelocity;
            IsAmpEnv = isAmpEnv;
            NextSegment(VoiceEnvelopeSegment.None, outSampleRate);
        }

        public void Process(int numSamples, float outSampleRate)
        {
            if (Slope > 0)
            {
                if (SegmentIsExponential) Level *= (float)Math.Pow(Slope, numSamples);
                else Level += (Slope * numSamples);
            }

            if ((SamplesUntilNextSegment -= numSamples) <= 0)
            {
                NextSegment(Segment, outSampleRate);
            }
        }
    }
}
