namespace AlphaTab.IO
{
    public interface IWriteable
    {
        void WriteByte(byte value);
        void Write(ByteArray buffer, int offset, int count);
    }
}