using AlphaTab.Audio.Synth.Bank.Components;

namespace AlphaTab.Audio.Synth.Bank.Descriptors
{
    internal class FilterDescriptor
    {
        public FilterType FilterMethod { get; set; }
        public float CutOff { get; set; }
        public float Resonance { get; set; }
        public short RootKey { get; set; }
        public short KeyTrack { get; set; }
        public short VelTrack { get; set; }

        public FilterDescriptor()
        {
            FilterMethod = FilterType.None;
            CutOff = -1;
            Resonance = 1;
            RootKey = 60;
            KeyTrack = 0;
            VelTrack = 0;
        }
    }
}
