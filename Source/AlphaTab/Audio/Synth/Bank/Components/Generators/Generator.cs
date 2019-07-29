using System;
using AlphaTab.Audio.Synth.Bank.Descriptors;
using AlphaTab.Audio.Synth.Ds;

namespace AlphaTab.Audio.Synth.Bank.Components.Generators
{
    internal enum LoopMode
    {
        NoLoop = 0,
        OneShot = 1,
        Continuous = 2,
        LoopUntilNoteOff = 3
    }

    internal enum GeneratorState
    {
        PreLoop = 0,
        Loop = 1,
        PostLoop = 2,
        Finished = 3
    }

    internal abstract class Generator
    {
        public LoopMode LoopMode { get; set; }
        public double LoopStartPhase { get; set; }
        public double LoopEndPhase { get; set; }
        public double StartPhase { get; set; }
        public double EndPhase { get; set; }
        public double Offset { get; set; }
        public double Period { get; set; }
        public double Frequency { get; set; }
        public short RootKey { get; set; }
        public short KeyTrack { get; set; }
        public short VelocityTrack { get; set; }
        public short Tune { get; set; }


        protected Generator(GeneratorDescriptor description)
        {
            LoopMode = description.LoopMethod;
            LoopStartPhase = description.LoopStartPhase;
            LoopEndPhase = description.LoopEndPhase;
            StartPhase = description.StartPhase;
            EndPhase = description.EndPhase;
            Offset = description.Offset;
            Period = description.Period;
            Frequency = 0;
            RootKey = description.RootKey;
            KeyTrack = description.KeyTrack;
            VelocityTrack = description.VelTrack;
            Tune = description.Tune;
        }

        public void Release(GeneratorParameters generatorParams)
        {
            if (LoopMode == LoopMode.LoopUntilNoteOff)
            {
                generatorParams.CurrentState = GeneratorState.PostLoop;
                generatorParams.CurrentStart = StartPhase;
                generatorParams.CurrentEnd = EndPhase;
            }
        }

        public abstract float GetValue(double phase);

        public virtual void GetValues(GeneratorParameters generatorParams, SampleArray blockBuffer, double increment)
        {
            var proccessed = 0;
            do
            {
                var samplesAvailable =
                    (int)Math.Ceiling((generatorParams.CurrentEnd - generatorParams.Phase) / increment);
                if (samplesAvailable > blockBuffer.Length - proccessed)
                {
                    while (proccessed < blockBuffer.Length)
                    {
                        blockBuffer[proccessed++] = GetValue(generatorParams.Phase);
                        generatorParams.Phase += increment;
                    }
                }
                else
                {
                    var endProccessed = proccessed + samplesAvailable;
                    while (proccessed < endProccessed)
                    {
                        blockBuffer[proccessed++] = GetValue(generatorParams.Phase);
                        generatorParams.Phase += increment;
                    }

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
                                blockBuffer[proccessed++] = 0;
                            }

                            break;
                    }
                }
            } while (proccessed < blockBuffer.Length);
        }
    }
}
