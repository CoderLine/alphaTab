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

namespace AlphaTab.Audio.Synth.Synthesis
{
    internal class VoiceLowPass
    {
        public double QInv { get; set; }
        public double A0 { get; set; }
        public double A1 { get; set; }
        public double B1 { get; set; }
        public double B2 { get; set; }
        public double Z1 { get; set; }
        public double Z2 { get; set; }
        public bool Active { get; set; }

        public VoiceLowPass()
        {
        }

        public VoiceLowPass(VoiceLowPass other)
        {
            QInv = other.QInv;
            A0 = other.A0;
            A1 = other.A1;
            B1 = other.B1;
            B2 = other.B2;
            Z1 = other.Z1;
            Z2 = other.Z2;
            Active = other.Active;
        }

        public void Setup(float fc)
        {
            // Lowpass filter from http://www.earlevel.com/main/2012/11/26/biquad-c-source-code/
            double k = Math.Tan(Math.PI * fc), KK = k * k;
            var norm = 1 / (1 + k * QInv + KK);
            A0 = KK * norm;
            A1 = 2 * A0;
            B1 = 2 * (KK - 1) * norm;
            B2 = (1 - k * QInv + KK) * norm;
        }

        public float Process(float input)
        {
            var output = input * A0 + Z1;
            Z1 = input * A1 + Z2 -B1 * output;
            Z2 = input * A0 - B2 * output;
            return (float)output;
        }
    }
}
