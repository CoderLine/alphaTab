using AlphaTab.IO;

namespace AlphaTab.Audio.Synth.SoundFont
{
    internal class HydraPbag
    {
        public const int SizeInFile = 4;

        public ushort GenNdx { get; set; }
        public ushort ModNdx { get; set; }

        public static HydraPbag Load(IReadable reader)
        {
            var pbag = new HydraPbag();
            pbag.GenNdx = reader.ReadUInt16LE();
            pbag.ModNdx = reader.ReadUInt16LE();
            return pbag;
        }
    }
}
