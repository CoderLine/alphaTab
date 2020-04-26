using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;

namespace AlphaTab.Core.Es2016
{
    public class Int32Array
    {
        private int[] _data;
        public double Length => _data.Length;

        public Int32Array(double size)
        {
            _data = new int[(int)size];
        }

        public Int32Array(IEnumerable<double> values)
        {
            _data = values.Cast<int>().ToArray();
        }

        public Int32Array(IEnumerable<int> values)
        {
            _data = values.Cast<int>().ToArray();
        }

        public double this[double index]
        {
            [MethodImpl(MethodImplOptions.AggressiveInlining)]
            get => _data[(int) index];
            [MethodImpl(MethodImplOptions.AggressiveInlining)]
            set => _data[(int) index] = (int)value;
        }

        public Int32Array Subarray(int i, double length)
        {
            throw new System.NotImplementedException();
        }

        public void Set(Int32Array subarray, int pos)
        {
            throw new System.NotImplementedException();
        }

        public void Fill(int i)
        {
            throw new System.NotImplementedException();
        }
    }
}
