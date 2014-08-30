using System;
using System.Collections.Generic;
using System.Globalization;
using System.Runtime.CompilerServices;
using AlphaTab.IO;

namespace AlphaTab.Platform
{
    public static partial class Std
    {
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

        public static string ToHexString(int n)
        {
            var s = "";
            const string hexChars = "0123456789ABCDEF";
            do
            {
                s = StringFromCharCode((int)hexChars[(n & 15)]) + s;
                n >>= 4;
            } while (n > 0);
            return s;
        }

        public static ByteArray StringToByteArray(string contents)
        {
            var byteArray = new ByteArray(contents.Length);
            for (int i = 0; i < contents.Length; i++)
            {
                byteArray[i] = (byte) contents.CharCodeAt(i);
            }
            return byteArray;
        }
    }
}
