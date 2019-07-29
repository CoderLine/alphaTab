namespace AlphaTab.Audio.Synth.Sf2
{
    internal class PresetHeader
    {
        public string Name { get; set; }
        public int PatchNumber { get; set; }
        public int BankNumber { get; set; }
        public int Library { get; set; }
        public int Genre { get; set; }
        public int Morphology { get; set; }
        public Zone[] Zones { get; set; }
    }
}
