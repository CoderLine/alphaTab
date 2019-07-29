using System;
using AlphaTab.Audio.Synth.Sf2;

namespace AlphaTab.Audio.Synth.Bank
{
    class SampleDataAsset
    {
        public string Name { get; set; }
        public int Channels { get; set; }
        public int SampleRate { get; set; }
        public short RootKey { get; set; }
        public short Tune { get; set; }
        public float Start { get; set; }
        public float End { get; set; }
        public float LoopStart { get; set; }
        public float LoopEnd { get; set; }
        public PcmData SampleData { get; set; }

        public SampleDataAsset(SampleHeader sample, SoundFontSampleData sampleData)
        {
            Channels = 1;

            Name = sample.Name;
            SampleRate = sample.SampleRate;
            RootKey = sample.RootKey;
            Tune = sample.Tune;
            Start = sample.Start;
            End = sample.End;
            LoopStart = sample.StartLoop;
            LoopEnd = sample.EndLoop;
            if ((sample.SoundFontSampleLink & SFSampleLink.OggVobis) != 0)
            {
                throw new Exception("Ogg Vobis encoded soundfonts not supported");
            }
            else
            {
                SampleData = PcmData.Create(sampleData.BitsPerSample, sampleData.SampleData, true);
            }
        }
    }
}
