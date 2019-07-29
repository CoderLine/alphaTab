using System;
using AlphaTab.IO;

namespace AlphaTab.Audio.Synth.Sf2.Chunks
{
    internal class SampleHeaderChunk : Chunk
    {
        public SampleHeader[] SampleHeaders { get; set; }

        public SampleHeaderChunk(string id, int size, IReadable input)
            : base(id, size)
        {
            if (size % 46 != 0)
            {
                throw new Exception("Invalid SoundFont. The sample header chunk was invalid.");
            }

            SampleHeaders = new SampleHeader[(int)(size / 46.0 - 1)];

            for (var x = 0; x < SampleHeaders.Length; x++)
            {
                SampleHeaders[x] = new SampleHeader(input);
            }

            new SampleHeader(input); //read terminal record
        }
    }
}
