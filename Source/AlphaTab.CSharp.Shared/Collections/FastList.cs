/*
 * This file is part of alphaTab.
 * Copyright © 2017, Daniel Kuschny and Contributors, All rights reserved.
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
using System.Collections;
using System.Collections.Generic;
using System.Runtime.CompilerServices;

namespace AlphaTab.Collections
{
    public class FastList<T> : IEnumerable<T>
    {
        private readonly List<T> _list;
        public FastList()
        {
            _list = new List<T>();
        }

        private FastList(IEnumerable<T> collection)
        {
            _list = new List<T>(collection);
        }

        public int Count
        {
            get { return _list.Count; }
        }

        [IndexerName("Item")]
        public T this[int index]
        {
            get { return _list[index]; }
            set { _list[index] = value; }
        }

        public void Add(T item)
        {
            _list.Add(item);
        }

        public void Sort(Comparison<T> comparison)
        {
            _list.Sort(comparison);
        }

        public FastList<T> Clone()
        {
            return new FastList<T>(this);
        }

        public void RemoveAt(int index)
        {
            _list.RemoveAt(index);
        }

        public T[] ToArray()
        {
            return _list.ToArray();
        }

        public IEnumerator<T> GetEnumerator()
        {
            return _list.GetEnumerator();
        }

        public int IndexOf(T item)
        {
            return _list.IndexOf(item);
        }

        public void Reverse()
        {
            _list.Reverse();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }
    }
}
