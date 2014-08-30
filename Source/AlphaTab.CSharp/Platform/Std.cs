using System;
using System.Collections.Generic;
using System.Globalization;
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
            if (!Single.TryParse(s, NumberStyles.Float, CultureInfo.InvariantCulture, out f))
            {
                f = Single.NaN;
            }
            return f;
        }

        public static int ParseInt(int s)
        {
            return s;
        }
        public static int ParseInt(string s)
        {
            int f;
            if (!Int32.TryParse(s, NumberStyles.Integer, CultureInfo.InvariantCulture, out f))
            {
                f = 0;
            }
            return f;
        }

        public static void BlockCopy(ByteArray src, int srcOffset, ByteArray dst, int dstOffset, int count)
        {
            Buffer.BlockCopy(src.Data, srcOffset, dst.Data, dstOffset, count);
        }

        public static bool IsNullOrWhiteSpace(this string s)
        {
            return String.IsNullOrWhiteSpace(s);
        }

        public static string StringFromCharCode(int c)
        {
            return ((char)c).ToString();
        }

        public static void Foreach<T>(IEnumerable<T> e, Action<T> c)
        {
            foreach (var t in e)
            {
                c(t);
            }
        }

        public static XmlDocument LoadXml(string xml)
        {
            var dom = new XmlDocument();
            dom.LoadXml(xml);
            return dom;
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
            return n.Value;
        }

        public static sbyte ReadSignedByte(this IReadable readable)
        {
            return unchecked((sbyte)(byte)readable.ReadByte());
        }
    }
}
