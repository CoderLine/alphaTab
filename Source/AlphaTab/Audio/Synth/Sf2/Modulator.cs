using AlphaTab.IO;

namespace AlphaTab.Audio.Synth.Sf2
{
    internal class Modulator
    {
        public ModulatorType SourceModulationData { get; }
        public int DestinationGenerator { get; }
        public short Amount { get; }
        public ModulatorType SourceModulationAmount { get; }
        public int SourceTransform { get; }

        public Modulator(IReadable input)
        {
            SourceModulationData = new ModulatorType(input);
            DestinationGenerator = input.ReadUInt16LE();
            Amount = input.ReadInt16LE();
            SourceModulationAmount = new ModulatorType(input);
            SourceTransform = input.ReadUInt16LE();
        }
    }
}
