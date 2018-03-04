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
using System;
using AlphaTab.Audio.Synth.IO;
using AlphaTab.Audio.Synth.Util;
using AlphaTab.IO;
using AlphaTab.Util;

namespace AlphaTab.Audio.Synth.Sf2
{
    public class SoundFont
    {
        public SoundFontInfo Info { get; set; }
        public SoundFontSampleData SampleData { get; set; }
        public SoundFontPresets Presets { get; set; }

        public void Load(IReadable input)
        {
            var id = input.Read8BitChars(4);
            var size = input.ReadInt32LE();
            if (id.ToLower() != "riff")
                throw new Exception("Invalid soundfont. Could not find RIFF header.");
            id = input.Read8BitChars(4);
            if (id.ToLower() != "sfbk")
                throw new Exception("Invalid soundfont. Riff type is invalid.");

            Logger.Debug("SF2", "Reading info chunk");
            Info = new SoundFontInfo(input);
            Logger.Debug("SF2", "Reading sampledata chunk");
            SampleData = new SoundFontSampleData(input);
            Logger.Debug("SF2", "Reading preset chunk");
            Presets = new SoundFontPresets(input);
        }
    }
}
