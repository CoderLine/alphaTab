using AlphaTab.IO;

namespace AlphaTab.Audio.Synth.Sf2
{
    internal class SampleHeader
    {
        public string Name { get; set; }
        public int Start { get; private set; }
        public int End { get; private set; }
        public int StartLoop { get; private set; }
        public int EndLoop { get; private set; }
        public int SampleRate { get; private set; }
        public byte RootKey { get; private set; }
        public short Tune { get; private set; }
        public ushort SampleLink { get; private set; }
        public SoundFontSampleLink SoundFontSampleLink { get; private set; }

        public SampleHeader(IReadable input)
        {
            Name = input.Read8BitStringLength(20);
            Start = input.ReadInt32LE();
            End = input.ReadInt32LE();
            StartLoop = input.ReadInt32LE();
            EndLoop = input.ReadInt32LE();
            SampleRate = input.ReadInt32LE();
            RootKey = (byte)input.ReadByte();
            Tune = Platform.Platform.ToInt16(input.ReadByte());
            SampleLink = input.ReadUInt16LE();
            SoundFontSampleLink = (SoundFontSampleLink)input.ReadUInt16LE();
        }
    }
}
