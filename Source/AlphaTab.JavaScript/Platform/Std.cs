using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
using System.Text.RegularExpressions;
using System.Xml;
using AlphaTab.Collections;
using AlphaTab.IO;

namespace AlphaTab.Platform
{
    public static partial class Std
    {
        public static float ParseFloat(string s)
        {
            float f;
            double d = double.Parse(s);
            if(double.IsNaN(d)) 
            {
                f = float.NaN;
            }
            else
            {
                f = (float)d;
            }
            return f;
        }

        public static int ParseInt(string s)
        {
            int f;
            if (!int.TryParse(s, out f))
            {
                f = 0;
            }
            return f;
        }

        [InlineCode("{dst}.set({src}.subarray({srcOffset}, {srcOffset} + {count}), {dstOffset})")]
        public static void BlockCopy(ByteArray src, int srcOffset, ByteArray dst, int dstOffset, int count)
        {
        }

        public static bool IsNullOrWhiteSpace(this string s)
        {
            return s == null || s.Trim().Length == 0;
        }

        [InlineCode("String.fromCharCode({c})")]
        public static string StringFromCharCode(int c)
        {
            return "";
        }

        public static void Foreach<T>(IEnumerable<T> e, Action<T> c)
        {
            JsForeach(e, c);
        }

        [InlineCode("for ( var t in {e} ) {c}({e}[t]);")]
        private static void JsForeach<T>(IEnumerable<T> e, Action<T> c)
        {
        }

        public static XmlDocument LoadXml(string xml)
        {
            return XmlDocumentParser.Parse(xml);
        }

        public static string GetNodeValue(XmlNode n)
        {
            if (n.NodeType == XmlNodeType.Element || n.NodeType == XmlNodeType.Document)
            {
                var txt = new StringBuilder();
                foreach (XmlNode childNode in n.ChildNodes)
                {
                    txt.Append(GetNodeValue(childNode));
                }
                return txt.ToString().Trim();
            }
            return n.NodeValue;
        }

        public static sbyte ReadSignedByte(this IReadable readable)
        {
            var n = readable.ReadByte();
            if (n >= 128) return (sbyte)(n - 256);
            return (sbyte)n;
        }
    }
}
