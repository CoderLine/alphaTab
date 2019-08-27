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
 */using AlphaTab.IO;

namespace AlphaTab.Audio.Synth.SoundFont
{
    internal class RiffChunk
    {
        public string Id { get; set; }
        public uint Size { get; set; }

        public static bool Load(RiffChunk parent, RiffChunk chunk, IReadable stream)
        {
            if (parent != null && RiffChunk.HeaderSize > parent.Size)
            {
                return false;
            }

            if (stream.Position + HeaderSize >= stream.Length)
            {
                return false;
            }

            chunk.Id = stream.Read8BitStringLength(4);
            if (chunk.Id[0] <= ' ' || chunk.Id[0] >= 'z')
            {
                return false;
            }
            chunk.Size = stream.ReadUInt32LE();

            if (parent != null && HeaderSize + chunk.Size > parent.Size)
            {
                return false;
            }

            if (parent != null)
            {
                parent.Size -= HeaderSize + chunk.Size;
            }

            var isRiff = chunk.Id == "RIFF";
            var isList = chunk.Id == "LIST";

            if (isRiff && parent != null)
            {
                // not allowed
                return false;
            }

            if (!isRiff && !isList)
            {
                // custom type without sub type
                return true;
            }

            // for lists unwrap the list type
            chunk.Id = stream.Read8BitStringLength(4);
            if (chunk.Id[0] <= ' ' || chunk.Id[0] >= 'z')
            {
                return false;
            }
            chunk.Size -= 4;

            return true;
        }

        public const int HeaderSize = 4 /*FourCC*/ + 4 /*Size*/;
    }
}
