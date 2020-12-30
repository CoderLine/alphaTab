using System;
using System.Collections;
using System.Collections.Generic;
using System.Runtime.CompilerServices;

namespace AlphaTab.Core.EcmaScript
{
    public class Int16Array : IEnumerable<short>
    {
        private readonly short[] _data;

        public double Length => _data.Length;

        public Int16Array(double size)
        {
            _data = new short[(int) size];
        }

        public double this[double index]
        {
            [MethodImpl(MethodImplOptions.AggressiveInlining)]
            get => _data[(int) index];
            [MethodImpl(MethodImplOptions.AggressiveInlining)]
            set => _data[(int) index] = (short) value;
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
}
