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

using System.Collections;
using System.Collections.Generic;
using System.Runtime.CompilerServices;

namespace AlphaTab.Collections
{
    public class FastDictionary<TKey, TValue> : IEnumerable<TKey>
    {
        private readonly Dictionary<TKey, TValue> _dictionary;

        public FastDictionary()
        {
            _dictionary = new Dictionary<TKey, TValue>();
        }

        [IndexerName("Item")]
        public TValue this[TKey index]
        {
            get { return _dictionary[index]; }
            set { _dictionary[index] = value; }
        }

        public int Count
        {
            get { return _dictionary.Count; }
        }

        public IEnumerator<TKey> GetEnumerator()
        {
            return _dictionary.Keys.GetEnumerator();
        }

        public void Remove(TKey key)
        {
            _dictionary.Remove(key);
        }

        public bool ContainsKey(TKey key)
        {
            return _dictionary.ContainsKey(key);
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }
    }
}
