using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;

namespace AlphaTab.Core.EcmaScript;

internal class Int16Array : IEnumerable<short>
{
    private readonly ArraySegment<short> _data;

    public double Length => _data.Count;

    public Int16Array(double size)
    {
        _data = new ArraySegment<short>(new short[(int)size]);
    }

    public Int16Array(IEnumerable<double> list)
    {
        _data = new ArraySegment<short>(list.Select(i => (short)i).ToArray());
    }

    private Int16Array(ArraySegment<short> data)
    {
        _data = data;
    }

    public double this[double index]
    {
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        get => _data.Array![_data.Offset + (int)index];
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        set => _data.Array![_data.Offset + (int)index] = (short)value;
    }

    public void Fill(double value)
    {
        if (value == 0)
        {
            System.Array.Clear(_data.Array!, _data.Offset, _data.Count);
        }
        else
        {
            var v = (short)value;
            for (var i = 0; i < _data.Count; i++)
            {
                _data.Array![_data.Offset + i] = v;
            }
        }
    }

    public Int16Array Subarray(double start, double end)
    {
        return new Int16Array(new ArraySegment<short>(_data.Array!, _data.Offset + (int)start,
            (int)end - (int)start));
    }

    public void Set(Int16Array subarray, double offset)
    {
        System.Array.Copy(subarray._data.Array!, subarray._data.Offset, _data.Array!,
            _data.Offset + (int)offset, subarray._data.Count);
    }

    public IEnumerator<short> GetEnumerator()
    {
        return ((IEnumerable<short>)_data).GetEnumerator();
    }

    IEnumerator IEnumerable.GetEnumerator()
    {
        return GetEnumerator();
    }
}
