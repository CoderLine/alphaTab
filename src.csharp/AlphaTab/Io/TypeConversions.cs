using System;

namespace AlphaTab.Io
{
    internal static class TypeConversions
    {
        public static double BytesToFloat32LE(Uint8Array array)
        {
            return BitConverter.ToSingle(array.Data.Array!, array.Data.Offset);
        }

        public static double BytesToFloat64LE(Uint8Array array)
        {
            return BitConverter.ToDouble(array.Data.Array!, array.Data.Offset);
        }

        public static double Int32ToUint16(double v)
        {
            return (ushort)(int)v;
        }

        public static double Int32ToInt16(double v)
        {
            return (short)(int)v;
        }

        public static double Int32ToUint32(double v)
        {
            return (uint)(int)v;
        }

        public static double Uint16ToInt16(double v)
        {
            return (short)(ushort)(int)v;
        }

        public static double Int16ToUint32(double v)
        {
            return (uint)(short)(int)v;
        }

        public static double BytesToInt64LE(Uint8Array array)
        {
            return BitConverter.ToInt64(array.Buffer.Raw.Array!,
                array.Buffer.Raw.Offset + (int)array.ByteOffset);
        }
    }
}
