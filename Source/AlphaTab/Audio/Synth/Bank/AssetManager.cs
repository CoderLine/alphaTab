using AlphaTab.Collections;

namespace AlphaTab.Audio.Synth.Bank
{
    class AssetManager
    {
        public FastList<PatchAsset> PatchAssets { get; }
        public FastList<SampleDataAsset> SampleAssets { get; }

        public AssetManager()
        {
            PatchAssets = new FastList<PatchAsset>();
            SampleAssets = new FastList<SampleDataAsset>();
        }

        public PatchAsset FindPatch(string name)
        {
            foreach (var patchAsset in PatchAssets)
            {
                if (patchAsset.Name == name)
                {
                    return patchAsset;
                }
            }
            return null;
        }

        public SampleDataAsset FindSample(string name)
        {
            foreach (var sampleDataAsset in SampleAssets)
            {
                if (sampleDataAsset.Name == name)
                {
                    return sampleDataAsset;
                }
            }
            return null;
        }
    }
}
