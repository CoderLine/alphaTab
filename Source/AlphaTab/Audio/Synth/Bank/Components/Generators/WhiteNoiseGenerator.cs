using AlphaTab.Audio.Synth.Bank.Descriptors;
using AlphaTab.Platform;

namespace AlphaTab.Audio.Synth.Bank.Components.Generators
{
    class WhiteNoiseGenerator : Generator
    {
        
        public WhiteNoiseGenerator(GeneratorDescriptor description)
            : base(description)
        {
            if (EndPhase < 0)
                EndPhase = 1;
            if (StartPhase < 0)
                StartPhase = 0;
            if (LoopEndPhase < 0)
                LoopEndPhase = EndPhase;
            if (LoopStartPhase < 0)
                LoopStartPhase = StartPhase;
            if (Period < 0)
                Period = 1;
            if (RootKey < 0)
                RootKey = 69;
            Frequency = 440;
        }

        public override float GetValue(double phase)
        {
            return (float) ((Platform.Platform.RandomDouble() * 2.0) - 1.0);
        }
    }
}
