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
using AlphaTab.IO;

namespace AlphaTab.Audio.Synth.Sf2.Chunks
{
    class SampleHeaderChunk : Chunk
    {
        public SampleHeader[] SampleHeaders { get; set; }

        public SampleHeaderChunk(string id, int size, IReadable input)
            : base(id, size)
        {
            if (size % 46 != 0)
                throw new Exception("Invalid SoundFont. The sample header chunk was invalid.");
            SampleHeaders = new SampleHeader[(int)((size / 46.0) - 1)];

            for (int x = 0; x < SampleHeaders.Length; x++)
            {
                SampleHeaders[x] = new SampleHeader(input);
            }
            new SampleHeader(input); //read terminal record
        }
    }
}
