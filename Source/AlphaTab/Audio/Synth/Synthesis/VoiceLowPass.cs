using System;

namespace AlphaTab.Audio.Synth.Synthesis
{
    internal class VoiceLowPass
    {
        public double QInv { get; set; }
        public double A0 { get; set; }
        public double A1 { get; set; }
        public double B1 { get; set; }
        public double B2 { get; set; }
        public double Z1 { get; set; }
        public double Z2 { get; set; }
        public bool Active { get; set; }

        public VoiceLowPass()
        {
        }

        public VoiceLowPass(VoiceLowPass other)
        {
            QInv = other.QInv;
            A0 = other.A0;
            A1 = other.A1;
            B1 = other.B1;
            B2 = other.B2;
            Z1 = other.Z1;
            Z2 = other.Z2;
            Active = other.Active;
        }

        public void Setup(float fc)
        {
            // Lowpass filter from http://www.earlevel.com/main/2012/11/26/biquad-c-source-code/
            double k = Math.Tan(Math.PI * fc), KK = k * k;
            var norm = 1 / (1 + k * QInv + KK);
            A0 = KK * norm;
            A1 = 2 * A0;
            B1 = 2 * (KK - 1) * norm;
            B2 = (1 - k * QInv + KK) * norm;
        }

        public float Process(float input)
        {
            var output = input * A0 + Z1;
            Z1 = input * A1 + Z2 -B1 * output;
            Z2 = input * A0 - B2 * output;
            return (float)output;
        }
    }
}
