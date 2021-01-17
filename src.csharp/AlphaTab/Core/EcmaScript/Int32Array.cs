using System;
using System.Collections;
using System.Collections.Generic;
using System.Runtime.CompilerServices;

namespace AlphaTab.Core.EcmaScript
{
    public class Int32Array : IEnumerable<int>
    {
        private readonly int[] _data;

        public double Length => _data.Length;

        public Int32Array(double size)
        {
            _data = new int[(int) size];
        }

        public double this[double index]
        {
            [MethodImpl(MethodImplOptions.AggressiveInlining)]
            get => _data[(int) index];
            [MethodImpl(MethodImplOptions.AggressiveInlining)]
            set => _data[(int) index] = (int) value;
        }

        public void Fill(int i)
        {
            if (i == 0)
            {
                System.Array.Clear(_data, 0, _data.Length);
            }
            else
            {
                for (var j = 0; j < _data.Length; j++)
                {
                    _data[j] = i;
                }
            }
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
}
