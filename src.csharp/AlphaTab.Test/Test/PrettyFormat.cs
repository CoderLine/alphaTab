using System;
using System.Collections.Generic;
using AlphaTab.Collections;

namespace AlphaTab;

partial class PrettyFormat
{
    public static IEnumerable<ArrayTuple<object?, object?>> MapAsUnknownIterable(object map)
    {
        if (map is IMapBase mapAsUnknownIterable)
        {
            foreach (var v in mapAsUnknownIterable.UnknownEntries())
            {
                yield return v;
            }
        }
        else
        {
            throw new ArgumentException("Provided value was no map", nameof(map));
        }
    }
}
