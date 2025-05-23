﻿using System;
using System.Collections;
using System.Collections.Generic;

namespace AlphaTab;

partial class PrettyFormat
{
    public static IEnumerable<ArrayTuple<object?, object?>> MapAsUnknownIterable(object map)
    {
        if (map is IDictionary mapAsUnknownIterable)
        {
            foreach (DictionaryEntry v in mapAsUnknownIterable)
            {
                yield return new ArrayTuple<object?, object?>(v.Key, v.Value);
            }
        }
        else
        {
            throw new ArgumentException("Provided value was no map", nameof(map));
        }
    }
}
