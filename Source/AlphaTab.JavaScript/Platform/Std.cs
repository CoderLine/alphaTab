/*
 * This file is part of alphaTab.
 * Copyright © 2017, Daniel Kuschny and Contributors, All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or at your option any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */
using System;
using System.Collections.Generic;
using System.Diagnostics;
using AlphaTab.Collections;
using AlphaTab.IO;
using AlphaTab.Util;
using AlphaTab.Xml;
using SharpKit.Html;
using SharpKit.JavaScript;
using Console = System.Console;

namespace AlphaTab.Platform
{
    public static partial class Std
    {
        public static float ParseFloat(string s)
        {
            return JsContext.parseFloat(s);
        }

        [JsMethod(InlineCodeExpression = "arguments.callee.caller.caller.name", Export = false)]
        public static extern string GetCallerName();

        public static void Log(LogLevel logLevel, string category, string msg, object details = null)
        {
            JsContext.JsCode("var stack = new Error().stack;");
            JsContext.JsCode("if(!stack) { try { throw new Error(); } catch(e) { stack = e.stack; } }");

            // ReSharper disable once RedundantAssignment
            msg = "[AlphaTab][" + category + "] " + msg;

            switch (logLevel)
            {
                case LogLevel.None:
                    break;
                case LogLevel.Debug:
                    JsContext.JsCode("console.debug(msg, details);");
                    break;
                case LogLevel.Info:
                    JsContext.JsCode("console.info(msg, details);");
                    break;
                case LogLevel.Warning:
                    JsContext.JsCode("console.warn(msg, details);");
                    break;
                case LogLevel.Error:
                    JsContext.JsCode("console.error(msg, stack, details);");
                    break;
            }
        }

        [JsMethod(InlineCodeExpression = "{}", Export = false)]
        public static extern dynamic NewObject();

        [JsMethod(InlineCodeExpression = "json && property in json", Export = false)]
        public static extern bool JsonExists(dynamic json, string property);

        [JsMethod(InlineCodeExpression = "Object.keys(json)", Export = false)]
        public static extern string[] JsonKeys(dynamic json);

        [JsMethod(InlineCodeExpression = "Math.log2(f)")]
        public static extern float Log2(float f);

        public static int ParseInt(string s)
        {
            var val = JsContext.parseInt(s);
            return JsContext.isNaN(val) ? int.MinValue : (int)val;
        }

        [JsMethod(InlineCodeExpression = "new Int32Array(array)")]
        public static int[] CloneArray(int[] array)
        {
            return new int[0];
        }

        [JsMethod(InlineCodeExpression = "dst.set(src.subarray(srcOffset, srcOffset + count), dstOffset)")]
        public static void BlockCopy(byte[] src, int srcOffset, byte[] dst, int dstOffset, int count)
        {
        }

        public static bool IsNullOrWhiteSpace(this string s)
        {
            return s == null || s.Trim().Length == 0;
        }

        [JsMethod(InlineCodeExpression = "String.fromCharCode(c)")]
        public static string StringFromCharCode(int c)
        {
            return "";
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

        [JsMethod(InlineCodeExpression = "(value instanceof T)", Export = false)]
        public static bool InstanceOf<T>(object value)
        {
            return true;
        }

        public static byte[] StringToByteArray(string contents)
        {
            var byteArray = new byte[contents.Length];
            for (int i = 0; i < contents.Length; i++)
            {
                byteArray[i] = (byte)contents[i];
            }
            return byteArray;
        }

        [JsMethod(InlineCodeExpression = "new Uint8Array(data)", Export = false)]
        public static byte[] ArrayBufferToByteArray(ArrayBuffer data)
        {
            return null;
        }

        private static string S4()
        {
            JsNumber num = JsMath.floor((1 + JsMath.random()) * 0x10000);
            return num.toString(16).substring(1);
        }

        public static string NewGuid()
        {
            return S4() + S4() + '-' + S4() + '-' + S4() + '-' +
                      S4() + '-' + S4() + S4() + S4();
        }

        [JsMethod(InlineCodeExpression = "o[s]", Export = false)]
        public static object Member(this object o, string s)
        {
            return null;
        }

        [JsMethod(InlineCodeExpression = "(e.exception instanceof T)")]
        public static bool IsException<T>(Exception e)
        {
            return false;
        }

        public static int Random(int max)
        {
            return JsMath.random() * max;
        }
    }
}
