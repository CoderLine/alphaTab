using System;

namespace AlphaTab.Audio.Synth.Synthesis
{
    class Utils
    {
        public static float Timecents2Secs(float timecents)
        {
            return (float)Math.Pow(2f, timecents / 1200f);
        }

        public static double Timecents2Secs(double timecents)
        {
            return Math.Pow(2.0, timecents / 1200.0);
        }

        public static float DecibelsToGain(float db)
        {
            return db > -100f ? (float) Math.Pow(10.0f, db * 0.05f) : 0;
        }

        public static float GainToDecibels(float gain)
        {
            return (gain <= .00001f ? -100f : (float)(20.0 * Math.Log10(gain)));
        }

        public static float Cents2Hertz(float cents)
        {
            return 8.176f * (float)Math.Pow(2.0f, cents / 1200.0f);
        }
    }
}