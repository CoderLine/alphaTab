using System.Collections.Generic;
using AlphaTab.Model;

namespace AlphaTab.Core.Es2015
{
    public class Map<TKey, TValue> : Iterable<MapEntry<TKey, TValue>>
        where TValue : class
    {
        public Map()
        {
        }

        public Map(IEnumerable<MapEntry<TKey, TValue>> entries)
        {
            foreach (var entry in entries)
            {
                Set(entry.Key, entry.Value);
            }
        }

        public double Size { get; set; }

        public TValue? Get(TKey key)
        {
            throw new System.NotImplementedException();
        }

        public void Set(TKey key, TValue value)
        {
            throw new System.NotImplementedException();
        }

        public bool Has(TKey key)
        {
            throw new System.NotImplementedException();
        }

        public void Delete(TKey id)
        {
            throw new System.NotImplementedException();
        }

        public void Clear()
        {
            throw new System.NotImplementedException();
        }
    }


    public class ValueTypeMap<TKey, TValue> : Iterable<MapEntry<TKey, TValue>>
        where TValue : struct
    {
        public ValueTypeMap()
        {
        }

        public ValueTypeMap(IEnumerable<MapEntry<TKey, TValue>> entries)
        {
            foreach (var entry in entries)
            {
                Set(entry.Key, entry.Value);
            }
        }

        public double Size { get; set; }

        public TValue? Get(TKey key)
        {
            throw new System.NotImplementedException();
        }

        public void Set(TKey key, TValue value)
        {
            throw new System.NotImplementedException();
        }

        public bool Has(TKey key)
        {
            throw new System.NotImplementedException();
        }

        public void Delete(TKey id)
        {
            throw new System.NotImplementedException();
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
