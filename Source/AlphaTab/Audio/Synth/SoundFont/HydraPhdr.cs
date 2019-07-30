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
