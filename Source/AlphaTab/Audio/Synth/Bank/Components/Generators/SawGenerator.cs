using System;
using AlphaTab.Audio.Synth.Bank.Descriptors;

namespace AlphaTab.Audio.Synth.Bank.Components.Generators
{
    class SawGenerator : Generator
    {
        public SawGenerator(GeneratorDescriptor description)
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
            return (float) (2.0 * (phase - Math.Floor(phase + 0.5)));
        }
    }
}
