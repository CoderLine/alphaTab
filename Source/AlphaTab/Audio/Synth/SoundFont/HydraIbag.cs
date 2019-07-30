using AlphaTab.IO;

namespace AlphaTab.Audio.Synth.SoundFont
{
    internal class HydraIbag
    {
        public const int SizeInFile = 4;

        public ushort InstGenNdx { get; set; }
        public ushort InstModNdx { get; set; }

        public static HydraIbag Load(IReadable reader)
        {
            var ibag = new HydraIbag();
            ibag.InstGenNdx = reader.ReadUInt16LE();
            ibag.InstModNdx = reader.ReadUInt16LE();
            return ibag;
        }
    }
}
