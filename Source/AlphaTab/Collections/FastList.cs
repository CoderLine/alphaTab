using System;
using System.Collections;
using System.Collections.Generic;
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
#if !JavaScipt
        private readonly List<T> _store;
#endif

        [InlineCode("[]")]
        public FastList()
        {
            _store = new List<T>();
        }

        public int Count
        {
            [InlineCode("{this}.length")]
            get
            {
                return _store.Count;
            }
        }

        [IntrinsicProperty]
        public T this[int index]
        {
            get
            {
                return _store[index];
            }
            set
            {
                _store[index] = value;
            }
        }

        [ScriptName("push")]
        public void Add(T item)
        {
            _store.Add(item);
        }

        [InlineCode("({this} = {this}.concat({data}))")]
        public void AddRange(T[] data)
        {
            _store.AddRange(data);
        }

        [InlineCode("{this}.slice(0)")]
        public T[] ToArray()
        {
            return _store.ToArray();
        }

        [InlineCode("{this}.splice({index}, 1)")]
        public void RemoveAt(int index)
        {
            _store.RemoveAt(index);
        }

        [InlineCode("{this}.sort({func})")]
        public void Sort(Comparison<T> func)
        {
            _store.Sort(func);
        }

        [InlineCode("{this}.splice({index}, 0, {item})")]
        public void Insert(int index, T item)
        {
            _store.Insert(index, item);
        }

        public void Reverse()
        {
            _store.Reverse();
        }
    }
}
