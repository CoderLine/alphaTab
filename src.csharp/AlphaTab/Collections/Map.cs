using System.Collections.Generic;
using System.Linq;

namespace AlphaTab.Collections
{
    public interface IMap
    {
        double Size { get; }
        void Clear();
    }
    public interface IMap<TKey, TValue> : IMap, IEnumerable<MapEntry<TKey, TValue>>
        where TValue : class?
    {
        IEnumerable<TKey> Keys();
        IEnumerable<TValue> Values();
        bool Has(TKey key);
        TValue Get(TKey key);
        void Set(TKey key, TValue value);
        void Delete(TKey key);
    }

    public class Map<TKey, TValue> : Dictionary<TKey, TValue>, IMap<TKey, TValue>
        where TValue : class?
    {
        public double Size => Count;
        IEnumerable<TKey> IMap<TKey, TValue>.Keys()
        {
            return base.Keys;
        }

        IEnumerable<TValue> IMap<TKey, TValue>.Values()
        {
            return base.Values;
        }

        public Map()
        {
        }

        public Map(IEnumerable<MapEntry<TKey, TValue>> entries)
        {
            foreach (var entry in entries)
            {
                this[entry.Key] = entry.Value;
            }
        }
        public Map(IEnumerable<KeyValuePair<TKey, TValue>> entries)
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

        public TValue Get(TKey key)
        {
            return this[key];
        }

        public void Set(TKey key, TValue value)
        {
            this[key] = value;
        }

        IEnumerator<MapEntry<TKey, TValue>> IEnumerable<MapEntry<TKey, TValue>>.GetEnumerator()
        {
            return ((IEnumerable<KeyValuePair<TKey, TValue>>) this).Select(kvp =>
                new MapEntry<TKey, TValue>(kvp)).GetEnumerator();
        }

        public void Delete(TKey key)
        {
            Remove(key);
        }
    }
}
