using System;
using System.Runtime.CompilerServices;

namespace AlphaTab.Collections
{
    /// <summary>
    /// This is an improved list which is also optimized for the JavaScript platform. 
    /// </summary>
    [IncludeGenericArguments(false)]
    [IgnoreNamespace]
    [Imported(ObeysTypeSystem = true)]
    [ScriptName("Array")]
    public class FastList<T>
    {
        [InlineCode("[]")]
        public FastList()
        {
        }

        public int Count
        {
            [InlineCode("{this}.length")]
            get
            {
                return 0;
            }
        }

        [IntrinsicProperty]
        public T this[int index]
        {
            get
            {
                return default(T);
            }
            set
            {
            }
        }

        [ScriptName("push")]
        public void Add(T item)
        {
        }

        [InlineCode("({this} = {this}.concat({data}))")]
        public void AddRange(T[] data)
        {
        }

        [InlineCode("{this}.slice(0)")]
        public T[] ToArray()
        {
            return null;
        }

        [InlineCode("{this}.splice({index}, 1)")]
        public void RemoveAt(int index)
        {
        }

        [InlineCode("{this}.sort({func})")]
        public void Sort(Comparison<T> func)
        {
        }

        [InlineCode("{this}.splice({index}, 0, {item})")]
        public void Insert(int index, T item)
        {
        }

        public void Reverse()
        {
        }
    }
}
