using System;
using System.Collections.Generic;
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
