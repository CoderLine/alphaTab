namespace AlphaTab.Io
{
    internal static class TypeConversions
    {
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
    }
}
