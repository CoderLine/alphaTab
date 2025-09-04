using System.Collections.Generic;
using System.Linq;

namespace AlphaTab.Collections;

public interface IValueTypeMap<TKey, TValue> : IEnumerable<MapEntry<TKey, TValue>>
    where TValue : struct
{
    double Size { get; }
    IEnumerable<TKey> Keys();
    IEnumerable<TValue> Values();
    bool Has(TKey key);
    TValue? Get(TKey key);
    void Set(TKey key, TValue value);
    void Delete(TKey key);
    void Clear();
}

public class ValueTypeMap<TKey, TValue> : Dictionary<TKey, TValue>, IValueTypeMap<TKey, TValue>
    where TValue : struct
{
    public double Size => Count;
    IEnumerable<TKey> IValueTypeMap<TKey, TValue>.Keys()
    {
        return base.Keys;
    }

    IEnumerable<TValue> IValueTypeMap<TKey, TValue>.Values()
    {
        return base.Values;
    }

    public ValueTypeMap()
    {
    }

    public ValueTypeMap(IEnumerable<MapEntry<TKey, TValue>> entries)
    {
        foreach (var entry in entries)
        {
            this[entry.Key] = entry.Value;
        }
    }

    public ValueTypeMap(IEnumerable<ArrayTuple<TKey, TValue>> entries)
    {
        foreach (var entry in entries)
        {
            this[entry.V0] = entry.V1;
        }
    }

    public ValueTypeMap(IEnumerable<KeyValuePair<TKey, TValue>> entries)
    {
        foreach (var entry in entries)
        {
            this[entry.Key] = entry.Value;
        }
    }

    public bool Has(TKey key)
    {
        return ContainsKey(key);
    }

    public TValue? Get(TKey key)
    {
        if (TryGetValue(key, out var value))
        {
            return value;
        }

        return null;
    }

    public void Set(TKey key, TValue value)
    {
        this[key] = value;
    }

    public void Delete(TKey key)
    {
        Remove(key);
    }

    IEnumerator<MapEntry<TKey, TValue>> IEnumerable<MapEntry<TKey, TValue>>.GetEnumerator()
    {
        return ((IEnumerable<KeyValuePair<TKey, TValue>>) this).Select(kvp =>
            new MapEntry<TKey, TValue>(kvp)).GetEnumerator();
    }
}
