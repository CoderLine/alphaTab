namespace AlphaTab.Audio.Synth.Bank.Descriptors
{
    internal class EnvelopeDescriptor
    {
        public float DelayTime { get; set; }
        public float AttackTime { get; set; }
        public short AttackGraph { get; set; }
        public float HoldTime { get; set; }
        public float DecayTime { get; set; }
        public short DecayGraph { get; set; }
        public float SustainTime { get; set; }
        public float ReleaseTime { get; set; }
        public short ReleaseGraph { get; set; }
        public float SustainLevel { get; set; }
        public float PeakLevel { get; set; }
        public float StartLevel { get; set; }
        public float Depth { get; set; }
        public float Vel2Delay { get; set; }
        public float Vel2Attack { get; set; }
        public float Vel2Hold { get; set; }
        public float Vel2Decay { get; set; }
        public float Vel2Sustain { get; set; }
        public float Vel2Release { get; set; }
        public float Vel2Depth { get; set; }

        public EnvelopeDescriptor()
        {
            DelayTime = 0;
            AttackTime = 0;
            AttackGraph = 1;
            HoldTime = 0;
            DecayTime = 0;
            DecayGraph = 1;
            SustainTime = 3600;
            ReleaseTime = 0;
            ReleaseGraph = 1;
            SustainLevel = 0;
            PeakLevel = 1;
            StartLevel = 0;
            Depth = 1;
            Vel2Delay = 0;
            Vel2Attack = 0;
            Vel2Hold = 0;
            Vel2Decay = 0;
            Vel2Sustain = 0;
            Vel2Release = 0;
            Vel2Depth = 0;
        }
    }
}
