using System;
using System.Runtime.CompilerServices;

namespace AlphaTab.Core.EcmaScript
{
    public class Float64Array
    {
        private readonly double[] _data;

        public Float64Array(ArrayBuffer buffer)
        {
            _data = new double[buffer.Raw.Count / sizeof(double)];
            Buffer.BlockCopy(buffer.Raw.Array, buffer.Raw.Offset, _data, 0, buffer.Raw.Count);
        }

        public double this[double index]
        {
            [MethodImpl(MethodImplOptions.AggressiveInlining)]
            get => _data[(int) index];
        }
    }
}
