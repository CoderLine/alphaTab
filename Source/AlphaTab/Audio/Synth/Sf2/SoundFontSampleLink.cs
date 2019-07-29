using System;

namespace AlphaTab.Audio.Synth.Sf2
{
    [Flags]
    internal enum SoundFontSampleLink
    {
        MonoSample = 1,
        RightSample = 2,
        LeftSample = 4,
        LinkedSample = 8,
        OggVobis = 0x10,
        RomMonoSample = 0x8001,
        RomRightSample = 0x8002,
        RomLeftSample = 0x8004,
        RomLinkedSample = 0x8008
    }
}
