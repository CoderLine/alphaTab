using System;
using AlphaTab.Audio.Synth.Bank.Descriptors;
using AlphaTab.Audio.Synth.Ds;
using AlphaTab.Audio.Synth.Util;

namespace AlphaTab.Audio.Synth.Bank.Components.Generators
{
    class SampleGenerator : Generator
    {
        public PcmData Samples { get; set; }

        public SampleGenerator()
            : base(new GeneratorDescriptor())
        {
        }

        public override float GetValue(double phase)
        {
            return Samples[(int)(phase)];
        }

        public override void GetValues(GeneratorParameters generatorParams, SampleArray blockBuffer, double increment)
        {
            int proccessed = 0;
            do
            {
                int samplesAvailable = (int)Math.Ceiling((generatorParams.CurrentEnd - generatorParams.Phase) / increment);
                if (samplesAvailable > blockBuffer.Length - proccessed)
                {
                    Interpolate(generatorParams, blockBuffer, increment, proccessed, blockBuffer.Length);
                    return; //proccessed = blockBuffer.Length;
                }
                else
                {
                    int endProccessed = proccessed + samplesAvailable;
                    Interpolate(generatorParams, blockBuffer, increment, proccessed, endProccessed);
                    proccessed = endProccessed;
                    switch (generatorParams.CurrentState)
                    {
                        case GeneratorState.PreLoop:
                            generatorParams.CurrentStart = LoopStartPhase;
                            generatorParams.CurrentEnd = LoopEndPhase;
                            generatorParams.CurrentState = GeneratorState.Loop;
                            break;
                        case GeneratorState.Loop:
                            generatorParams.Phase += generatorParams.CurrentStart - generatorParams.CurrentEnd;
                            break;
                        case GeneratorState.PostLoop:
                            generatorParams.CurrentState = GeneratorState.Finished;
                            while (proccessed < blockBuffer.Length)
                                blockBuffer[proccessed++] = 0f;
                            break;
                    }
                }
            }
            while (proccessed < blockBuffer.Length);
        }

        private void Interpolate(GeneratorParameters generatorParams, SampleArray blockBuffer, double increment, int start, int end)
        {
            double _end = generatorParams.CurrentState == GeneratorState.Loop ? this.LoopEndPhase - 1 : this.EndPhase - 1;
            int index;
            float s1, s2, mu;
            while (start < end && generatorParams.Phase < _end)//do this until we reach an edge case or fill the buffer
            {
                index = (int)generatorParams.Phase;
                s1 = Samples[index];
                s2 = Samples[index + 1];
                mu = (float)(generatorParams.Phase - index);
                blockBuffer[start++] = s1 + mu * (s2 - s1);
                generatorParams.Phase += increment;
            }
            while (start < end)//edge case, if in loop wrap to loop start else use duplicate sample
            {
                index = (int)generatorParams.Phase;
                s1 = Samples[index];
                if (generatorParams.CurrentState == GeneratorState.Loop)
                    s2 = Samples[(int)generatorParams.CurrentStart];
                else
                    s2 = s1;
                mu = (float)(generatorParams.Phase - index);
                blockBuffer[start++] = s1 + mu * (s2 - s1);
                generatorParams.Phase += increment;
            }
        }
    }
}
