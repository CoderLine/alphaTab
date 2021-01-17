using System;
using System.Collections;
using System.Collections.Generic;
using System.Runtime.CompilerServices;

namespace AlphaTab.Core.EcmaScript
{
    public class Set<T> : IEnumerable<T>
    {
        private readonly HashSet<T> _data;

        public Set()
        {
            _data = new HashSet<T>();
        }

        public Set(IEnumerable<T> values)
        {
            _data = new HashSet<T>(values);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public void Add(T item)
        {
            _data.Add(item);
        }


        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public bool Has(T item)
        {
            return _data.Contains(item);
        }

        public void ForEach(Action<T> action)
        {
            foreach (var i in _data)
            {
                action(i);
            }
        }

        public IEnumerator<T> GetEnumerator()
        {
            return _data.GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }
    }
}
