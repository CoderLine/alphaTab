using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;

namespace AlphaTab.Collections
{
    public class FastDictionaryExtensions
    {
        public static object GetValues(object store)
        {
            return InternalGetValues(store);
        }

        [InlineCode("Object.keys({store}).map(function(k) {{ return {store}[k]; }})")]
        private static object InternalGetValues(object store)
        {
            return null;
        }
    }

    /// <summary>
    /// This is an improved dictionary which is also optimized for the JavaScript platform. 
    /// </summary>
    /// <typeparam name="TKey"></typeparam>
    /// <typeparam name="TValue"></typeparam>
    [IncludeGenericArguments(false)]
    [IgnoreNamespace]
    [Imported(ObeysTypeSystem = true)]
    [ScriptName("Object")]
    public class FastDictionary<TKey, TValue>
    {
        private readonly Dictionary<TKey, TValue> _store;

        [InlineCode("{{}}")]
        public FastDictionary()
        {
            _store = new Dictionary<TKey, TValue>();
        }

        [IntrinsicProperty]
        public TValue this[TKey key]
        {
            get
            {
                return _store[key];
            }
            set
            {
                _store[key] = value;
            }
        }

        public string[] Keys
        {
            [InlineCode("Object.keys({this})")]
            get
            {
                return _store.Keys.Select(k => k.ToString()).ToArray();
            }
        }

        public TValue[] Values
        {
            [InlineCode("{$AlphaTab.Collections.FastDictionaryExtensions}.getValues({this})")]
            get
            {
#if JavaScript
                return null;
#else
                return _store.Values.ToArray();
#endif
            }
        }
        
        public int Count
        {
            [InlineCode("Object.keys({this}).length")]
            get
            {
                return _store.Count;
            }
        }

        [InlineCode("delete {this}[{key}]")]
        public void Remove(TKey key)
        {
            _store.Remove(key);
        }

        [InlineCode("{this}.hasOwnProperty({key})")]
        public bool ContainsKey(TKey key)
        {
            return _store.ContainsKey(key);
        }
    }
}
