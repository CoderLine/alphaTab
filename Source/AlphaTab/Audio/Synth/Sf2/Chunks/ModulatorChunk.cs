using System;
using AlphaTab.IO;

namespace AlphaTab.Audio.Synth.Sf2.Chunks
{
    internal class ModulatorChunk : Chunk
    {
        public Modulator[] Modulators { get; set; }

        public ModulatorChunk(string id, int size, IReadable input)
            : base(id, size)
        {
            if (size % 10 != 0)
            {
                throw new Exception("Invalid SoundFont. The presetzone chunk was invalid.");
            }

            Modulators = new Modulator[size / 10 - 1];
            for (var x = 0; x < Modulators.Length; x++)
            {
                Modulators[x] = new Modulator(input);
            }

            new Modulator(input);
        }
    }
}
