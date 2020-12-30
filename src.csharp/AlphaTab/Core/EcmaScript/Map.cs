using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace AlphaTab.Core.EcmaScript
{
    public abstract class Map
    {
    }

    public class Map<TKey, TValue> : Map, IEnumerable<MapEntry<TKey, TValue>>,
        IDictionary<TKey, TValue>
        where TValue : class?
    {
        private readonly Dictionary<TKey, TValue> _data;

        public Map()
        {
            _data = new Dictionary<TKey, TValue>();
        }

        public Map(IEnumerable<MapEntry<TKey, TValue>> entries)
        {
            _data = entries.ToDictionary(e => e.Key, e => e.Value);
        }

        public double Size => _data.Count;

        public TValue Get(TKey key)
        {
            if (_data.TryGetValue(key, out var value))
            {
                return value;
            }

#pragma warning disable 8653
            return default;
#pragma warning restore 8653
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

        void ICollection<KeyValuePair<TKey, TValue>>.Add(KeyValuePair<TKey, TValue> item)
        {
            ((ICollection<KeyValuePair<TKey, TValue>>) _data).Add(item);
        }

        public void Clear()
        {
            _data.Clear();
        }

        bool ICollection<KeyValuePair<TKey, TValue>>.Contains(KeyValuePair<TKey, TValue> item)
        {
            return ((ICollection<KeyValuePair<TKey, TValue>>) _data).Contains(item);
        }

        void ICollection<KeyValuePair<TKey, TValue>>.CopyTo(KeyValuePair<TKey, TValue>[] array,
            int arrayIndex)
        {
            ((ICollection<KeyValuePair<TKey, TValue>>) _data).CopyTo(array, arrayIndex);
        }

        bool ICollection<KeyValuePair<TKey, TValue>>.Remove(KeyValuePair<TKey, TValue> item)
        {
            return ((ICollection<KeyValuePair<TKey, TValue>>) _data).Remove(item);
        }

        int ICollection<KeyValuePair<TKey, TValue>>.Count =>
            ((ICollection<KeyValuePair<TKey, TValue>>) _data).Count;

        bool ICollection<KeyValuePair<TKey, TValue>>.IsReadOnly =>
            ((ICollection<KeyValuePair<TKey, TValue>>) _data).IsReadOnly;

        IEnumerator<KeyValuePair<TKey, TValue>> IEnumerable<KeyValuePair<TKey, TValue>>.
            GetEnumerator()
        {
            return ((IEnumerable<KeyValuePair<TKey, TValue>>) _data).GetEnumerator();
        }

        public IEnumerator<MapEntry<TKey, TValue>> GetEnumerator()
        {
            return _data.Select(d => new MapEntry<TKey, TValue>(d.Key, d.Value)).GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }

        public void ForEach(Action<TValue> callback)
        {
            foreach (var kvp in _data)
            {
                callback(kvp.Value);
            }
        }

        public void ForEach(Action<TValue, TKey> callback)
        {
            foreach (var kvp in _data)
            {
                callback(kvp.Value, kvp.Key);
            }
        }

        public IEnumerable<TKey> Keys()
        {
            return _data.Keys;
        }

        void IDictionary<TKey, TValue>.Add(TKey key, TValue value)
        {
            _data.Add(key, value);
        }

        bool IDictionary<TKey, TValue>.ContainsKey(TKey key)
        {
            return _data.ContainsKey(key);
        }

        bool IDictionary<TKey, TValue>.Remove(TKey key)
        {
            return _data.Remove(key);
        }

        bool IDictionary<TKey, TValue>.TryGetValue(TKey key, out TValue value)
        {
            return _data.TryGetValue(key, out value);
        }

        TValue IDictionary<TKey, TValue>.this[TKey key]
        {
            get => _data[key];
            set => _data[key] = value;
        }

        ICollection<TKey> IDictionary<TKey, TValue>.Keys => _data.Keys;

        ICollection<TValue> IDictionary<TKey, TValue>.Values => _data.Values;

        public IEnumerable<TValue> Values()
        {
            return _data.Values;
        }
    }
}
