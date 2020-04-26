using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace AlphaTab.Core.EcmaScript
{
    public class Map<TKey, TValue> : IEnumerable<MapEntry<TKey, TValue>>
        where TValue : class
    {
        private readonly Dictionary<TKey, TValue> _data;

        public Map()
        {
            _data = new Dictionary<TKey, TValue>();
        }

        public Map(IEnumerable<MapEntry<TKey, TValue>> entries)
        {
            foreach (var entry in entries)
            {
                Set(entry.Key, entry.Value);
            }
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
    }


    public class MapEntry<TKey, TValue>
    {
        public TKey Key { get; set; }
        public TValue Value { get; set; }

        public MapEntry(TKey key, TValue value)
        {
            Key = key;
            Value = value;
        }

        public dynamic this[int index]
        {
            get { return index == 0 ? (object) Key : Value; }
        }
    }
}
