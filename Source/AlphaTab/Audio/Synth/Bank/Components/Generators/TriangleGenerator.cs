using System;
using AlphaTab.Audio.Synth.Bank.Descriptors;

namespace AlphaTab.Audio.Synth.Bank.Components.Generators
{
    class TriangleGenerator : Generator
    {
        public TriangleGenerator(GeneratorDescriptor description)
            : base(description)
        {
            if (EndPhase < 0)
                EndPhase = 1.25;
            if (StartPhase < 0)
                StartPhase = 0.25;
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
            return (float) (Math.Abs(phase - Math.Floor(phase + 0.5)) * 4.0 - 1.0);
        }
    }
}
