using System;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;
using AlphaTab.IO;

namespace AlphaTab.Test
{
    class TestPlatform
    {
        public static void Done()
        {
        }

        public static IReadable CreateStringReader(string tex)
        {
            return ByteBuffer.FromBuffer(Encoding.UTF8.GetBytes(tex));
        }

        public static void LoadFile(string fileName, Action<byte[]> loaded, bool autoDone = true)
        {
            loaded(File.ReadAllBytes(fileName));
            if (autoDone)
            {
                Done();
            }
        }

        public static void LoadFileAsString(string fileName, Action<string> loaded, bool autoDone = true)
        {
            loaded(File.ReadAllText(fileName));
            if (autoDone)
            {
                Done();
            }
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
