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
using AlphaTab.IO;

namespace AlphaTab.Audio.Synth.SoundFont
{
    internal class HydraPhdr
    {
        public const int SizeInFile = 38;

        public string PresetName { get; set; }
        public ushort Preset { get; set; }
        public ushort Bank { get; set; }
        public ushort PresetBagNdx { get; set; }
        public uint Library { get; set; }
        public uint Genre { get; set; }
        public uint Morphology { get; set; }

        public static HydraPhdr Load(IReadable reader)
        {
            HydraPhdr phdr = new HydraPhdr();

            phdr.PresetName = reader.Read8BitStringLength(20);
            phdr.Preset = reader.ReadUInt16LE();
            phdr.Bank = reader.ReadUInt16LE();
            phdr.PresetBagNdx = reader.ReadUInt16LE();
            phdr.Library = reader.ReadUInt32LE();
            phdr.Genre = reader.ReadUInt32LE();
            phdr.Morphology = reader.ReadUInt32LE();

            return phdr;
        }
    }
}
