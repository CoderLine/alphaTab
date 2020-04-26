using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using AlphaTab.Core.Es2015;

namespace AlphaTab.Core.Es2016
{
    public class Uint8Array
    {
        private byte[] _data;
        public double Length => _data.Length;
        public ArrayBuffer Buffer { get; set; }

        public Uint8Array(byte[] data)
        {
            throw new NotImplementedException();
        }
        public Uint8Array(double size)
        {
            throw new NotImplementedException();
        }

        public Uint8Array(IEnumerable<double> values)
        {
            throw new NotImplementedException();
        }

        public Uint8Array(IEnumerable<int> values)
        {
            throw new NotImplementedException();
        }

        public double this[double index]
        {
            [MethodImpl(MethodImplOptions.AggressiveInlining)]
            get => _data[(int) index];
            [MethodImpl(MethodImplOptions.AggressiveInlining)]
            set => _data[(int) index] = (byte)value;
        }

        public Uint8Array Subarray(double i, double length)
        {
            throw new System.NotImplementedException();
        }

        public void Set(Uint8Array subarray, double pos)
        {
            throw new System.NotImplementedException();
        }
    }
}
