using System.Collections;
using System.Collections.Generic;
using Phase;
using Phase.Attributes;

namespace AlphaTab.Collections
{
    [Abstract("Dynamic")]
    [ForeachMode(ForeachMode.GetEnumerator)]
    public class FastDictionary<TKey, TValue> : IEnumerable<TKey>
    {
        [Inline]
        public FastDictionary()
        {
            Script.AbstractThis = Platform.Platform.NewObject();
        }

        public TValue this[TKey index]
        {
            [Inline] get => Script.Write<TValue>("untyped this[index]");
            [Inline] set => Script.Write<TValue>("untyped this[index] = value");
        }

        public int Count
        {
            [Inline] get => Platform.Platform.JsonKeys(Script.AbstractThis).Length;
        }

        [Inline]
        public IEnumerator<TKey> GetEnumerator()
        {
            return Platform.Platform.JsonKeys(Script.AbstractThis).As<IEnumerator<TKey>>();
        }

        [Inline]
        public void Remove(TKey key)
        {
            Script.Write("untyped __js__(\"delete {0}[{1}]\", this, key);");
        }

        [Inline]
        public bool ContainsKey(TKey key)
        {
            return Script.Write<bool>("untyped this.hasOwnProperty(key)");
        }

        [External]
        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }
    }
}
