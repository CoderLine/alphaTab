using System;
using AlphaTab.Collections;
using AlphaTab.IO;
using Haxe.Js.Html;
using Phase;
using Phase.Attributes;

namespace AlphaTab.Test
{
    internal class TestPlatform
    {
        public static Action Done;

        public static IReadable CreateStringReader(string tex)
        {
            var buf = new ArrayBuffer(tex.Length * 2);
            var view = new Uint16Array(buf);
            for (var i = 0; i < tex.Length; i++)
            {
                view[i] = tex[i];
            }
            return ByteBuffer.FromBuffer(view.As<byte[]>());
        }

        public static void LoadFile(string path, Action<byte[]> loaded, bool autoDone = true)
        {
            var x = new XMLHttpRequest();
            x.Open("GET", "/base/" + path, true);
            x.ResponseType = XMLHttpRequestResponseType.ARRAYBUFFER;
            x.OnReadyStateChange = new Action(() =>
            {
                if (x.ReadyState == XMLHttpRequest.DONE)
                {
                    ArrayBuffer ab = x.Response;
                    var data = new Uint8Array(ab);
                    loaded(Script.Write<byte[]>("untyped data"));
                    if (autoDone)
                    {
                        Done();
                    }
                }
            });
            x.Send();
        }

        public static void LoadFileAsString(string path, Action<string> loaded, bool autoDone = true)
        {
            LoadFile(path, data => { loaded(Platform.Platform.ToString(data, "UTF-8")); }, autoDone);
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

        public static void CompareVisualResult(float totalWidth, float totalHeight, FastList<object> result, string referenceImageFileName, byte[] referenceFileData)
        {
        }
    }
}
