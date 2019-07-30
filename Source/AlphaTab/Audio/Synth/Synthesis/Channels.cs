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
using AlphaTab.Collections;

namespace AlphaTab.Audio.Synth.Synthesis
{
    internal class Channels
    {
        public int ActiveChannel { get; set; }
        public FastList<Channel> ChannelList { get; set; }

        public Channels()
        {
            ChannelList = new FastList<Channel>();
        }

        public void SetupVoice(TinySoundFont tinySoundFont, Voice voice)
        {
            var c = ChannelList[ActiveChannel];
            var newpan = voice.Region.Pan + c.PanOffset;
            voice.PlayingChannel = ActiveChannel;
            voice.MixVolume = c.MixVolume;
            voice.NoteGainDb += c.GainDb;
            voice.CalcPitchRatio(
                (c.PitchWheel == 8192
                    ? c.Tuning
                    : ((c.PitchWheel / 16383.0f * c.PitchRange * 2.0f) - c.PitchRange + c.Tuning)),
                tinySoundFont.OutSampleRate
            );

            if (newpan <= -0.5f)
            {
                voice.PanFactorLeft = 1.0f;
                voice.PanFactorRight = 0.0f;
            }
            else if (newpan >= 0.5f)
            {
                voice.PanFactorLeft = 0.0f;
                voice.PanFactorRight = 1.0f;
            }
            else
            {
                voice.PanFactorLeft = (float)Math.Sqrt(0.5f - newpan);
                voice.PanFactorRight = (float)Math.Sqrt(0.5f + newpan);
            }
        }
    }
}
