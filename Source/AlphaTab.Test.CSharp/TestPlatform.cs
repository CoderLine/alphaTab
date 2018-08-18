using System;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;
using AlphaTab.IO;

namespace AlphaTab.Test
{
    class TestPlatform
    {
        public static IReadable CreateStringReader(string tex)
        {
            return ByteBuffer.FromBuffer(Encoding.UTF8.GetBytes(tex));
        }

        public static byte[] LoadFile(string fileName)
        {
            return File.ReadAllBytes(fileName);
        }

        public static string LoadFileAsString(string fileName)
        {
            return File.ReadAllText(fileName);
        }

        public static bool IsMatch(string value, string regex)
        {
            return Regex.IsMatch(value, regex);
        }

        public static string ChangeExtension(string file, string extension)
        {
            var lastDot = file.LastIndexOf(".");
            if (lastDot == -1)
            {
                return file + extension;
            }
            else
            {
                return file.Substring(0, lastDot) + extension;
            }
        }
    }
}
