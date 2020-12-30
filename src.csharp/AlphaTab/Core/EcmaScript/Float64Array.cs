using System;
using System.Collections;
using System.Collections.Generic;
using System.Runtime.CompilerServices;

namespace AlphaTab.Core.EcmaScript
{
    public class Float64Array : IEnumerable<double>
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

        public IEnumerator<double> GetEnumerator()
        {
            return ((IEnumerable<double>)_data).GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }
    }
}
