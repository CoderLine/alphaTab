using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace AlphaTab.Core.EcmaScript;

internal static class Array
{
    public static bool IsArray(object? o)
    {
        return o is IList;
    }

    public static IList<T> From<T>(IEnumerable<T> x)
    {
        return x.ToList();
    }

    public static IList<T> From<T>(IEnumerator<T> x)
    {
        var list = new List<T>();
        foreach (var i in x)
        {
            list.Add(i);
        }
        return list;
    }
}
