using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AlphaTab.IO;
using Haxe.Js.Html;
using Phase;

namespace AlphaTab.Test
{
    class TestPlatform
    {
        public static IReadable CreateStringReader(string tex)
        {
            var buf = new ArrayBuffer(tex.Length * 2);
            var view = new Uint16Array(buf);
            for (int i = 0; i < tex.Length; i++)
            {
                view[i] = tex[i];
            }
            return ByteBuffer.FromBuffer(view.As<byte[]>());
        }

        public static byte[] LoadFile(string path)
        {
            return null;
        }

        public static string LoadFileAsString(string testfilesXmlGpifXml)
        {
            return null;
        }

        public static bool IsMatch(string value, string regex)
        {
            return Script.Write<bool>("new EReg(regex, \"\").match(value)");
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
