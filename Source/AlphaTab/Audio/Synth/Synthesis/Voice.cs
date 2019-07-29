using AlphaTab.Audio.Synth.Bank.Patch;

namespace AlphaTab.Audio.Synth.Synthesis
{
    internal enum VoiceStateEnum
    {
        Stopped = 0,
        Stopping = 1,
        Playing = 2
    }

    internal class Voice
    {
        public Patch Patch { get; private set; }
        public VoiceParameters VoiceParams { get; private set; }

        public Voice()
        {
            VoiceParams = new VoiceParameters();
        }

        public void Start()
        {
            if (VoiceParams.State != VoiceStateEnum.Stopped)
            {
                return;
            }

            if (Patch.Start(VoiceParams))
            {
                VoiceParams.State = VoiceStateEnum.Playing;
            }
        }

        public void Stop()
        {
            if (VoiceParams.State != VoiceStateEnum.Playing)
            {
                return;
            }

            VoiceParams.State = VoiceStateEnum.Stopping;
            Patch.Stop(VoiceParams);
        }

        public void StopImmediately()
        {
            VoiceParams.State = VoiceStateEnum.Stopped;
        }

        public void Process(int startIndex, int endIndex, bool isMuted)
        {
            //do not process if the voice is stopped
            if (VoiceParams.State == VoiceStateEnum.Stopped)
            {
                return;
            }

            //process using the patch's algorithm
            Patch.Process(VoiceParams, startIndex, endIndex, isMuted, false);
        }

        public void ProcessSilent(int startIndex, int endIndex)
        {
            //do not process if the voice is stopped
            if (VoiceParams.State == VoiceStateEnum.Stopped)
            {
                return;
            }

            //process using the patch's algorithm
            Patch.Process(VoiceParams, startIndex, endIndex, true, true);
        }

        public void Configure(int channel, int note, int velocity, Patch patch, SynthParameters synthParams)
        {
            VoiceParams.Reset();
            VoiceParams.Channel = channel;
            VoiceParams.Note = note;
            VoiceParams.Velocity = velocity;
            VoiceParams.SynthParams = synthParams;
            Patch = patch;
        }
    }
}
