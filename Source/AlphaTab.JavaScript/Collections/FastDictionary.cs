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
using Phase;
using Phase.Attributes;

namespace AlphaTab.Collections
{
    [Abstract("Dynamic")]
    [ForeachMode(ForeachMode.GetEnumerator)]
    public class FastDictionary<TKey, TValue> : IEnumerable<TKey>
    {
        [Inline]
        public FastDictionary() => Script.AbstractThis = Platform.Platform.NewObject();

        public TValue this[TKey index]
        {
            [Inline]
            get  => Script.Write<TValue>("untyped this[index]");
            [Inline]
            set => Script.Write<TValue>("return untyped this[index] = value");
        }

        public int Count
        {
            [Inline]
            get => Platform.Platform.JsonKeys(Script.AbstractThis).Length; 
        }

        [Inline]
        public IEnumerator<TKey> GetEnumerator() => Platform.Platform.JsonKeys(Script.AbstractThis).As<IEnumerator<TKey>>();
        [Inline]
        public void Remove(TKey key) => Script.Write("untyped __js__(\"delete {0}[{1}]\", this, index)");
        [Inline]
        public bool ContainsKey(TKey key) => Script.Write<bool>("untyped this.hasOwnProperty(key)");

        [External]
        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }
    }
}
