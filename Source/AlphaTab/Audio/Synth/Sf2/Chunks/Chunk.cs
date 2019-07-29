namespace AlphaTab.Audio.Synth.Sf2.Chunks
{
    internal class Chunk
    {
        public string Id { get; private set; }
        public int Size { get; private set; }

        public Chunk(string id, int size)
        {
            Id = id;
            Size = size;
        }
    }
}
