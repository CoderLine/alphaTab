using AlphaTab.IO;

namespace AlphaTab.Audio.Synth.SoundFont
{
    internal class HydraInst
    {
        public const int SizeInFile = 22;

        public string InstName { get; set; }
        public ushort InstBagNdx { get; set; }

        public static HydraInst Load(IReadable reader)
        {
            var inst = new HydraInst();
            inst.InstName = reader.Read8BitStringLength(20);
            inst.InstBagNdx = reader.ReadUInt16LE();
            return inst;
        }
    }
}
