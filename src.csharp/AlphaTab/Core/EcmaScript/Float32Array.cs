using System;
using System.Collections.Generic;
using System.Linq;

namespace AlphaTab.Core.EcmaScript
{
    public class Float32Array
    {
        private ArraySegment<float> _data;
        public double Length => _data.Count;

        public Float32Array(ArrayBuffer buffer)
            : this(buffer.Raw.Count / sizeof(float))
        {
            Buffer.BlockCopy(buffer.Raw.Array, buffer.Raw.Offset, _data.Array, 0, buffer.Raw.Count);
        }

        private Float32Array(ArraySegment<float> data)
        {
            _data = data;
        }

        public Float32Array(double size)
        {
            _data = new ArraySegment<float>(new float[(int) size]);
        }

        public Float32Array(IEnumerable<double> values)
        {
            _data = new ArraySegment<float>(values.Cast<float>().ToArray());
        }

        public Float32Array(IEnumerable<int> values)
        {
            _data = new ArraySegment<float>(values.Cast<float>().ToArray());
        }

        public double this[double index]
        {
            get => _data.Array[_data.Offset + (int) index];
            set => _data.Array[_data.Offset + (int) index] = (float) value;
        }

        public Float32Array Subarray(double start, double end)
        {
            return new Float32Array(new ArraySegment<float>(_data.Array,
                _data.Offset + (int) start,
                (int) (end - start)));
        }

        public void Set(Float32Array subarray, double offset)
        {
            Buffer.BlockCopy(subarray._data.Array,
                subarray._data.Offset,
                _data.Array,
                _data.Offset + (int) offset,
                subarray._data.Count * sizeof(float));
        }
    }
}
