using AlphaTab.Audio.Synth.Bank.Descriptors;

namespace AlphaTab.Audio.Synth.Bank.Components.Generators
{
    internal class DefaultGenerators
    {
        public static readonly Generator DefaultSine = new SineGenerator(new GeneratorDescriptor());
        public static readonly Generator DefaultSaw = new SawGenerator(new GeneratorDescriptor());
        public static readonly Generator DefaultSquare = new SquareGenerator(new GeneratorDescriptor());
        public static readonly Generator DefaultTriangle = new TriangleGenerator(new GeneratorDescriptor());
    }
}
