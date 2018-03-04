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

using AlphaTab.Audio.Synth.Bank.Patch;

namespace AlphaTab.Audio.Synth.Synthesis
{
    public enum VoiceStateEnum
    {
        Stopped = 0,
        Stopping = 1,
        Playing = 2
    }

    public class Voice
    {
        public Patch Patch { get; private set; }
        public VoiceParameters VoiceParams { get; private set; }

        public Voice()
        {
            VoiceParams = new VoiceParameters();
        }

        public void Start()
        {
            if (VoiceParams.State != VoiceStateEnum.Stopped)
                return;
            if (Patch.Start(VoiceParams))
                VoiceParams.State = VoiceStateEnum.Playing;
        }

        public void Stop()
        {
            if (VoiceParams.State != VoiceStateEnum.Playing)
                return;
            VoiceParams.State = VoiceStateEnum.Stopping;
            Patch.Stop(VoiceParams);
        }

        public void StopImmediately()
        {
            VoiceParams.State = VoiceStateEnum.Stopped;
        }

        public void Process(int startIndex, int endIndex, bool isMuted)
        {
            //do not process if the voice is stopped
            if (VoiceParams.State == VoiceStateEnum.Stopped)
                return;
            
            //process using the patch's algorithm
            Patch.Process(VoiceParams, startIndex, endIndex, isMuted);
        }

        public void Configure(int channel, int note, int velocity, Patch patch, SynthParameters synthParams)
        {
            VoiceParams.Reset();
            VoiceParams.Channel = channel;
            VoiceParams.Note = note;
            VoiceParams.Velocity = velocity;
            VoiceParams.SynthParams = synthParams;
            Patch = patch;
        }
    }
}
