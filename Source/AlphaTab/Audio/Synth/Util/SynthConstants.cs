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

using AlphaTab.Audio.Synth.Bank.Components.Generators;

namespace AlphaTab.Audio.Synth.Util
{
    static class SynthConstants
    {
        public const int AudioChannels = 2;

        public const double Pi = 3.14159265358979;
        public const double TwoPi = 2.0*Pi;
        public const double HalfPi = Pi / 2.0;
        public const double InverseSqrtOfTwo = 0.707106781186;
        public const float DefaultLfoFrequency = 8.0f;
        public const int DefaultModDepth = 100;
        public const int DefaultPolyphony = 40;
        public const int MinPolyphony = 5;
        public const int MaxPolyphony = 250;
        public const int DefaultBlockSize = 64;
        public const double MaxBufferSize = 0.05;
        public const double MinBufferSize = 0.001;
        public const double DenormLimit = 1e-38;
        public const double NonAudible = 1e-5;
        public const int SincWidth = 16;
        public const int SincResolution = 64;
        public const int MaxVoiceComponents = 4;
        public const int DefaultChannelCount = 16 + 1 /*metronome*/;
        public const int DefaultKeyCount = 128;

        public const float DefaultMixGain = 0.35f;

        public const float MinVolume = 0;
        public const float MaxVolume = 10;

        public const byte MinProgram = 0;
        public const byte MaxProgram = 127;

        public const double MinPlaybackSpeed = 0.125;
        public const double MaxPlaybackSpeed = 8;
    }
}
