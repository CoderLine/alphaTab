using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;

namespace AlphaTab.Core.Es2016
{
    public class Int16Array
    {
        private short[] _data;
        public double Length => _data.Length;

        public Int16Array(double size)
        {
            throw new NotImplementedException();
        }

        public Int16Array(IEnumerable<double> values)
        {
            throw new NotImplementedException();
        }

        public Int16Array(IEnumerable<int> values)
        {
            throw new NotImplementedException();
        }

        public double this[double index]
        {
            [MethodImpl(MethodImplOptions.AggressiveInlining)]
            get => throw new NotImplementedException();

            [MethodImpl(MethodImplOptions.AggressiveInlining)]
            set => throw new NotImplementedException();
        }

        public Int16Array Subarray(int i, double length)
        {
            throw new System.NotImplementedException();
        }

        public void Set(Int16Array subarray, int pos)
        {
            throw new System.NotImplementedException();
        }
    }
}
