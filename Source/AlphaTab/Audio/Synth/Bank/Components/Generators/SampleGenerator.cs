using System;
using AlphaTab.Audio.Synth.Bank.Descriptors;
using AlphaTab.Audio.Synth.Ds;

namespace AlphaTab.Audio.Synth.Bank.Components.Generators
{
    internal class SampleGenerator : Generator
    {
        public PcmData Samples { get; set; }

        public SampleGenerator()
            : base(new GeneratorDescriptor())
        {
        }

        public override float GetValue(double phase)
        {
            return Samples[(int)phase];
        }

        public override void GetValues(GeneratorParameters generatorParams, SampleArray blockBuffer, double increment)
        {
            var proccessed = 0;
            do
            {
                var samplesAvailable =
                    (int)Math.Ceiling((generatorParams.CurrentEnd - generatorParams.Phase) / increment);
                if (samplesAvailable > blockBuffer.Length - proccessed)
                {
                    Interpolate(generatorParams, blockBuffer, increment, proccessed, blockBuffer.Length);
                    return; //proccessed = blockBuffer.Length;
                }

                var endProccessed = proccessed + samplesAvailable;
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
                        {
                            blockBuffer[proccessed++] = 0f;
                        }

                        break;
                }
            } while (proccessed < blockBuffer.Length);
        }

        private void Interpolate(
            GeneratorParameters generatorParams,
            SampleArray blockBuffer,
            double increment,
            int bufferStart,
            int bufferEnd)
        {
            var phaseEnd = generatorParams.CurrentState == GeneratorState.Loop ? LoopEndPhase - 1 : EndPhase - 1;
            int index;
            float s1, s2, mu;
            while (bufferStart < bufferEnd && generatorParams.Phase < phaseEnd) //do this until we reach an edge case or fill the buffer
            {
                index = (int)generatorParams.Phase;
                s1 = Samples[index];
                s2 = Samples[index + 1];
                mu = (float)(generatorParams.Phase - index);
                blockBuffer[bufferStart++] = s1 + mu * (s2 - s1);
                generatorParams.Phase += increment;
            }

            while (bufferStart < bufferEnd) //edge case, if in loop wrap to loop start else use duplicate sample
            {
                index = (int)generatorParams.Phase;
                s1 = Samples[index];
                if (generatorParams.CurrentState == GeneratorState.Loop)
                {
                    s2 = Samples[(int)generatorParams.CurrentStart];
                }
                else
                {
                    s2 = s1;
                }

                mu = (float)(generatorParams.Phase - index);
                blockBuffer[bufferStart++] = s1 + mu * (s2 - s1);
                generatorParams.Phase += increment;
            }
        }
    }
}
