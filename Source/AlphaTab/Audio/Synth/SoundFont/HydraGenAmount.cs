using AlphaTab.IO;

namespace AlphaTab.Audio.Synth.SoundFont
{
    internal class HydraGenAmount
    {
        public ushort WordAmount { get; set; }
        public short ShortAmount => (short)WordAmount;
        public byte LowByteAmount
        {
            get => (byte)(WordAmount & 0x00FF);
            set => WordAmount = (ushort)((WordAmount & 0xFF00) | value);
        }

        public byte HighByteAmount
        {
            get => (byte)((WordAmount & 0xFF00) >> 8);
            set => WordAmount = (ushort)((value & 0xFF00) | (WordAmount & 0xFF));
        }

        public static HydraGenAmount Load(IReadable reader)
        {
            var genAmount = new HydraGenAmount();
            genAmount.WordAmount = reader.ReadUInt16LE();
            return genAmount;
        }
    }
}
