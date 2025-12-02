using System.Collections.Generic;

namespace AlphaTab.Collections;

public struct MapEntry<TKey, TValue>
{
    public TKey Key { get; set; }
    public TValue Value { get; set; }

    public MapEntry(TKey key, TValue value)
    {
        Key = key;
        Value = value;
    }

    public MapEntry(KeyValuePair<TKey, TValue> kvp)
    {
        Key = kvp.Key;
        Value = kvp.Value;
    }

    public void Deconstruct(out TKey key, out TValue value)
    {
        key = Key;
        value = Value;
    }
}