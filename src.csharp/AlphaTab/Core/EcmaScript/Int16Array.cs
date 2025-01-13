using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Runtime.CompilerServices;

namespace AlphaTab.Core.EcmaScript;

internal class Int16Array : IEnumerable<short>
{
    private readonly short[]? _data;
    private readonly ArrayBuffer? _buffer;

    public double Length => _data?.Length ?? _buffer.ByteLength / 2;

    public Int16Array(double size)
    {
        _data = new short[(int)size];
    }

    internal Int16Array(ArrayBuffer buffer)
    {
        _buffer = buffer;
    }

    public double this[double index]
    {
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        get
        {
            return _data != null
                ? _data[(int)index]
                : GetInt16FromBuffer(index);
        }
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        set
        {
            if (_data != null)
            {
                _data[(int)index] = (short)value;
            }
            else
            {
                var bytes = BitConverter.GetBytes(value);

                Buffer.BlockCopy(bytes,
                    0, _buffer.Raw.Array!,
                    (_buffer.Raw.Offset + ((int)index * sizeof(short))),
                    bytes.Length * sizeof(short)
                );
            }
        }
    }

    private short GetInt16FromBuffer(double index)
    {
        return BitConverter.ToInt16(_buffer.Raw.Array!,
            _buffer.Raw.Offset + ((int)index * sizeof(short)));
    }

    public IEnumerator<short> GetEnumerator()
    {
        if (_data == null)
        {
            return Enumerable.Range(0, (int)Length)
                .Select(i => GetInt16FromBuffer(i))
                .GetEnumerator();
        }

        return ((IEnumerable<short>)_data).GetEnumerator();
    }

    IEnumerator IEnumerable.GetEnumerator()
    {
        return GetEnumerator();
    }
}