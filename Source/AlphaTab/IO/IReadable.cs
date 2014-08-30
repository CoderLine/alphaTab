namespace AlphaTab.IO
{
    public interface IReadable
    {
        void Reset();
        void Skip(int offset);
        int ReadByte();
        int Read(ByteArray buffer, int offset, int count);
    }
}