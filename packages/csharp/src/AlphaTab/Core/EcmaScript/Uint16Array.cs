using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;

namespace AlphaTab.Core.EcmaScript;

internal class Uint16Array : IEnumerable<ushort>
{
    private readonly ArraySegment<ushort> _data;

    public double Length => _data.Count;

    public Uint16Array(double size)
    {
        _data = new ArraySegment<ushort>(new ushort[(int)size]);
    }

    public Uint16Array(IEnumerable<double> list)
    {
        _data = new ArraySegment<ushort>(list.Select(i => (ushort)i).ToArray());
    }

    private Uint16Array(ArraySegment<ushort> data)
    {
        _data = data;
    }

    public double this[double index]
    {
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        get => _data.Array![_data.Offset + (int)index];
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        set => _data.Array![_data.Offset + (int)index] = (ushort)value;
    }

    public void Fill(double value)
    {
        if (value == 0)
        {
            System.Array.Clear(_data.Array!, _data.Offset, _data.Count);
        }
        else
        {
            var v = (ushort)value;
            for (var i = 0; i < _data.Count; i++)
            {
                _data.Array![_data.Offset + i] = v;
            }
        }
    }

    public Uint16Array Subarray(double start, double end)
    {
        return new Uint16Array(new ArraySegment<ushort>(_data.Array!, _data.Offset + (int)start,
            (int)end - (int)start));
    }

    public void Set(Uint16Array subarray, double offset)
    {
        System.Array.Copy(subarray._data.Array!, subarray._data.Offset, _data.Array!,
            _data.Offset + (int)offset, subarray._data.Count);
    }

    public IEnumerator<ushort> GetEnumerator()
    {
        return ((IEnumerable<ushort>)_data).GetEnumerator();
    }

    IEnumerator IEnumerable.GetEnumerator()
    {
        return GetEnumerator();
    }
}
