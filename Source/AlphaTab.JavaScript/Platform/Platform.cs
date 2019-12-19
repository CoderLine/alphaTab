﻿using System;
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
    [Name("js.html.TextDecoder")]
    [External]
    internal class TextDecoder
    {
        public extern TextDecoder(HaxeString label);

        [Name("decode")]
        public extern HaxeString Decode(ArrayBuffer data);

        [Name("decode")]
        public extern HaxeString Decode(ArrayBufferView data);
    }

    internal static partial class Platform
    {
        [Inline]
        public static float ParseFloat(string s)
        {
            return Script.Write<float>("untyped __js__(\"parseFloat({0})\", s)");
        }

        [Inline]
        public static int ParseHex(string s)
        {
            return Script.Write<int>("untyped __js__(\"parseInt({0}, 16)\", s)");
        }

        [Inline]
        public static string GetCallerName()
        {
            return Script.Write<string>("untyped __js__(\"arguments.callee.caller.caller.name\")");
        }

        public static bool EqualsAny(string value, string[] values)
        {
            foreach (var x in values)
            {
                if (value == x)
                {
                    return true;
                }
            }

            return false;
        }

        public static string FindStartsWith(string value, string[] values)
        {
            foreach (var x in values)
            {
                if (value.StartsWith(x))
                {
                    return x;
                }
            }

            return null;
        }

        public static void Log(LogLevel logLevel, string category, string msg, object details = null)
        {
            // ReSharper disable once RedundantAssignment
            msg = "[AlphaTab][" + category + "] " + msg;

            Haxe.Js.Html.Console console = Lib.Global.console;

            switch (logLevel)
            {
                case LogLevel.None:
                    break;
                case LogLevel.Debug:
                    msg = "[Debug]" + msg;
                    console.Debug(msg, details);
                    break;
                case LogLevel.Info:
                    msg = "[Info]" + msg;
                    console.Info(msg, details);
                    break;
                case LogLevel.Warning:
                    console.Warn(msg, details);
                    break;
                case LogLevel.Error:
                    var stack = CallStack.ToString(CallStack.Get());
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

        [Name("parseIntMinValue")]
        public static int ParseInt(string s)
        {
            var val = Script.Write<int>("untyped __js__(\"parseInt({0})\", s)");
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
            ArrayCopy(src, srcOffset, dst, dstOffset, count);
        }

        [Inline]
        public static string StringFromCharCode(int c)
        {
            return Script.Write<string>("String.fromCharCode(c.toHaxeInt())");
        }

        public static sbyte ReadSignedByte(this IReadable readable)
        {
            var n = readable.ReadByte();
            if (n >= 128)
            {
                return (sbyte)(n - 256);
            }

            return (sbyte)n;
        }

        public static string ToString(byte[] data, string encoding)
        {
            if (SupportsTextDecoder)
            {
                var detectedEncoding = DetectEncoding(data);
                if (detectedEncoding != null)
                {
                    encoding = detectedEncoding;
                }

                if (encoding == null)
                {
                    encoding = "utf-8";
                }

                var decoder = new TextDecoder(encoding);
                return decoder.Decode(data.As<ArrayBuffer>());
            }
            else
            {
                // manual UTF8 decoding for older browsers
                var s = new StringBuilder();
                var i = 0;
                while (i < data.Length)
                {
                    var c = data[i++];
                    if (c < 0x80)
                    {
                        if (c == 0)
                        {
                            break;
                        }

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
        }

        public static byte[] StringToByteArray(string contents)
        {
            var byteArray = new byte[contents.Length];
            for (var i = 0; i < contents.Length; i++)
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
        public static bool HasMember(this object s, string name)
        {
            return Script.Write<bool>("untyped __js__(\"{0} in {1}\", name, s)");
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
            return Script.Write<bool>("Math.isNaN(v.toHaxeFloat())");
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

        public static float ToFloat(byte[] bytes)
        {
            var array = new Float32Array(Script.Write<ArrayBuffer>("untyped __js__(\"{0}.buffer\", bytes)"));
            return array[0];
        }

        public static void ClearIntArray(int[] array)
        {
            for (var i = 0; i < array.Length; i++)
            {
                array[i] = 0;
            }
        }

        public static void ClearShortArray(short[] array)
        {
            for (var i = 0; i < array.Length; i++)
            {
                array[i] = 0;
            }
        }

        public static int Random(int max)
        {
            HaxeInt m = max;
            return Script.Write<int>("Std.int(Math.random() * m)");
        }

        [Inline]
        public static double RandomDouble()
        {
            return Script.Write<double>("Math.random()");
        }

        public static bool SupportsWebAudio
        {
            [Inline] get => Script.Write<bool>("untyped __js__(\"!!window.ScriptProcessorNode\")");
        }

        public static bool SupportsWebWorkers
        {
            [Inline] get => Script.Write<bool>("untyped __js__(\"!!window.Worker\")");
        }

        public static bool ForceFlash
        {
            [Inline] get => Script.Write<bool>("untyped __js__(\"!!window.ForceFlash\")");
        }


        public static bool SupportsTextDecoder
        {
            [Inline] get => !!Lib.Global.TextDecoder;
        }

        [Inline]
        public static void ArrayCopy(float[] src, int srcOffset, float[] dst, int dstOffset, int count)
        {
            Script.Write(
                "untyped __js__(\"{2}.set({0}.subarray({1},{1}+{4}), {3})\", src, srcOffset, dst, dstOffset, count);");
        }

        [Inline]
        public static void ArrayCopy(int[] src, int srcOffset, int[] dst, int dstOffset, int count)
        {
            Script.Write(
                "untyped __js__(\"{2}.set({0}.subarray({1},{1}+{4}), {3})\", src, srcOffset, dst, dstOffset, count);");
        }

        [Inline]
        public static void ArrayCopy(short[] src, int srcOffset, short[] dst, int dstOffset, int count)
        {
            Script.Write(
                "untyped __js__(\"{2}.set({0}.subarray({1},{1}+{4}), {3})\", src, srcOffset, dst, dstOffset, count);");
        }

        [Inline]
        public static void ArrayCopy(byte[] src, int srcOffset, byte[] dst, int dstOffset, int count)
        {
            Script.Write(
                "untyped __js__(\"{2}.set({0}.subarray({1},{1}+{4}), {3})\", src, srcOffset, dst, dstOffset, count);");
        }

        public static void ArrayCopy<T>(T[] src, int srcOffset, T[] dst, int dstOffset, int count)
        {
            for (var i = 0; i < count; i++)
            {
                dst[dstOffset + i] = src[srcOffset + i];
            }
        }

        [Inline]
        public static void Reverse(byte[] array)
        {
            Script.Write("untyped __js__(\"{0}.reverse()\", array);");
        }

        [Inline]
        public static string GetTypeName<T>(T obj)
        {
            return Script.Write<string>("Type.getClassName(Type.getClass(obj))");
        }

        public static Action Throttle(Action action, int delay)
        {
            var timeoutId = 0;
            return () =>
            {
                Browser.Window.ClearTimeout(timeoutId);
                timeoutId = Browser.Window.SetTimeout(action, delay);
            };
        }

        [Inline]
        public static long GetCurrentMilliseconds()
        {
            return Script.Write<long>("untyped __js__(\"Date.now()\")");
        }
    }
}
