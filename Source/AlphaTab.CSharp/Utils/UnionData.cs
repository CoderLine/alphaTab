using System.Runtime.InteropServices;

namespace AlphaTab.Utils
{
    [StructLayout(LayoutKind.Explicit)]
    struct UnionData
    {
        //double values
        [FieldOffset(0)]
        public double Double1;
        //float values
        [FieldOffset(0)]
        public float Float1;
        [FieldOffset(4)]
        public float Float2;
        //int values
        [FieldOffset(0)]
        public int Int1;
        [FieldOffset(4)]
        public int Int2;
    }
}
