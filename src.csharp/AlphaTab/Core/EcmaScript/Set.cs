using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;

namespace AlphaTab.Core.EcmaScript
{
    public class Set<T>
    {
        private readonly HashSet<T> _data = new HashSet<T>();

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
    }
}
