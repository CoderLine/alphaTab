using AlphaTab.Audio.Synth.Bank.Components.Generators;

namespace AlphaTab.Audio.Synth.Bank.Descriptors
{
    internal enum Waveform
    {
        Sine = 0,
        Square = 1,
        Saw = 2,
        Triangle = 3,
        SampleData = 4,
        WhiteNoise = 5
    }

    internal class GeneratorDescriptor
    {
        public LoopMode LoopMethod { get; set; }
        public Waveform SamplerType { get; set; }
        public string AssetName { get; set; }
        public double EndPhase { get; set; }
        public double StartPhase { get; set; }
        public double LoopEndPhase { get; set; }
        public double LoopStartPhase { get; set; }
        public double Offset { get; set; }
        public double Period { get; set; }
        public short RootKey { get; set; }
        public short KeyTrack { get; set; }
        public short VelTrack { get; set; }
        public short Tune { get; set; }

        public GeneratorDescriptor()
        {
            LoopMethod = LoopMode.NoLoop;
            SamplerType = Waveform.Sine;
            AssetName = "null";
            EndPhase = -1;
            StartPhase = -1;
            LoopEndPhase = -1;
            LoopStartPhase = -1;
            Offset = 0;
            Period = -1;
            RootKey = -1;
            KeyTrack = 100;
            VelTrack = 0;
            Tune = 0;
        }
    }
}
