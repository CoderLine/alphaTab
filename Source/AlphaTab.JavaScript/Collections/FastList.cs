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

        [InlineCode("{this}.slice()")]
        public FastList<T> Clone()
        {
            return null;
        }
    }
}
