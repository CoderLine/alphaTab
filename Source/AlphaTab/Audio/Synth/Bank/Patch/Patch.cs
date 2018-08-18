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

using AlphaTab.Audio.Synth.Synthesis;

namespace AlphaTab.Audio.Synth.Bank.Patch
{
    abstract class Patch
    {
        public int ExclusiveGroupTarget { get; set; }
        public int ExclusiveGroup { get; set; }
        public string Name { get; private set; }

        protected Patch(string name)
        {
            Name = name;
            ExclusiveGroup = 0;
            ExclusiveGroupTarget = 0;
        }

        public abstract bool Start(VoiceParameters voiceparams);
        public abstract void Process(VoiceParameters voiceparams, int startIndex, int endIndex, bool isMuted, bool isSilentProcess);
        public abstract void Stop(VoiceParameters voiceparams);
    }
}
