/*
 * This file is part of alphaTab.
 * Copyright (c) 2014, Daniel Kuschny and Contributors, All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or at your option any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */
using System;
using java.util;

namespace AlphaTab.Collections
{
    /// <summary>
    /// This is an improved list which is also optimized for the JavaScript platform. 
    /// </summary>
    public class FastList<T>
    {
        private ArrayList<object> _list;

        public FastList()
        {
            _list = new ArrayList<object>();
        }

        public int Count
        {
            get { return _list.size(); }
        }

        public T this[int index]
        {
            get { return (T)_list.get(index); }
            set { _list.set(index, value); }
        }

        public void Add(T item)
        {
            _list.add(item);
        }

        public void AddRange(T[] data)
        {
            _list.addAll((Collection<object>)Arrays.asList(data));
        }

        public T[] ToArray()
        {
            return _list.toArray(new T[_list.size()]);
        }

        public void RemoveAt(int index)
        {
            _list.remove(index);
        }

        public void Sort(Comparison<T> func)
        {
            java.util.Collections.sort(_list, new ComparisonComparator<T>(func));
        }

        public void Insert(int index, T item)
        {
            _list.add(index, item);
        }

        public void Reverse()
        {
            java.util.Collections.reverse(_list);
        }

        public FastList<T> Clone()
        {
            var clone = new FastList<T>();
            clone._list = (ArrayList<object>)_list.clone();
            return new FastList<T>();
        }
    }

    public class ComparisonComparator<T> : Comparator<object>
    {
        private readonly Comparison<T> _func;

        public ComparisonComparator(Comparison<T> func)
        {
            _func = func;
        }

        public int compare(object prm1, object prm2)
        {
            return _func((T)prm1, (T)prm2);
        }

        public bool @equals(object prm1)
        {
            return Equals(prm1);
        }
    }
}
