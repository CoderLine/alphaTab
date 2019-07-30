using AlphaTab.IO;

namespace AlphaTab.Audio.Synth.SoundFont
{
    internal class HydraIgen
    {
        public const int SizeInFile = 4;

        public ushort GenOper { get; set; }
        public HydraGenAmount GenAmount { get; set; }

        public static HydraIgen Load(IReadable reader)
        {
            var igen = new HydraIgen();
            igen.GenOper = reader.ReadUInt16LE();
            igen.GenAmount = HydraGenAmount.Load(reader);
            return igen;
        }
    }
}
