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
using System.Collections.Generic;
using java.util;

namespace AlphaTab.Collections
{
    public class FastDictionary<TKey, TValue>
    {
        private readonly Map<TKey, TValue> _map;
  
        public FastDictionary()
        {
            _map = new HashMap<TKey, TValue>();
        }

        public TValue this[TKey key]
        {
            get { return _map.get(key); }
            set { _map.put(key, value); }
        }

        public string[] Keys
        {
            get
            {
                return _map.keySet().toArray(new string[0]);
            }
        }

        public IEnumerable<TValue> Values
        {
            get
            {
                return _map.values();
            }
        }

        public int Count
        {
            get
            {
                return _map.size();
            }
        }

        public void Remove(TKey key)
        {
            _map.remove(key);
        }

        public bool ContainsKey(TKey key)
        {
            return _map.containsKey(key);
        }
    }
}
