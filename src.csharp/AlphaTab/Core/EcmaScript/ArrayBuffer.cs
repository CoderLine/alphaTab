using System;

namespace AlphaTab.Core.EcmaScript
{
    public class ArrayBuffer
    {
        public ArraySegment<byte> Raw { get; }
        public ArrayBuffer(double size)
        {
            Raw = new ArraySegment<byte>(new byte[(int) size]);
        }
        public ArrayBuffer(ArraySegment<byte> raw)
        {
            Raw = raw;
        }
    }
}
