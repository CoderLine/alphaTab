using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;

namespace AlphaTab.Core.EcmaScript;

public class Uint8Array : IEnumerable<byte>, IEnumerable<double>
{
    private ArraySegment<byte> _data;

    public double Length => _data.Count;
    public double ByteOffset => _data.Offset;

    internal ArrayBuffer Buffer => new ArrayBuffer(_data);

    public ArraySegment<byte> Data => _data;

    internal Uint8Array(IList<double> data)
    {
        _data = new ArraySegment<byte>(data.Select(d => (byte)d).ToArray());
    }

    internal Uint8Array(ArrayBuffer buffer)
    {
        _data = buffer.Raw;
    }

    public Uint8Array() : this(System.Array.Empty<byte>())
    {
    }

    public Uint8Array(byte[] data)
    {
        _data = new ArraySegment<byte>(data);
    }

    private Uint8Array(ArraySegment<byte> data)
    {
        _data = data;
    }

    public Uint8Array(double size)
        : this(new byte[(int)size])
    {
    }

    public Uint8Array(IEnumerable<int> values)
        : this(values.Select(d => (byte)d).ToArray())
    {
    }

    public double this[double index]
    {
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        get => _data.Array![_data.Offset + (int)index];
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        set => _data.Array![_data.Offset + (int)index] = (byte)value;
    }

    public Uint8Array Subarray(double begin, double end)
    {
        return new Uint8Array(new ArraySegment<byte>(_data.Array!, _data.Offset + (int)begin,
            (int)(end - begin)));
    }

    public void Set(Uint8Array subarray, double pos)
    {
        var buffer = subarray.Buffer.Raw;
        System.Buffer.BlockCopy(buffer.Array!, buffer.Offset, _data.Array!,
            _data.Offset + (int)pos, buffer.Count);
    }

    public static implicit operator Uint8Array(byte[] v)
    {
        return new Uint8Array(v);
    }

    IEnumerator<double> IEnumerable<double>.GetEnumerator()
    {
        return _data.Select(d => (double)d).GetEnumerator();
    }

    public IEnumerator<byte> GetEnumerator()
    {
        return ((IEnumerable<byte>)_data).GetEnumerator();
    }

    IEnumerator IEnumerable.GetEnumerator()
    {
        return GetEnumerator();
    }

    public Uint8Array Slice(double startByte, double endByte)
    {
        return new Uint8Array(new ArraySegment<byte>(
            _data.Array!,
            _data.Offset + (int)startByte,
            (int)endByte - (int)startByte
        ));
    }

    public void Reverse()
    {
        System.Array.Reverse(
            _data.Array!,
            _data.Offset,
            _data.Count
        );
    }
}