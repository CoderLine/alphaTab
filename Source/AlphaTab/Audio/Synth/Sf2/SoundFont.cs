using System;
using AlphaTab.IO;
using AlphaTab.Util;

namespace AlphaTab.Audio.Synth.Sf2
{
    internal class SoundFont
    {
        public SoundFontInfo Info { get; set; }
        public SoundFontSampleData SampleData { get; set; }
        public SoundFontPresets Presets { get; set; }

        public void Load(IReadable input)
        {
            var id = input.Read8BitChars(4);
            input.ReadInt32LE();
            if (id.ToLower() != "riff")
            {
                throw new Exception("Invalid soundfont. Could not find RIFF header.");
            }

            id = input.Read8BitChars(4);
            if (id.ToLower() != "sfbk")
            {
                throw new Exception("Invalid soundfont. Riff type is invalid.");
            }

            Logger.Debug("SF2", "Reading info chunk");
            Info = new SoundFontInfo(input);
            Logger.Debug("SF2", "Reading sampledata chunk");
            SampleData = new SoundFontSampleData(input);
            Logger.Debug("SF2", "Reading preset chunk");
            Presets = new SoundFontPresets(input);
        }
    }
}
