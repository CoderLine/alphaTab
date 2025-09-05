using System;

namespace AlphaTab.Core.EcmaScript;

internal class DataView
{
    public ArrayBuffer Buffer { get; }
    public double ByteOffset { get; }
    public double ByteLength { get; }


    public DataView(ArrayBuffer buffer)
    {
        Buffer = buffer;
    }

    public DataView(ArrayBuffer buffer, double byteOffset, double byteLength)
    {
        Buffer = buffer;
        ByteOffset = byteOffset;
        ByteLength = byteLength;
    }

    public double GetInt16(double offset, bool littleEndian)
    {
        if (littleEndian == BitConverter.IsLittleEndian)
        {
            return BitConverter.ToInt16(Buffer.Raw, (int)(ByteOffset + offset));
        }

        var bytes = new byte[sizeof(short)];
        System.Buffer.BlockCopy(Buffer.Raw, (int)(ByteOffset + offset), bytes, 0,
            bytes.Length);
        System.Array.Reverse(bytes);
        return BitConverter.ToInt16(bytes, 0);
    }

    public double GetFloat32(double offset, bool littleEndian = true)
    {
        if (littleEndian == BitConverter.IsLittleEndian)
        {
            return BitConverter.ToSingle(Buffer.Raw, (int)(ByteOffset + offset));
        }

        var bytes = new byte[sizeof(float)];
        System.Buffer.BlockCopy(Buffer.Raw, (int)(ByteOffset + offset), bytes, 0,
            bytes.Length);
        System.Array.Reverse(bytes);
        return BitConverter.ToSingle(bytes, 0);
    }
}
