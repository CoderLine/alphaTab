using System;
using System.Collections.Generic;
using System.Linq;
using AlphaTab.Collections;

namespace AlphaTab.Core.EcmaScript;

internal class Object
{
    public static IList<object> Values(System.Type type)
    {
        return type.IsEnum
            ? Enum.GetValues(type).Cast<int>().Select(v => (object)(double)v).ToArray()
            : throw new ArgumentException($"Type {type} is not an enum");
    }

    public static IEnumerable<ArrayTuple<TKey, TValue>> Entries<TKey, TValue>(
        Record<TKey, TValue> type)
    {
        return type.Select((MapEntry<TKey, TValue> e) =>
            new ArrayTuple<TKey, TValue>(e.Key, e.Value));
    }
}
