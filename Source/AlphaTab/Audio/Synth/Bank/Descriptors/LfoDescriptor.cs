using AlphaTab.Audio.Synth.Bank.Components.Generators;
using AlphaTab.Audio.Synth.Util;

namespace AlphaTab.Audio.Synth.Bank.Descriptors
{
    internal class LfoDescriptor
    {
        public float DelayTime { get; set; }
        public float Frequency { get; set; }
        public float Depth { get; set; }
        public Components.Generators.Generator Generator { get; set; }

        public LfoDescriptor()
        {
            DelayTime = 0;
            Frequency = SynthConstants.DefaultLfoFrequency;
            Depth = 1;
            Generator = DefaultGenerators.DefaultSine;
        }
    }
}
