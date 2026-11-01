using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;

namespace AlphaTab.Core.EcmaScript;

internal class Int8Array : IEnumerable<sbyte>
{
    private readonly ArraySegment<sbyte> _data;

    public double Length => _data.Count;

    public Int8Array(double size)
    {
        _data = new ArraySegment<sbyte>(new sbyte[(int)size]);
    }

    public Int8Array(IEnumerable<double> list)
    {
        _data = new ArraySegment<sbyte>(list.Select(i => (sbyte)i).ToArray());
    }

    private Int8Array(ArraySegment<sbyte> data)
    {
        _data = data;
    }

    public double this[double index]
    {
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        get => _data.Array![_data.Offset + (int)index];
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        set => _data.Array![_data.Offset + (int)index] = (sbyte)value;
    }

    public void Fill(double value)
    {
        if (value == 0)
        {
            System.Array.Clear(_data.Array!, _data.Offset, _data.Count);
        }
        else
        {
            var v = (sbyte)value;
            for (var i = 0; i < _data.Count; i++)
            {
                _data.Array![_data.Offset + i] = v;
            }
        }
    }

    public Int8Array Subarray(double start, double end)
    {
        return new Int8Array(new ArraySegment<sbyte>(_data.Array!, _data.Offset + (int)start,
            (int)end - (int)start));
    }

    public void Set(Int8Array subarray, double offset)
    {
        System.Array.Copy(subarray._data.Array!, subarray._data.Offset, _data.Array!,
            _data.Offset + (int)offset, subarray._data.Count);
    }

    public IEnumerator<sbyte> GetEnumerator()
    {
        return ((IEnumerable<sbyte>)_data).GetEnumerator();
    }

    IEnumerator IEnumerable.GetEnumerator()
    {
        return GetEnumerator();
    }
}
