using AlphaTab.IO;

namespace AlphaTab.Audio.Synth.SoundFont
{
    internal class HydraPmod
    {
        public const int SizeInFile = 10;

        public ushort ModSrcOper { get; set; }
        public ushort ModDestOper { get; set; }
        public ushort ModAmount { get; set; }
        public ushort ModAmtSrcOper { get; set; }
        public ushort ModTransOper { get; set; }

        public static HydraPmod Load(IReadable reader)
        {
            var pmod = new HydraPmod();

            pmod.ModSrcOper = reader.ReadUInt16LE();
            pmod.ModDestOper = reader.ReadUInt16LE();
            pmod.ModAmount = reader.ReadUInt16LE();
            pmod.ModAmtSrcOper = reader.ReadUInt16LE();
            pmod.ModTransOper = reader.ReadUInt16LE();

            return pmod;
        }
    }
}
