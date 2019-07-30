namespace AlphaTab.Audio.Synth.Synthesis
{
    internal class VoiceLfo
    {
        public int SamplesUntil { get; set; }
        public float Level { get; set; }
        public float Delta { get; set; }

        public void Setup(float delay, int freqCents, float outSampleRate)
        {
            SamplesUntil = (int)(delay * outSampleRate);
            Delta = (4.0f * Utils.Cents2Hertz(freqCents) / outSampleRate);
            Level = 0;
        }

        public void Process(int blockSamples)
        {
            if (SamplesUntil > blockSamples)
            {
                SamplesUntil -= blockSamples;
                return;
            }
            Level += Delta * blockSamples;
            if (Level > 1.0f)
            {
                Delta = -Delta;
                Level = 2.0f - Level;
            }
            else if (Level < -1.0f)
            {
                Delta = -Delta;
                Level = -2.0f - Level;
            }
        }
    }
}