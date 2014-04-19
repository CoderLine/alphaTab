using System;
using System.Globalization;
using AlphaTab.IO;

namespace AlphaTab.Platform
{
    public static class Std
    {
        public static float ParseFloat(string s)
        {
            float f;
#if CSharp
            if (!float.TryParse(s, NumberStyles.Float, CultureInfo.InvariantCulture, out f))
            {
                f = float.NaN;
            }
#elif JavaScript
            double d = double.Parse(s);
            if(double.IsNaN(d)) 
            {
                f = float.NaN;
            }
            else
            {
                f = (float)d;
            }
#endif
            return f;
        }

        public static int ParseInt(string s)
        {
            int f;
#if CSharp
            if (!int.TryParse(s, NumberStyles.Integer, CultureInfo.InvariantCulture, out f))
            {
                f = 0;
            }
#elif JavaScript
            if (!int.TryParse(s, out f))
            {
                f = 0;
            }
#endif
            return f;
        }


        [System.Runtime.CompilerServices.InlineCodeAttribute("{dst}.set({src}.subarray({srcOffset}, {srcOffset} + {count}), {dstOffset})")]
        public static void BlockCopy(ByteArray src, int srcOffset, ByteArray dst, int dstOffset, int count)
        {
            Buffer.BlockCopy(src.Data, srcOffset, dst.Data, dstOffset, count);
        }

        public static bool IsNullOrWhiteSpace(this string s)
        {
#if CSharp
            return string.IsNullOrWhiteSpace(s);
#elif JavaScript
            return s == null || s.Trim().Length == 0;
#endif
        }
    }
}
