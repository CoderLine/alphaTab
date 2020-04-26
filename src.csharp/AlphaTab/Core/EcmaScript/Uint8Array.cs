using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;

namespace AlphaTab.Core.EcmaScript
{
    public class Uint8Array
    {
        private ArraySegment<byte> _data;

        public double Length => _data.Count;

        public ArrayBuffer Buffer => new ArrayBuffer(_data);

        public Uint8Array(byte[] data)
        {
            _data = new ArraySegment<byte>(data);
        }

        private Uint8Array(ArraySegment<byte> data)
        {
            _data = data;
        }

        public Uint8Array(double size)
            : this(new byte[(int) size])
        {
        }

        public Uint8Array(IEnumerable<double> values)
            : this(values.Cast<byte>().ToArray())
        {
        }

        public Uint8Array(IEnumerable<int> values)
            : this(values.Cast<byte>().ToArray())
        {
        }

        public double this[double index]
        {
            [MethodImpl(MethodImplOptions.AggressiveInlining)]
            get => _data.Array[_data.Offset + (int) index];
            [MethodImpl(MethodImplOptions.AggressiveInlining)]
            set => _data.Array[_data.Offset + (int) index] = (byte) value;
        }

        public Uint8Array Subarray(double begin, double end)
        {
            return new Uint8Array(new ArraySegment<byte>(_data.Array, _data.Offset + (int) begin,
                (int)(end - begin)));
        }

        public void Set(Uint8Array subarray, double pos)
        {
            var buffer = subarray.Buffer.Raw;
            System.Buffer.BlockCopy(buffer.Array, (int) buffer.Offset, _data.Array,
                _data.Offset + (int) pos, buffer.Count);
        }
    }
}
