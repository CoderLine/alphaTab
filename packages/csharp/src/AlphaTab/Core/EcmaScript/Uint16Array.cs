using System.Collections;
using System.Collections.Generic;
using System.Runtime.CompilerServices;

namespace AlphaTab.Core.EcmaScript;

internal class Uint16Array : IEnumerable<ushort>
{
    private readonly ushort[] _data;

    public double Length => _data.Length;

    public Uint16Array(double size)
    {
        _data = new ushort[(int) size];
    }

    public double this[double index]
    {
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        get => _data[(int) index];
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        set => _data[(int) index] = (ushort) value;
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