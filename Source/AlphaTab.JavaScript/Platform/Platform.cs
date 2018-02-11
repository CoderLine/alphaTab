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
using AlphaTab.Collections;
using AlphaTab.Haxe.Js;
using AlphaTab.IO;
using AlphaTab.Util;
using Haxe;
using Haxe.Js.Html;
using Phase;
using Phase.Attributes;

namespace AlphaTab.Platform
{
    public static partial class Platform
    {
        [Inline]
        public static float ParseFloat(string s)
        {
            return Script.Write<float>("untyped parseFloat(s)");
        }

        [Inline]
        public static string GetCallerName()
        {
            return Script.Write<string>("untyped __js__(\"arguments.callee.caller.caller.name\")");
        }

        public static void Log(LogLevel logLevel, string category, string msg, object details = null)
        {
            var stack = CallStack.ToString(CallStack.Get());

            // ReSharper disable once RedundantAssignment
            msg = "[AlphaTab][" + category + "] " + msg;

            Haxe.Js.Html.Console console = Lib.Global.console;

            switch (logLevel)
            {
                case LogLevel.None:
                    break;
                case LogLevel.Debug:
                    console.Debug(msg, details);
                    break;
                case LogLevel.Info:
                    console.Info(msg, details);
                    break;
                case LogLevel.Warning:
                    console.Warn(msg, details);
                    break;
                case LogLevel.Error:
                    console.Error(msg, stack, details);
                    break;
            }
        }

        [Inline]
        public static dynamic NewObject()
        {
            return Script.Write<dynamic>("untyped __js__(\"{}\")");
        }

        [Inline]
        public static bool JsonExists(object json, string property)
        {
            return Script.Write<bool>("untyped __js__(\"({0} && {1} in {0})\", json, property)");
        }

        [Inline]
        public static string[] JsonKeys(object json)
        {
            return Script.Write<string[]>("untyped __js__(\"Object.keys({0})\", json)");
        }

        [Inline]
        public static float Log2(float f)
        {
            return Script.Write<float>("untyped Math.log2(f)");
        }

        public static int ParseInt(string s)
        {
            var val = Script.Write<int>("untyped parseInt(s)");
            return Script.Write<bool>("Math.isNaN(untyped val)") ? int.MinValue : (int)val;
        }

        [Inline]
        public static int[] CloneArray(int[] array)
        {
            return Script.Write<int[]>("untyped __js__(\"new Int32Array({0})\", array)");
        }

        [Inline]
        public static void BlockCopy(byte[] src, int srcOffset, byte[] dst, int dstOffset, int count)
        {
            for (int i = 0; i < count; i++)
            {
                dst[dstOffset + i] = src[srcOffset + i];
            }
        }

        [Inline]
        public static string StringFromCharCode(int c)
        {
            return Script.Write<string>("String.fromCharCode(c.ToHaxeInt())");
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
                byteArray[i] = (byte)contents[i];
            }
            return byteArray;
        }

        private static string S4()
        {
            return Script.Write<string>("untyped Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)");
        }

        public static string NewGuid()
        {
            return S4() + S4() + '-' + S4() + '-' + S4() + '-' +
                      S4() + '-' + S4() + S4() + S4();
        }

        [Inline]
        public static T Member<T>(this object s, string name)
        {
            return Script.Write<T>("untyped s[name]");
        }

        [Inline]
        public static T Member<T>(this object s, string name, T value)
        {
            return Script.Write<T>("untyped s[name] = value");
        }

        [Inline]
        public static string[] Match(this string s, string regex)
        {
            return Script.Write<string[]>("untyped s.match(regex)");
        }
        [Inline]
        public static bool IsTruthy(this object o)
        {
            return Script.Write<bool>("untyped !!o");
        }

        [Inline]
        public static bool IsNaN(float v)
        {
            return Script.Write<bool>("Math.isNaN(v.ToHaxeFloat())");
        }

        [Inline]
        public static string TypeOf(object o)
        {
            return Script.Write<string>("untyped __typeof__(o)");
        }

        [External]
        [Template("untyped __instanceof__({o}, {T})")]
        public static extern bool InstanceOf<T>(object o);

        [Inline]
        public static byte[] ArrayBufferToByteArray(ArrayBuffer data)
        {
            return Script.Write<byte[]>("untyped __js__(\"new Uint8Array({0})\", data)");
        }

        public static double ToDouble(byte[] bytes)
        {
            var array = new Float64Array(Script.Write<ArrayBuffer>("untyped __js__(\"{0}.buffer\", bytes)"));
            return array[0];
        }
    }
}
