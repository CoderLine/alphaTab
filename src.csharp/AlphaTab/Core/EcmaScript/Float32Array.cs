using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;

namespace AlphaTab.Core.EcmaScript
{
    public class Float32Array : IEnumerable<float>
    {
        public readonly float[] Data;
        public double Length => Data.Length;


        public Float32Array(ArrayBuffer buffer)
            : this(buffer.Raw.Count / sizeof(float))
        {
            Buffer.BlockCopy(buffer.Raw.Array, buffer.Raw.Offset, Data, 0, buffer.Raw.Count);
        }

        private Float32Array(float[] data)
        {
            Data = data;
        }

        public Float32Array(double size)
        {
            Data = new float[(int) size];
        }

        public Float32Array(IEnumerable<double> values)
        {
            Data = values.Select(d => (float) d).ToArray();
        }

        public Float32Array(IEnumerable<int> values)
        {
            Data = values.Select(d => (float) d).ToArray();
        }

        public double this[double index]
        {
            [MethodImpl(MethodImplOptions.AggressiveInlining)]
            get => Data[(int) index];
            [MethodImpl(MethodImplOptions.AggressiveInlining)]
            set => Data[(int) index] = (float) value;
        }

        public Float32Array Subarray(double start, double end)
        {
            var sub = new float[(int)(end - start)];
            Buffer.BlockCopy(Data, (int) start * sizeof(float), sub, 0, sub.Length * sizeof(float));
            return new Float32Array(sub);
        }

        public void Set(Float32Array subarray, double offset)
        {
            Buffer.BlockCopy(subarray.Data,
                    0,
                Data,
                (int) offset * sizeof(float),
                subarray.Data.Length * sizeof(float));
        }

        public IEnumerator<float> GetEnumerator()
        {
            return ((IEnumerable<float>)Data).GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }
    }
}
