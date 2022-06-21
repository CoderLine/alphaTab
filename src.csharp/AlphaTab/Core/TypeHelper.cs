using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Runtime.CompilerServices;
using AlphaTab.Core.EcmaScript;

namespace AlphaTab.Core
{
    internal static class TypeHelper
    {
        public static IList<T> CreateList<T>(params T[] values)
        {
            return new List<T>(values);
        }

        public static IList<T> Splice<T>(this IList<T> data, double start, double deleteCount)
        {
            var items = data.GetRange((int) start, (int) deleteCount);
            data.RemoveRange((int) start, (int) deleteCount);
            return new List<T>(items);
        }

        public static IList<T> Splice<T>(this IList<T> data, double start, double deleteCount,
            params T[] newItems)
        {
            var items = data.GetRange((int) start, (int) deleteCount);
            data.RemoveRange((int) start, (int) deleteCount);
            data.InsertRange((int) start, newItems);

            return new List<T>(items);
        }

        public static IList<T> Slice<T>(this IList<T> data)
        {
            return new AlphaTab.Collections.List<T>(data);
        }

        public static void Reverse<T>(this IList<T> data)
        {
            if (data is List<T> l)
            {
                l.Reverse();
            }
            else if (data is T[] array)
            {
                System.Array.Reverse(array);
            }
            else
            {
                throw new NotSupportedException("Cannot reverse list of type " +
                                                data.GetType().FullName);
            }
        }

        public static IList<T> Slice<T>(this IList<T> data, double start)
        {
            return new List<T>(data.GetRange((int) start, data.Count - (int) start));
        }

        public static IList<T> GetRange<T>(this IList<T> data, int index, int count)
        {
            if (data is List<T> l)
            {
                return l.GetRange(index, count);
            }

            var newList = new List<T>();
            newList.InsertRange(0, data.Skip(index).Take(count));
            return newList;
        }

        public static void RemoveRange<T>(this IList<T> data, int index, int count)
        {
            if (data is List<T> l)
            {
                l.RemoveRange(index, count);
            }
            else
            {
                while (count > 0 && index >= data.Count)
                {
                    data.RemoveAt(index);
                    count--;
                }
            }
        }

        public static string Join<T>(this IList<T> data, string separator)
        {
            return string.Join(separator, data);
        }

        public static IList<T> Filter<T>(this IList<T> data, Func<T, bool> func)
        {
            return data.Where(func).ToList();
        }

        public static void Unshift<T>(this IList<T> data, T item)
        {
            data.Insert(0, item);
        }

        public static T Pop<T>(this IList<T> data)
        {
            if (data.Count > 0)
            {
                var last = data.Last();
                data.RemoveAt(data.Count - 1);
                return last;
            }

#pragma warning disable 8653
            return default;
#pragma warning restore 8653
        }


        public static IList<T> Fill<T>(this IList<T> data, T i)
        {
            for (var j = 0; j < data.Count; j++)
            {
                data[j] = i;
            }

            return data;
        }

        public static void InsertRange<T>(this IList<T> data, int index, IEnumerable<T> newItems)
        {
            if (data is System.Collections.Generic.List<T> l)
            {
                l.InsertRange(index, newItems);
            }
            else
            {
                foreach (var item in newItems)
                {
                    data.Insert(index, item);
                    index++;
                }
            }
        }

        public static IList<T> Sort<T>(this IList<T> data, Func<T, T, double> func)
        {
            switch (data)
            {
                case System.Collections.Generic.List<T> l:
                    l.Sort((a, b) => (int) func(a, b));
                    break;
                case T[] array:
                    System.Array.Sort(array, (a, b) => (int) func(a, b));
                    break;
                default:
                    throw new NotSupportedException("Cannot sort list of type " +
                                                    data.GetType().FullName);
            }

            return data;
        }
        public static void Sort<T>(this IList<T> data)
        {
            switch (data)
            {
                case System.Collections.Generic.List<T> l:
                    l.Sort();
                    break;
                case T[] array:
                    System.Array.Sort(array);
                    break;
                default:
                    throw new NotSupportedException("Cannot sort list of type " +
                                                    data.GetType().FullName);
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static TResult Reduce<TInput, TResult>(this IEnumerable<TInput> source, Func<TResult, TInput, TResult> func, TResult seed)
        {
            return source.Aggregate(seed, func);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static IList<TResult> Map<TInput, TResult>(this IEnumerable<TInput> source, Func<TInput, TResult> func)
        {
            return source.Select(func).ToList();
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static IList<TInput> Reversed<TInput>(this IList<TInput> source)
        {
            if (source is List<TInput> list)
            {
                list.Reverse();
                return list;
            }

            throw new ArgumentException("Unsupported type for in-place reversing");
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static string Join<TInput>(this IEnumerable<TInput> source, string separator)
        {
            return string.Join(separator, source);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static string Substr(this string s, double start, double length)
        {
            return s.Substring((int) start, (int) length);
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
        public static string CharAt(this string s, double index)
        {
            return s.Substring((int) index, 1);
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
        public static int LocaleCompare(this string a, string b)
        {
            return string.Compare(a, b, StringComparison.Ordinal);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static IList<string> Split(this string s, string separator)
        {
            return new List<string>(s.Split(new[] {separator}, StringSplitOptions.None));
        }

        public static KeyValuePair<double, TValue> CreateMapEntry<TValue>(int key, TValue value)
        {
            return new KeyValuePair<double, TValue>(key, value);
        }

        public static KeyValuePair<TKey, double> CreateMapEntry<TKey>(TKey key, int value)
        {
            return new KeyValuePair<TKey, double>(key, value);
        }

        public static KeyValuePair<TKey, TValue> CreateMapEntry<TKey, TValue>(TKey key, TValue value)
        {
            return new KeyValuePair<TKey, TValue>(key, value);
        }

        public static string ToInvariantString(this double num, int radix)
        {
            if (radix == 16)
            {
                return ((int) num).ToString("X");
            }

            return num.ToString(CultureInfo.InvariantCulture);
        }

        public static string ToInvariantString(this double num)
        {
            return num.ToString(CultureInfo.InvariantCulture);
        }

        public static string ToInvariantString(this int num)
        {
            return num.ToString(CultureInfo.InvariantCulture);
        }

        public static string ToInvariantString(this Enum num)
        {
            return ((IConvertible)num).ToInt32(CultureInfo.InvariantCulture).ToString(CultureInfo.InvariantCulture);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static RegExp CreateRegex(string pattern, string flags)
        {
            return new RegExp(pattern, flags);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static string Replace(this string input, RegExp pattern, string replacement)
        {
            return pattern.Replace(input, replacement);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static bool IsTruthy(string? s)
        {
            return !string.IsNullOrEmpty(s);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static bool IsTruthy(object? s)
        {
            return s != null;
        }
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static bool IsTruthy(bool? b)
        {
            return b.GetValueOrDefault();
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static bool IsTruthy(double s)
        {
            return !double.IsNaN(s) && s != 0;
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static IList<TResult> Map<TSource, TResult>(this IList<TSource> source,
            Func<TSource, TResult> func)
        {
            return source.Select(func).ToList();
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static IList<double> Map<TSource>(this IList<TSource> source,
            Func<TSource, int> func)
        {
            return source.Select(i => (double)func(i)).ToList();
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static string SubstringIndex(this string s, double startIndex)
        {
            return s.Substring((int) startIndex);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static string SubstringIndex(this string s, double startIndex, double endIndex)
        {
            return s.Substring((int) startIndex, (int) (endIndex - startIndex));
        }

        public static string TypeOf(object? actual)
        {
            switch (actual)
            {
                case string _:
                    return "string";
                case bool _:
                    return "boolean";
                case byte _:
                case short _:
                case int _:
                case long _:
                case sbyte _:
                case ushort _:
                case uint _:
                case ulong _:
                case float _:
                case double _:
                case Enum _:
                    return "number";
                case null:
                    return "undefined";
                default:
                    return "object";
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static IEnumerable<T> SetInitializer<T>(params T[] items)
        {
            return items;
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static IEnumerable<T> MapInitializer<T>(params T[] items)
        {
            return items;
        }
    }
}
