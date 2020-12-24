using System;
using System.Collections.Generic;

namespace AlphaTab.Io
{
    partial class ReaderStackItem
    {
        private static IDictionary<string, object>? ObjectToMap(object? obj)
        {
            switch (obj)
            {
                case null:
                    return null;
                case IDictionary<string, object> d:
                    return d;
                default:
                    throw new ArgumentException("Can only handle IDictionary<string, object> in JsonReader");
            }
        }
    }
}
