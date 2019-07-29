namespace AlphaTab.Audio.Synth.Bank
{
    internal class PatchAsset
    {
        public string Name { get; }
        public Patch.Patch Patch { get; }

        public PatchAsset(string name, Patch.Patch patch)
        {
            Name = name;
            Patch = patch;
        }
    }
}
