using System.Collections.Generic;
using System.Runtime.CompilerServices;

namespace AlphaTab.Collections
{
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
        [InlineCode("{{}}")]
        public FastDictionary()
        {
        }

        [IntrinsicProperty]
        public TValue this[TKey key]
        {
            get
            {
                return default(TValue);
            }
            set
            {
            }
        }

        public string[] Keys
        {
            [InlineCode("Object.keys({this})")]
            get { return null; }
        }

        public IEnumerable<TValue> Values
        {
            [InlineCode("{this}")]
            get
            {
                return null;
            }
        }

        public int Count
        {
            [InlineCode("Object.keys({this}).length")]
            get
            {
                return 0;
            }
        }

        [InlineCode("delete {this}[{key}]")]
        public void Remove(TKey key)
        {
        }

        [InlineCode("{this}.hasOwnProperty({key})")]
        public bool ContainsKey(TKey key)
        {
            return false;
        }
    }
}
