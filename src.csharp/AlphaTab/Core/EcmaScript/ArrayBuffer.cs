namespace AlphaTab.Core.EcmaScript;

public class ArrayBuffer
{
    public byte[] Raw { get; }
    public double ByteLength => Raw.Length;

    public ArrayBuffer(double size)
    {
        Raw = new byte[(int) size];
    }
    public ArrayBuffer(byte[] raw)
    {
        Raw = raw;
    }
}
