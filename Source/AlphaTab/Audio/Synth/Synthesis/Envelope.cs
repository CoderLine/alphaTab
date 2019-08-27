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

using AlphaTab.Audio.Synth.Util;

namespace AlphaTab.Audio.Synth.Synthesis
{
    internal class Envelope
    {
        public float Delay { get; set; }
        public float Attack { get; set; }
        public float Hold { get; set; }
        public float Decay { get; set; }
        public float Sustain { get; set; }
        public float Release { get; set; }
        public float KeynumToHold { get; set; }
        public float KeynumToDecay { get; set; }

        public Envelope()
        {
        }

        public Envelope(Envelope other)
        {
            Delay = other.Delay;
            Attack = other.Attack;
            Hold = other.Hold;
            Decay = other.Decay;
            Sustain = other.Sustain;
            Release = other.Release;
            KeynumToHold = other.KeynumToHold;
            KeynumToDecay = other.KeynumToDecay;
        }

        public void Clear()
        {
            Delay = 0;
            Attack = 0;
            Hold = 0;
            Decay = 0;
            Sustain = 0;
            Release = 0;
            KeynumToHold = 0;
            KeynumToDecay = 0;
        }

        public void EnvToSecs(bool sustainIsGain)
        {
            // EG times need to be converted from timecents to seconds.
            // Pin very short EG segments.  Timecents don't get to zero, and our EG is
            // happier with zero values.
            Delay = (Delay < -11950.0f ? 0.0f : SynthHelper.Timecents2Secs(Delay));
            Attack = (Attack < -11950.0f ? 0.0f : SynthHelper.Timecents2Secs(Attack));
            Release = (Release < -11950.0f ? 0.0f : SynthHelper.Timecents2Secs(Release));

            // If we have dynamic hold or decay times depending on key number we need
            // to keep the values in timecents so we can calculate it during startNote
            if (KeynumToHold == 0)
            {
                Hold = (Hold < -11950.0f ? 0.0f : SynthHelper.Timecents2Secs(Hold));
            }

            if (KeynumToDecay == 0)
            {
                Decay = (Decay < -11950.0f ? 0.0f : SynthHelper.Timecents2Secs(Decay));
            }

            if (Sustain < 0.0f)
            {
                Sustain = 0.0f;
            }
            else if (sustainIsGain)
            {
                Sustain = SynthHelper.DecibelsToGain(-Sustain / 10.0f);
            }
            else
            {
                Sustain = 1.0f - (Sustain / 1000.0f);
            }
        }
    }
}
