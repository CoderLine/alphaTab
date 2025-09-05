using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;

namespace AlphaTab.Core.EcmaScript;

internal class Int32Array : IEnumerable<int>
{
    private readonly ArraySegment<int> _data;

    public double Length => _data.Count;

    public Int32Array(double size)
    {
        _data = new ArraySegment<int>(new int[(int)size]);
    }

    public Int32Array(IList<double> list)
    {
        _data = new ArraySegment<int>(list.Select(i => (int)i).ToArray());
    }

    public Int32Array(IList<int> list)
    {
        _data = new ArraySegment<int>(list.ToArray());
    }

    private Int32Array(ArraySegment<int> data)
    {
        _data = data;
    }

    public double this[double index]
    {
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        get => _data.Array![_data.Offset + (int)index];
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        set => _data.Array![_data.Offset + (int)index] = (int)value;
    }

    public void Fill(int i)
    {
        if (i == 0)
        {
            System.Array.Clear(_data.Array!, _data.Offset, _data.Count);
        }
        else
        {
            for (var j = 0; j < _data.Count; j++)
            {
                _data.Array![_data.Offset + j] = i;
            }
        }
    }

    public Int32Array Subarray(double start, double end)
    {
        return new Int32Array(new ArraySegment<int>(_data.Array!, _data.Offset + (int)start,
            (int)end - (int)start));
    }

    public void Set(Int32Array subarray, double offset)
    {
        Buffer.BlockCopy(subarray._data.Array!,
            subarray._data.Offset * sizeof(int),
            _data.Array!,
            _data.Offset + (int)offset * sizeof(int),
            subarray._data.Count * sizeof(int));
    }

    public IEnumerator<int> GetEnumerator()
    {
        return ((IEnumerable<int>)_data).GetEnumerator();
    }

    IEnumerator IEnumerable.GetEnumerator()
    {
        return GetEnumerator();
    }
}
