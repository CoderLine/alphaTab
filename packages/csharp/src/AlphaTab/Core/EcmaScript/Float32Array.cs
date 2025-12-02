using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;

namespace AlphaTab.Core.EcmaScript;

public class Float32Array : IEnumerable<float>
{
    internal readonly ArraySegment<float> Data;
    public double Length => Data.Count;

    internal ArrayBuffer Buffer
    {
        get
        {
            var bytes = new byte[Data.Count * sizeof(float)];
            System.Buffer.BlockCopy(Data.Array!, Data.Offset, bytes, 0, bytes.Length);
            return new ArrayBuffer(bytes);
        }
    }

    internal double ByteOffset => 0;
    internal double ByteLength => Length * sizeof(float);

    public Float32Array(float[] data)
    {
        Data = new ArraySegment<float>(data);
    }

    public Float32Array(double size)
    {
        Data = new ArraySegment<float>(new float[(int)size]);
    }

    public Float32Array(IEnumerable<double> values)
    {
        Data = new ArraySegment<float>(values.Select(d => (float)d).ToArray());
    }

    public Float32Array(IEnumerable<int> values)
    {
        Data = new ArraySegment<float>(values.Select(d => (float)d).ToArray());
    }

    private Float32Array(ArraySegment<float> data)
    {
        Data = data;
    }

    public double this[double index]
    {
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        get => Data.Array![Data.Offset + (int)index];
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        set => Data.Array![Data.Offset + (int)index] = (float)value;
    }

    public Float32Array Subarray(double start, double end)
    {
        return new Float32Array(new ArraySegment<float>(Data.Array!, Data.Offset + (int)start,
            (int)end - (int)start));
    }

    public void Set(Float32Array subarray, double offset)
    {
        System.Buffer.BlockCopy(subarray.Data.Array!,
            subarray.Data.Offset * sizeof(float),
            Data.Array!,
            Data.Offset + (int)offset * sizeof(float),
            subarray.Data.Count * sizeof(float));
    }

    public IEnumerator<float> GetEnumerator()
    {
        return ((IEnumerable<float>)Data).GetEnumerator();
    }

    IEnumerator IEnumerable.GetEnumerator()
    {
        return GetEnumerator();
    }

    public void Fill(double value, double start, double end)
    {
        var count = (int)end - (int)start;
        if (value == 0)
        {
            System.Array.Clear(Data.Array!, Data.Offset + (int)start, count);
        }
        else
        {
            for (var i = 0; i < count; i++)
            {
                Data.Array![Data.Offset + i] = i;
            }
        }
    }
}
