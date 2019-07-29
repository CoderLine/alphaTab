using System;
using AlphaTab.IO;

namespace AlphaTab.Audio.Synth.Sf2.Chunks
{
    internal class GeneratorChunk : Chunk
    {
        public Generator[] Generators { get; set; }

        public GeneratorChunk(string id, int size, IReadable input) : base(id, size)
        {
            if (size % 4 != 0)
            {
                throw new Exception("Invalid SoundFont. The presetzone chunk was invalid");
            }

            Generators = new Generator[(int)(size / 4.0 - 1)];
            for (var x = 0; x < Generators.Length; x++)
            {
                Generators[x] = new Generator(input);
            }

            new Generator(input); // terminal record
        }
    }
}
