using System.IO;
using AlphaTab.IO;

namespace AlphaTab.Audio.Synth.SoundFont
{
    internal class HydraImod
    {
        public const int SizeInFile = 10;

        public ushort ModSrcOper { get; set; }
        public ushort ModDestOper { get; set; }
        public short ModAmount { get; set; }
        public ushort ModAmtSrcOper { get; set; }
        public ushort ModTransOper { get; set; }

        public static HydraImod Load(IReadable reader)
        {
            var imod = new HydraImod();
            imod.ModSrcOper = reader.ReadUInt16LE();
            imod.ModDestOper = reader.ReadUInt16LE();
            imod.ModAmount = reader.ReadInt16LE();
            imod.ModAmtSrcOper = reader.ReadUInt16LE();
            imod.ModTransOper = reader.ReadUInt16LE();
            return imod;
        }
    }
}
