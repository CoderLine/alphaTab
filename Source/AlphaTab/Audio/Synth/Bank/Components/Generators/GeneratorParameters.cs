namespace AlphaTab.Audio.Synth.Bank.Components.Generators
{
    internal class GeneratorParameters
    {
        public double Phase { get; set; }
        public double CurrentStart { get; set; }
        public double CurrentEnd { get; set; }
        public GeneratorState CurrentState { get; set; }

        public GeneratorParameters()
        {
            Phase = 0;
            CurrentStart = 0;
            CurrentEnd = 0;
            CurrentState = 0;
        }

        public void QuickSetup(Generator generator)
        {
            CurrentStart = generator.StartPhase;
            Phase = CurrentStart + generator.Offset;
            switch (generator.LoopMode)
            {
                case LoopMode.Continuous:
                case LoopMode.LoopUntilNoteOff:
                    if (Phase >= generator.EndPhase)
                    {
                        //phase is greater than the end index so generator is finished
                        CurrentState = GeneratorState.Finished;
                    }
                    else if (Phase >= generator.LoopEndPhase)
                    {
                        //phase is greater than the loop end point so generator is in post loop
                        CurrentState = GeneratorState.PostLoop;
                        CurrentEnd = generator.EndPhase;
                    }
                    else if (Phase >= generator.LoopStartPhase)
                    {
                        //phase is greater than loop start so we are inside the loop
                        CurrentState = GeneratorState.Loop;
                        CurrentEnd = generator.LoopEndPhase;
                        CurrentStart = generator.LoopStartPhase;
                    }
                    else
                    {
                        //phase is less than the loop so generator is in pre loop
                        CurrentState = GeneratorState.PreLoop;
                        CurrentEnd = generator.LoopStartPhase;
                    }

                    break;
                default:
                    CurrentEnd = generator.EndPhase;
                    if (Phase >= CurrentEnd)
                    {
                        CurrentState = GeneratorState.Finished;
                    }
                    else
                    {
                        CurrentState = GeneratorState.PostLoop;
                    }

                    break;
            }
        }
    }
}
