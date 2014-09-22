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
