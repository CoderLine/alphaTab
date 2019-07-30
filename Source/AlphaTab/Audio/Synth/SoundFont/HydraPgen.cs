using AlphaTab.IO;

namespace AlphaTab.Audio.Synth.SoundFont
{
    internal class HydraPgen
    {
        public const int SizeInFile = 4;

        public const int GenInstrument = 41;
        public const int GenKeyRange = 43;
        public const int GenVelRange = 44;
        public const int GenSampleId = 53;

        public ushort GenOper { get; set; }
        public HydraGenAmount GenAmount { get; set; }

        public static HydraPgen Load(IReadable reader)
        {
            var pgen = new HydraPgen();
            pgen.GenOper = reader.ReadUInt16LE();
            pgen.GenAmount = HydraGenAmount.Load(reader);
            return pgen;
        }
    }
}
