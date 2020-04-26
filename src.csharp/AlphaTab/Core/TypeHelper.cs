using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
using AlphaTab.Core.Es2015;

namespace AlphaTab.Core
{
    internal static class TypeHelper
    {
        public static IList<T> CreateList<T>(params T[] values)
        {
            return new List<T>(values);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static string Substring(this string s, double start, double length)
        {
            return s.Substring((int) start, (int) length);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static string Substr(this string s, double start, double end)
        {
            return s.Substring((int) start, (int) (end - start));
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static string Substr(this string s, double start)
        {
            return s.Substring((int) start);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static int CharCodeAt(this string s, double index)
        {
            return s[(int) index];
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static string ToLowerCase(this string s)
        {
            return s.ToLowerInvariant();
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static string ToUpperCase(this string s)
        {
            return s.ToUpperInvariant();
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static IList<string> Split(this string s, string separator)
        {
            throw new NotImplementedException();
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static string Join(this string[] s, string separator = ",")
        {
            return string.Join(separator, s);
        }

        public static string TypeOf(object obj)
        {
            throw new NotImplementedException();
        }

        public static MapEntry<double, TValue> CreateMapEntry<TValue>(int key, TValue value)
        {
            return new MapEntry<double, TValue>(key, value);
        }

        public static MapEntry<TKey, double> CreateMapEntry<TKey>(TKey key, int value)
        {
            return new MapEntry<TKey, double>(key, value);
        }

        public static MapEntry<TKey, TValue> CreateMapEntry<TKey, TValue>(TKey key, TValue value)
        {
            return new MapEntry<TKey, TValue>(key, value);
        }

        public static bool In(string key, object obj)
        {
            throw new NotImplementedException();
        }

        public static string ToString(this double num, int radix)
        {
            throw new NotImplementedException();
        }
    }
}
