using System;
using System.Globalization;
using System.Runtime.CompilerServices;
using AlphaTab.IO;

namespace AlphaTab.Platform
{
    public static class Std
    {
        public static float ParseFloat(string s)
        {
            float f;
#if CSharp
            if (!Single.TryParse(s, NumberStyles.Float, CultureInfo.InvariantCulture, out f))
            {
                f = Single.NaN;
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
            if (!Int32.TryParse(s, NumberStyles.Integer, CultureInfo.InvariantCulture, out f))
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


        [InlineCode("{dst}.set({src}.subarray({srcOffset}, {srcOffset} + {count}), {dstOffset})")]
        public static void BlockCopy(ByteArray src, int srcOffset, ByteArray dst, int dstOffset, int count)
        {
            Buffer.BlockCopy(src.Data, srcOffset, dst.Data, dstOffset, count);
        }

        public static bool IsNullOrWhiteSpace(this string s)
        {
#if CSharp
            return String.IsNullOrWhiteSpace(s);
#elif JavaScript
            return s == null || s.Trim().Length == 0;
#endif
        }

        [InlineCode("String.fromCharCode({c})")]
        public static string StringFromCharCode(int c)
        {
            return ((char) c).ToString();
        }

        public static bool IsStringNumber(string s, bool allowSign = true)
        {
            if (s.Length == 0) return false;
            var c = s[0];
            return IsCharNumber(c, allowSign);
        }

        public static bool IsCharNumber(int c, bool allowSign = true)
        {
            return (allowSign && c == 0x2D) || (c >= 0x30 && c <= 0x39);
        }

        public static bool IsWhiteSpace(int c)
        {
            return c == 0x20 || c == 0x0B || c == 0x0D || c == 0x0A;
        }
    }
}
