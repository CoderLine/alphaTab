using AlphaTab.Audio.Synth.Synthesis;

namespace AlphaTab.Audio.Synth.Bank.Patch
{
    internal abstract class Patch
    {
        public int ExclusiveGroupTarget { get; set; }
        public int ExclusiveGroup { get; set; }
        public string Name { get; private set; }

        protected Patch(string name)
        {
            Name = name;
            ExclusiveGroup = 0;
            ExclusiveGroupTarget = 0;
        }

        public abstract bool Start(VoiceParameters voiceparams);

        public abstract void Process(
            VoiceParameters voiceparams,
            int startIndex,
            int endIndex,
            bool isMuted,
            bool isSilentProcess);

        public abstract void Stop(VoiceParameters voiceparams);
    }
}
