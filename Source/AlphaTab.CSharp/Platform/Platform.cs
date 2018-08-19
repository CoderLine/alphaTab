/*
 * This file is part of alphaTab.
 * Copyright © 2018, Daniel Kuschny and Contributors, All rights reserved.
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
using System.Globalization;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.RegularExpressions;
using AlphaTab.Audio.Synth;
using AlphaTab.IO;
using AlphaTab.Util;
using AlphaTab.Xml;

namespace AlphaTab.Platform
{
    static partial class Platform
    {
        public static T As<T>(this object s)
        {
            return (T)s;
        }

        public static void Log(LogLevel logLevel, string category, string msg, object details = null)
        {
            Trace.WriteLine($"[AlphaTab][{category}][{logLevel}] {msg} {details}", "AlphaTab");
        }

        public static float ParseFloat(string s)
        {
            float f;
            if (!Single.TryParse(s, NumberStyles.Float, CultureInfo.InvariantCulture, out f))
            {
                f = Single.NaN;
            }
            return f;
        }

        public static float Log2(float s)
        {
            return (float)Math.Log(s, 2);
        }

        public static int ParseInt(string s)
        {
            float f;
            if (!float.TryParse(s, NumberStyles.Float, CultureInfo.InvariantCulture, out f))
            {
                return int.MinValue;
            }
            return (int)f;
        }

        public static int[] CloneArray(int[] array)
        {
            return (int[])array.Clone();
        }

        public static void BlockCopy(byte[] src, int srcOffset, byte[] dst, int dstOffset, int count)
        {
            Buffer.BlockCopy(src, srcOffset, dst, dstOffset, count);
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

        public static sbyte ReadSignedByte(this IReadable readable)
        {
            return unchecked((sbyte)(byte)readable.ReadByte());
        }

        public static string ToString(byte[] data, string encoding)
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

            Encoding enc;
            try
            {
                enc = Encoding.GetEncoding(encoding);
            }
            catch
            {
                enc = Encoding.UTF8;
            }
            return enc.GetString(data, 0, data.Length);
        }

        public static bool InstanceOf<T>(object value)
        {
            return value is T;
        }

        public static string NewGuid()
        {
            return Guid.NewGuid().ToString();
        }

        public static bool IsException<T>(Exception e)
        {
            return e is T;
        }

        private static readonly Random Rnd = new Random();

        public static int Random(int max)
        {
            return Rnd.Next(max);
        }

        public static double RandomDouble()
        {
            return Rnd.NextDouble();
        }

        public static double ToDouble(byte[] bytes)
        {
            return BitConverter.ToDouble(bytes, 0);
        }
        public static float ToFloat(byte[] bytes)
        {
            return BitConverter.ToSingle(bytes, 0);
        }

        public static void ClearIntArray(int[] array)
        {
            Array.Clear(array, 0, array.Length);
        }

        public static void ClearShortArray(short[] array)
        {
            Array.Clear(array, 0, array.Length);
        }

        public static void ArrayCopy<T>(T[] src, int srcOffset, T[] dst, int dstOffset, int count)
        {
            Array.Copy(src, srcOffset, dst, dstOffset, count);
        }

        public static void Reverse(byte[] array)
        {
            Array.Reverse(array);
        }

        public static long GetCurrentMilliseconds()
        {
            return Stopwatch.GetTimestamp();
        }
    }
}