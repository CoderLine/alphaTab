using System.Collections;
using System.Collections.Generic;
using System.Runtime.CompilerServices;

namespace AlphaTab.Core.EcmaScript
{
    public class Uint32Array : IEnumerable<uint>
    {
        private readonly uint[] _data;

        public double Length => _data.Length;

        public Uint32Array(double size)
        {
            _data = new uint[(int) size];
        }

        public double this[double index]
        {
            [MethodImpl(MethodImplOptions.AggressiveInlining)]
            get => _data[(int) index];
            [MethodImpl(MethodImplOptions.AggressiveInlining)]
            set => _data[(int) index] = (uint) value;
        }

        public IEnumerator<uint> GetEnumerator()
        {
            return ((IEnumerable<uint>)_data).GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }
    }
}
