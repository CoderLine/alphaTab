using AlphaTab.Audio.Synth.Util;
using AlphaTab.IO;
using AlphaTab.Platform;

namespace AlphaTab.Audio.Synth.Sf2
{
    internal class ModulatorType
    {
        public PolarityEnum Polarity { get; set; }
        public DirectionEnum Direction { get; set; }
        public int SourceType { get; set; }
        public bool IsMidiContinuousController { get; private set; }

        public ModulatorType(IReadable input)
        {
            var raw = input.ReadUInt16LE();

            Polarity = (raw & 0x0200) == 0x0200 ? PolarityEnum.Bipolar : PolarityEnum.Unipolar;
            Direction = (raw & 0x0100) == 0x0100 ? DirectionEnum.MaxToMin : DirectionEnum.MinToMax;

            IsMidiContinuousController = ((raw & 0x0080) == 0x0080);
            SourceType = ((raw & (0xFC00)) >> 10);
        }
    }
}
