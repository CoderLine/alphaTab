using AlphaTab.IO;

namespace AlphaTab.Audio.Synth.Sf2
{
    internal class Generator
    {
        private ushort _rawAmount;

        public GeneratorEnum GeneratorType { get; set; }

        public short AmountInt16
        {
            get => Platform.Platform.ToInt16(_rawAmount);
            set => _rawAmount = Platform.Platform.ToUInt16(value);
        }

        public short LowByteAmount
        {
            get => Platform.Platform.ToUInt8(_rawAmount & 0x00FF);
            set => _rawAmount = Platform.Platform.ToUInt16((_rawAmount & 0xFF00) + Platform.Platform.ToUInt8(value));
        }

        public short HighByteAmount
        {
            get => Platform.Platform.ToUInt8((_rawAmount & 0xFF00) >> 8);
            set =>
                _rawAmount =
                    Platform.Platform.ToUInt16((_rawAmount & 0x00FF) + (Platform.Platform.ToUInt8(value) << 8));
        }

        public Generator(IReadable input)
        {
            GeneratorType = (GeneratorEnum)input.ReadUInt16LE();
            _rawAmount = input.ReadUInt16LE();
        }
    }
}
