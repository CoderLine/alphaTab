using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;

namespace AlphaTab.Core.EcmaScript;

public class Uint8Array : IEnumerable<byte>, IEnumerable<double>
{
    public double Length { get; }
    public double ByteOffset { get; }

    public ArrayBuffer Buffer { get; }

    internal Uint8Array(ArrayBuffer buffer) : this(buffer, 0, buffer.Raw.Length)
    {
    }

    public Uint8Array() : this(System.Array.Empty<byte>())
    {
    }

    public Uint8Array(byte[] data) : this(new ArrayBuffer(data))
    {
    }

    public Uint8Array(double size)
        : this(new byte[(int)size])
    {
    }

    internal Uint8Array(ArrayBuffer buffer, double byteOffset, double byteLength)
    {
        Buffer = buffer;
        ByteOffset = byteOffset;
        Length = byteLength;
    }

    public Uint8Array(IEnumerable<int> values)
        : this(values.Select(d => (byte)d).ToArray())
    {
    }

    public double this[double index]
    {
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        get => Buffer.Raw[(int)ByteOffset + (int)index];
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        set => Buffer.Raw[(int)ByteOffset + (int)index] = (byte)value;
    }

    public Uint8Array Subarray(double begin, double end)
    {
        return new Uint8Array(Buffer,
            ByteOffset + begin,
            (int)(end - begin)
        );
    }

    public void Set(Uint8Array subarray, double pos)
    {
        var buffer = subarray.Buffer.Raw;
        System.Buffer.BlockCopy(buffer, (int)subarray.ByteOffset, Buffer.Raw,
            (int)(ByteOffset + pos), (int)subarray.Length);
    }

    public static implicit operator Uint8Array(byte[] v)
    {
        return new Uint8Array(v);
    }

    IEnumerator<double> IEnumerable<double>.GetEnumerator()
    {
        for (var i = 0; i < Length; i++)
        {
            yield return this[i];
        }
    }

    public IEnumerator<byte> GetEnumerator()
    {
        for (var i = 0; i < Length; i++)
        {
            yield return Buffer.Raw[(int)(ByteOffset + i)];
        }
    }

    IEnumerator IEnumerable.GetEnumerator()
    {
        return GetEnumerator();
    }

    public Uint8Array Slice(double startByte, double endByte)
    {
        return new Uint8Array(
            Buffer,
            ByteOffset + startByte,
            endByte - startByte
        );
    }

    public void Reverse()
    {
        System.Array.Reverse(
            Buffer.Raw,
            (int)ByteOffset,
            (int)Length
        );
    }
}
