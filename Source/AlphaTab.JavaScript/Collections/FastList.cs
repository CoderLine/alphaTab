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
using Haxe;
using Phase;
using Phase.Attributes;

namespace AlphaTab.Collections
{
    [Abstract("Array<T>", "Array<T>", "Array<T>")]
    [ForeachMode(ForeachMode.GetEnumerator)]
    public class FastList<T> : IEnumerable<T>
    {
        [Inline]
        public FastList() => Script.AbstractThis = new HaxeArray<T>();

        public int Count
        {
            [Inline]
            get => Script.This<HaxeArray<T>>().Length;
        }

        public T this[int index]
        {
            [Inline]
            get => Script.This<HaxeArray<T>>()[index];
            [Inline]
            set => Script.This<HaxeArray<T>>()[index] = value; 
        }

        [Inline]
        public void Add(T item) => Script.This<HaxeArray<T>>().Push(item);


        [Inline]
        public void Sort(Comparison<T> comparison) => Script.This<HaxeArray<T>>().Sort((a, b) => comparison(a, b));

        [Inline]
        public FastList<T> Clone() => Script.This<HaxeArray<T>>().Slice(0).As<FastList<T>>();

        [Inline]
        public void RemoveAt(int index)
        {
            if (index != -1)
            {
                Script.This<HaxeArray<T>>().Splice(index, 1);
            }
        }

        [Inline]
        public T[] ToArray() => FixedArray<T>.FromArray(Script.This<HaxeArray<T>>()).As<T[]>();

        [Inline]
        public IEnumerator<T> GetEnumerator() => Script.AbstractThis.As<IEnumerator<T>>();

        [Inline]
        public int IndexOf(T item) => Script.This<HaxeArray<T>>().IndexOf(item);

        [Inline]
        public void Reverse() => Script.This<HaxeArray<T>>().Reverse();

        [Inline]
        public IEnumerable<T> ToEnumerable() => new IterableEnumerable<T>(this);

        [External]
        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }
    }
}
