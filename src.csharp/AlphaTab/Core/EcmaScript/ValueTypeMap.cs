using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace AlphaTab.Core.EcmaScript
{
    public class ValueTypeMap<TKey, TValue> : IEnumerable<MapEntry<TKey, TValue>>
        where TValue : struct
    {
        private readonly Dictionary<TKey, TValue> _data;

        public ValueTypeMap()
        {
            _data = new Dictionary<TKey, TValue>();
        }

        public ValueTypeMap(IEnumerable<MapEntry<TKey, TValue>> entries)
        {
            _data = entries.ToDictionary(e => e.Key, e => e.Value);
        }

        public double Size => _data.Count;

        public TValue? Get(TKey key)
        {
            if (_data.TryGetValue(key, out var value))
            {
                return value;
            }

            return null;
        }

        public void Set(TKey key, TValue value)
        {
            _data[key] = value;
        }

        public bool Has(TKey key)
        {
            return _data.ContainsKey(key);
        }

        public void Delete(TKey key)
        {
            _data.Remove(key);
        }

        public void Clear()
        {
            _data.Clear();
        }

        public IEnumerator<MapEntry<TKey, TValue>> GetEnumerator()
        {
            return _data.Select(d => new MapEntry<TKey, TValue>(d.Key, d.Value)).GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }

        public void ForEach(Action<TValue, TKey> callback)
        {
            foreach (var kvp in _data)
            {
                callback(kvp.Value, kvp.Key);
            }
        }
    }
}
