using System;
using System.Collections.Generic;
using System.Xml;
using AlphaTab.Collections;
using AlphaTab.IO;
using ByteBuffer = java.nio.ByteBuffer;

namespace AlphaTab.Platform
{
    public static partial class Std
    {
        public static float ParseFloat(string s)
        {
            float f;
            double d = double.Parse(s);
            if (double.IsNaN(d))
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

        public static void BlockCopy(byte[] src, int srcOffset, byte[] dst, int dstOffset, int count)
        {
            BlockCopy(src, srcOffset, dst, dstOffset, count);
        }

        public static void BlockCopy(ByteBuffer src, int srcPos, ByteBuffer dst, int dstPos, int length)
        {
            if (src.hasArray() && dst.hasArray())
            {
                java.lang.System.arraycopy(src.array(),
                                 src.arrayOffset() + srcPos,
                                 dst.array(),
                                 dst.arrayOffset() + dstPos,
                                 length);
            }
            else
            {
                if (src.limit() - srcPos < length || dst.limit() - dstPos < length)
                    throw new java.lang.IndexOutOfBoundsException();

                for (int i = 0; i < length; i++)
                    // TODO: ByteBuffer.put is polymorphic, and might be slow here
                    dst.put(dstPos++, src.get(srcPos++));
            }
        }

        public static bool IsNullOrWhiteSpace(this string s)
        {
            return s == null || s.Trim().Length == 0;
        }

        public static string StringFromCharCode(int c)
        {
            return new java.lang.String(new [] {c}, 0, 1);
        }

        public static void Foreach<T>(IEnumerable<T> e, Action<T> c)
        {
            foreach (var i in e)
            {
                c(i);
            }
        }

        public static XmlDocument LoadXml(string xml)
        {
            XmlDocument document = new XmlDocument();
            document.LoadXml(xml);
            return document;
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
            var n = readable.ReadByte();
            if (n >= 128) return (sbyte)(n - 256);
            return (sbyte)n;
        }

        public static string ToString(byte[] data)
        {
            var s = new StringBuilder();
            int i = 0;
            while (i < data.Length)
            {
                var c = data[i++];
                if (c < 0x80)
                {
                    if (c == 0) break;
                    s.AppendChar(c);
                }
                else if (c < 0xE0)
                {
                    s.AppendChar(((c & 0x3F) << 6) | (data[i++] & 0x7F));
                }
                else if (c < 0xF0)
                {
                    s.AppendChar(((c & 0x1F) << 12) | ((data[i++] & 0x7F) << 6) | (data[i++] & 0x7F));
                }
                else
                {
                    var u = ((c & 0x0F) << 18) | ((data[i++] & 0x7F) << 12) |
                            ((data[i++] & 0x7F) << 6) | (data[i++] & 0x7F);
                    s.AppendChar((u >> 18) + 0xD7C0);
                    s.AppendChar((u & 0x3FF) | 0xDC00);
                }
            }
            return s.ToString();
        }


        public static byte[] StringToByteArray(string contents)
        {
            var byteArray = new byte[contents.Length];
            for (int i = 0; i < contents.Length; i++)
            {
                byteArray[i] = (byte) contents[i];
            }
            return byteArray;
        }

        public static bool InstanceOf<T>(object obj)
        {
            return obj is T;
        }
    }
}
