using System;

namespace AlphaTab.Core.EcmaScript
{
    public class ArrayBuffer
    {
        public ArraySegment<byte> Raw { get; }
        public double ByteLength => Raw.Count;

        public ArrayBuffer(double size)
        {
            Raw = new ArraySegment<byte>(new byte[(int) size]);
        }

        public ArrayBuffer(byte[] raw)
        {
            Raw = new ArraySegment<byte>(raw, 0, raw.Length);
        }
        public ArrayBuffer(ArraySegment<byte> raw)
        {
            Raw = raw;
        }
    }
}
