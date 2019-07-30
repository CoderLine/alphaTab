namespace AlphaTab.Audio.Synth.Synthesis
{
    internal class Envelope
    {
        public float Delay { get; set; }
        public float Attack { get; set; }
        public float Hold { get; set; }
        public float Decay { get; set; }
        public float Sustain { get; set; }
        public float Release { get; set; }
        public float KeynumToHold { get; set; }
        public float KeynumToDecay { get; set; }

        public Envelope()
        {
        }

        public Envelope(Envelope other)
        {
            Delay = other.Delay;
            Attack = other.Attack;
            Hold = other.Hold;
            Decay = other.Decay;
            Sustain = other.Sustain;
            Release = other.Release;
            KeynumToHold = other.KeynumToHold;
            KeynumToDecay = other.KeynumToDecay;
        }

        public void Clear()
        {
            Delay = 0;
            Attack = 0;
            Hold = 0;
            Decay = 0;
            Sustain = 0;
            Release = 0;
            KeynumToHold = 0;
            KeynumToDecay = 0;
        }

        public void EnvToSecs(bool sustainIsGain)
        {
            // EG times need to be converted from timecents to seconds.
            // Pin very short EG segments.  Timecents don't get to zero, and our EG is
            // happier with zero values.
            Delay = (Delay < -11950.0f ? 0.0f : Utils.Timecents2Secs(Delay));
            Attack = (Attack < -11950.0f ? 0.0f : Utils.Timecents2Secs(Attack));
            Release = (Release < -11950.0f ? 0.0f : Utils.Timecents2Secs(Release));

            // If we have dynamic hold or decay times depending on key number we need
            // to keep the values in timecents so we can calculate it during startNote
            if (KeynumToHold == 0)
            {
                Hold = (Hold < -11950.0f ? 0.0f : Utils.Timecents2Secs(Hold));
            }

            if (KeynumToDecay == 0)
            {
                Decay = (Decay < -11950.0f ? 0.0f : Utils.Timecents2Secs(Decay));
            }

            if (Sustain < 0.0f)
            {
                Sustain = 0.0f;
            }
            else if (sustainIsGain)
            {
                Sustain = Utils.DecibelsToGain(-Sustain / 10.0f);
            }
            else
            {
                Sustain = 1.0f - (Sustain / 1000.0f);
            }
        }
    }
}
