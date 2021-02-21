using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;

namespace AlphaTab.Core.EcmaScript
{
    public class Uint32Array : IEnumerable<uint>
    {
        private readonly uint[]? _data = null;
        private readonly DataView _raw;

        public double Length => _data?.Length ?? _raw.Buffer.Raw.Count / sizeof(uint);

        public Uint32Array(double size)
        {
            _data = new uint[(int) size];
        }

        public Uint32Array(ArrayBuffer buffer, double bufferOffset, double length)
        {
            _raw = new DataView(new ArrayBuffer(new ArraySegment<byte>(buffer.Raw.Array,
                buffer.Raw.Offset + (int) bufferOffset,
                (int) length)));
        }

        public double this[double index]
        {
            [MethodImpl(MethodImplOptions.AggressiveInlining)]
            get => _data?[(int) index] ?? _raw.GetUint32(index, true);
            [MethodImpl(MethodImplOptions.AggressiveInlining)]
            set
            {
                if (_data != null)
                {
                    _data[(int) index] = (uint) value;
                }
                else
                {
                    _raw.SetUint32(index, value, true);
                }
            }
        }

        public IEnumerator<uint> GetEnumerator()
        {
            if (_data != null)
            {
                return ((IEnumerable<uint>) _data).GetEnumerator();
            }

            return Enumerable.Range(0, (int)Length)
                .Select(i => (uint) _raw.GetUint32(i, false))
                .GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }
    }
}
